import { NextFunction, Request, Response } from "express";
import { AuthService } from "../services/auth.service";
import { StatusCodes } from "http-status-codes";

export class AuthController {

    private readonly authService: AuthService;
    
    constructor () {
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

    public test = async (request: Request, response: Response, next: NextFunction) => {
        
    }

}