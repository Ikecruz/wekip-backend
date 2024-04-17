import { NextFunction, Request, Response } from "express";
import { ReceiptService } from "../services/receipt.service";
import { StatusCodes } from "http-status-codes";

export class ReceiptController {

    private readonly service: ReceiptService;

    constructor() {
        this.service = new ReceiptService();
    }

    public create = async (request: Request, response: Response, next: NextFunction) => {
        const res = await this.service.create(
            request.body, 
            request.business?.id as number, 
            request.file as Express.Multer.File
        )
        response.status(StatusCodes.CREATED).send(res)
    }

    public test = async (request: Request, response: Response, next: NextFunction) => {

    }

}