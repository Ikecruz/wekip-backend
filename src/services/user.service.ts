import { PrismaClient, ShareCode } from "@prisma/client";
import database from "../database";
import { TokenService } from "./token.service";
import moment from "moment";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";

export class UserService {

    private readonly ormService: PrismaClient;
    private readonly tokenService: TokenService;

    constructor() {
        this.ormService = database.getClient();
    }

    public async createShareCode(user_id: number) {

        const code = await this.tokenService.generateToken();

        const codeExists = await this.ormService.shareCode.findFirst({
            where: {
                key: code
            }
        })

        if (codeExists) {
            return await this.createShareCode(user_id);
        }

        const shareCode = await this.ormService.shareCode.create({
            data: {
                user_id,
                key: code,
                expires: moment().add(15, 'm').toDate()
            }
        })

        return {
            code: shareCode.key,
            expires_in: shareCode.expires
        }

    }

    public async validateShareCode (code: string): Promise<ShareCode> {

        const foundCode = await this.ormService.shareCode.findFirst({
            where: {
                key: code,
                is_used: false
            }
        })

        if (!foundCode) {
            throw new HttpException(
                StatusCodes.CONFLICT,
                "Invalid Code"
            )
        }

        if (!moment(foundCode.expires).isSameOrAfter(Date.now())) {
            throw new HttpException(
                StatusCodes.CONFLICT,
                "Invalid Code"
            );
        }

        await this.ormService.shareCode.update({
            where: {
                id: foundCode.id
            },
            data: {
                is_used: true
            }
        })

        return foundCode

    }

}