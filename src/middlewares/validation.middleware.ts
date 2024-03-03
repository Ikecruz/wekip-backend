import { plainToInstance } from "class-transformer";
import { ValidationError, validate } from "class-validator";
import { NextFunction, Request, RequestHandler, Response } from "express";
import { logger } from "../utils/logger";

interface Constraints { 
    [type: string]: string; 
}

export class DtoValidator {

    constructor() {}

    public getAllConstraints(errors: ValidationError[]): Constraints[] {
        const constraints: Constraints[] = [];

        for (const error of errors) {
            if (error.constraints) {
                constraints.push(error.constraints);
            }

            if (error.children) {
                constraints.push(...this.getAllConstraints(error.children))
            }
        }

        return constraints
    }

    static validate(
        dto: any, 
        path: "body" | "query" | "params" = "body", 
        skipMissingProperties: boolean = false,
        whitelist: boolean = true,
        forbidNonWhitelisted: boolean = true,
    ): RequestHandler {
        return async (req: Request, res: Response, next: NextFunction) => {
            const validator = new DtoValidator();

            const dtoObject = plainToInstance(dto, req[path])
            const errors = await validate(dtoObject, {skipMissingProperties, whitelist, forbidNonWhitelisted})

            if (errors.length > 0) {
                logger.error(errors)
                const constraints = validator.getAllConstraints(errors);
                
            }
        }
    }

}