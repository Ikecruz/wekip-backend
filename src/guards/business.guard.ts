import { PrismaClient } from "@prisma/client";
import Interceptor from "../middlewares/interceptor.middleware";
import { AuthService } from "../services/auth.service";
import { NextFunction, Request, Response } from "express";
import database from "../database";
import HttpException from "../utils/exception";
import { StatusCodes } from "http-status-codes";

export class BusinessGuard extends Interceptor {

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

        const instance = new BusinessGuard(request, response, next);

        if (!instance.token) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Unauthorized"
            )
        }

        const businessPayload = instance.authService.verifyJwt(instance.token);

        const business = await instance.ormService.business.findFirst({
            where: {
                id: businessPayload?.id
            }
        })

        if (!business) {
            throw new HttpException(
                StatusCodes.UNAUTHORIZED,
                "Access Denied"
            )
        }

        request.business = business

        next()

    }

}