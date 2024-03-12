import { PrismaClient } from "@prisma/client";
import Interceptor from "../middlewares/interceptor.middleware";
import { AuthService } from "../services/auth.service";
import { NextFunction, Request, Response } from "express";
import database from "../database";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";

export class UserGuard extends Interceptor {

    private readonly authService: AuthService;
    private readonly ormService: PrismaClient;

    constructor(
        request: Request,
        response: Response,
        next: NextFunction
    ) {
        super(request, response, next)
        this.authService = new AuthService();
        this.ormService = database.getClient();
    }

    public static async jwtValid (
        request: Request,
        response: Response,
        next: NextFunction
    ) {

        const instance = new UserGuard(request, response, next);

        if (!instance.token) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Unauthorized"
            )
        }

        const userPayload = instance.authService.verifyJwt(instance.token);

        const user = await instance.ormService.user.findFirst({
            where: {
                id: userPayload?.id
            }
        })

        if (!user) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Access Denied"
            )
        }

        request.user = user

        next()

    }

}