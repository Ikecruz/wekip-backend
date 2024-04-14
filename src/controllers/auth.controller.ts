import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { StatusCodes } from "http-status-codes";
import fs from "fs";
import path from "path";

export class AuthController {

    private readonly authService: AuthService;

    constructor() {
        this.authService = new AuthService();
    }

    public registerUser = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.registerUser(request.body);
        response.status(StatusCodes.CREATED).send(res);
    }

    public loginUser = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.loginUser(request.body);
        response.status(StatusCodes.OK).send(res)
    }

    public registerBusiness = async (request: Request, response: Response, next: NextFunction) => {
        try {
            const res = await this.authService.businessRegister(request.body, request.file as Express.Multer.File);
            response.status(StatusCodes.OK).send(res)
        } catch (error) {
            next(error)
        } finally {
            fs.unlink(path.resolve(request?.file?.path as string), () => { })
        }
    }

    public loginBusiness = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.businessLogin(request.body);
        response.status(StatusCodes.OK).send(res)
    }

    public verifyEmail = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.verifyEmail(request.body);
        response.status(StatusCodes.OK).send(res)
    }

    public forgotPassword = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.forgotPassword(request.body);
        response.status(StatusCodes.OK).send(res);
    }

    public changePassword = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.authService.changePassword(request.body);
        response.status(StatusCodes.OK).send(res)
    }

    public test = async (request: Request, response: Response, next: NextFunction) => {

    }

}