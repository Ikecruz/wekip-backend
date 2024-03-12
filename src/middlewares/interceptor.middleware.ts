import { NextFunction, Request, Response } from "express";

export default class Interceptor {

    protected ip?: string;
    protected token?: string;

    constructor (req: Request, res: Response, next: NextFunction) {
        this.ip = req.ip;
        this.token = req.headers.authorization?.split(' ')[1]
    }

}