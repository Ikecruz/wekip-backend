import { PrismaClient } from "@prisma/client";
import database from "../database";
import { BusinessLoginDto, BusinessRegisterDto, UserLoginDto, UserRegisterDto, VerifyEmailDto } from "../dtos/auth.dto";
import jwt from "jsonwebtoken"
import { JWT_EXPIRES_IN, JWT_SECRET_KEY } from "../config";
import bcrypt from "bcrypt";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";
import { MailService } from "./mail.service";
import { TokenService } from "./token.service";
import { MediaService } from "./media.service";

export class AuthService {

    private ormService: PrismaClient;
    private mailService: MailService;
    private tokenService: TokenService;
    private readonly mediaService: MediaService

    constructor () {
        this.ormService = database.getClient();
        this.mailService = new MailService();
        this.tokenService = new TokenService();
        this.mediaService = new MediaService();
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

        await this.sendVerificationToken(email, "user", true);

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

            await this.sendVerificationToken(userFromDb.email, "user")

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

    public async sendVerificationToken (email: string, role: "business" | "user", newUser: boolean = false) {

        const entity = await this.ormService[role as string].findFirst({
            where: {email}
        })

        if (!entity) {
            throw new HttpException(
                StatusCodes.NOT_FOUND,
                "User not found"
            )
        }

        const token = await this.tokenService.create(entity.id);

        await this.mailService.sendVerificationMail({
            email: entity.email,
            signup: newUser,
            token: token.key,
            username: role === "user" ? entity.username : entity.name
        })

        return "Token sent";

    }
    
    public async verifyEmail(dto: VerifyEmailDto) {

        const token = await this.tokenService.validate(dto.token);

        await this.ormService[dto.group as string].update({
            where: {
                id: token.creator_id
            },
            data: {
                email_verified: true
            }
        })

        return "Email Verified";

    }

    public async businessRegister(dto: BusinessRegisterDto, logo: Express.Multer.File) {
        
        const { email, name, password } = dto

        const businessExists = await this.ormService.business.findFirst({
            where: { email }
        })

        if (businessExists) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST,
                'Business already registered'
            )
        }

        const nameTaken = await this.ormService.business.findFirst({
            where: { name }
        })

        if (nameTaken) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST,
                'Business name already exists'
            )
        }

        const alphanumericPattern = /^[a-z0-9]+$/
        if(!alphanumericPattern.test(name)) {
            throw new HttpException(
                StatusCodes.BAD_REQUEST, 
                'Business name must be alphanumeric'
            )
        }

        const uploadedLogo = await this.mediaService.uploadImage(logo, 'images/business-logo');
        const hashedPassword = await this.hashPassword(password);

        await this.ormService.business.create({
            data: {
                email: email,
                logo: uploadedLogo.url,
                name: name,
                password: hashedPassword,
            }
        })

        return {message: "Signup successful"}
    }

    public async businessLogin (dto: BusinessLoginDto) {

        const { email, password } = dto

        const businessFromDb = await this.ormService.business.findFirst({
            where: { email }
        })

        if (!businessFromDb) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Invalid Credentials"
            )
        }

        const passwordsMatch = await this.passwordMatch(businessFromDb.password, password);

        if (!passwordsMatch) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Invalid Credentials"
            )
        }
        
        if (!businessFromDb.email_verified) {

            await this.sendVerificationToken(businessFromDb.email, "business")

            throw new HttpException(
                StatusCodes.CONFLICT,
                "Email not verified"
            )
        }

        const token = this.signJwt(businessFromDb.id)

        const { created_at, updated_at, password: filteredPassword, ...business } = businessFromDb;

        return {
            business,
            token
        }

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