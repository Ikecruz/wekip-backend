import { OtpToken, PrismaClient } from "@prisma/client";
import database from "../database";
import crypto from "crypto";
import moment from "moment";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";

export class TokenService {

    private ormService: PrismaClient;

    constructor () {
        this.ormService = database.getClient()
    }

    public async create (creator_id: number) {

        const key = await this.generateToken();

        const tokenExists = await this.ormService.otpToken.findFirst({
            where: {
                key,
                is_used: false,
            }
        })

        if (tokenExists) {
            return await this.create(creator_id);
        }

        return await this.ormService.otpToken.create({
            data: {
                creator_id,
                key,
                expires: moment().add(15, 'm').toDate()
            }
        })

    }

    public async validate (token: string): Promise<OtpToken> {

        const foundToken = await this.ormService.otpToken.findFirst({
            where: {
                key: token,
                is_used: false
            }
        })

        if (!foundToken) {
            throw new HttpException(
                StatusCodes.CONFLICT,
                "Invalid Token"
            )
        }

        if (!moment(foundToken.expires).isSameOrAfter(Date.now())) {
            throw new HttpException(
                StatusCodes.CONFLICT,
                "Invalid Token"
            );
        }

        await this.ormService.otpToken.update({
            where: {
                id: foundToken.id
            },
            data: {
                is_used: true
            }
        })

        return foundToken

    }

    public generateToken(): Promise<string> {
        return new Promise( async (resolve, reject) => {
            crypto.randomInt(100000, 999999, (err, n) => {
                if (err) {
                    reject(err)
                }

                resolve(n.toString());
            })
        })
    }

}