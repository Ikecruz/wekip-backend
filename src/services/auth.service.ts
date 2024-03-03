import { PrismaClient } from "@prisma/client";
import database from "../database";
import { UserLoginDto, UserRegisterDto } from "../dtos/auth.dto";
import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from "../config";
import bcrypt from "bcrypt";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";
import { MailService } from "./mail.service";
import { TokenService } from "./token.service";

export class AuthService {

    private ormService: PrismaClient;
    private mailService: MailService;
    private tokenService: TokenService;

    constructor () {
        this.ormService = database.getClient();
        this.mailService = new MailService();
        this.tokenService = new TokenService();
    }

    public async registerUser(dto: UserRegisterDto) {

        const { email, password, username } = dto;

        const emailExists = await this.ormService.user.findFirst({
            where: {
                email
            }
        })

        if (emailExists) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST,
                "Email already exists"
            )
        }

        const usernameExists = await this.ormService.user.findFirst({
            where: {
                username
            }
        })

        if(usernameExists) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST, 
                'Username already taken'
            )
        }

        const alphanumericPattern = /^[a-z0-9]+$/
        if(!alphanumericPattern.test(username)) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST, 
                'Username must be alphanumeric'
            )
        }

        const hashedPassword = await this.hashPassword(password);

        await this.ormService.user.create({
            data: {
                email,
                password: hashedPassword,
                username
            }
        })

        await this.sendVerificationToken(email, true);

        return {message: "Signup successfully"}

    }

    public async loginUser (dto: UserLoginDto) {

        const { email, password, push_token } = dto

        const userFromDb = await this.ormService.user.findFirst({
            where: { email }
        })

        if (!userFromDb) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Invalid Credentials"
            )
        }

        const passwordsMatch = await this.passwordMatch(userFromDb.password, password);

        if (!passwordsMatch) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Invalid Credentials"
            )
        }
        
        if (!userFromDb.email_verified) {

            await this.sendVerificationToken(userFromDb.email)

            throw new HttpException(
                StatusCodes.CONFLICT,
                "Email not verified"
            )
        }

        // TODO: validate and update push token

        const token = this.signJwt(userFromDb.id)

        const { created_at, updated_at, password: filteredPassword, ...user } = userFromDb;

        return {
            user,
            token
        }

    }

    public async sendVerificationToken (email: string, newUser: boolean = false) {

        const user = await this.ormService.user.findFirst({
            where: {email}
        })

        if (!user) {
            throw new HttpException(
                StatusCodes.NOT_FOUND,
                "User not found"
            )
        }

        const token = await this.tokenService.create(user.id);

        await this.mailService.sendVerificationMail({
            email: user.email,
            signup: newUser,
            token: token.key,
            username: user.username
        })

        return "Token sent";

    }
    


    public signJwt (id: number | object | Buffer) {
        return jwt.sign(
            {id},
            JWT_SECRET_KEY as string,
            { expiresIn: JWT_EXPIRES_IN }
        )
    }

    public verifyJwt (token: string) {
        return jwt.verify(token, JWT_SECRET_KEY as string) as {id: string}
    }

    public async hashPassword (password: string) {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt)
    }

    private async passwordMatch (passwordFromDb: string, loginPassword: string) {
        return await bcrypt.compare(loginPassword, passwordFromDb);
    }

}