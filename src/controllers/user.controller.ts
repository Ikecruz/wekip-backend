import { NextFunction, Request, Response } from "express";
import { UserService } from "../services/user.service";
import { StatusCodes } from "http-status-codes";

export class UserController {

    private readonly userService: UserService;

    constructor() {
        this.userService = new UserService();
    }

    public createShareCode = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.userService.createShareCode(request.user?.id as number);
        response.status(StatusCodes.CREATED).send(res);
    }

}