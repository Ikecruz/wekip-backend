import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import { ReceiptController } from "../controllers/receipt.controller";
import { BusinessGuard } from "../guards/business.guard";
import multer from "../utils/multer";
import { DtoValidator } from "../middlewares/validation.middleware";
import { CreateReceiptDto } from "../dtos/receipt.dto";

export class ReceiptRoute implements Route {

    public path: string;
    public router: Router;
    private readonly controller: ReceiptController;

    constructor() {
        this.path = "receipt"
        this.controller = new ReceiptController()
        this.router = Router()
        this.initializeRoutes()
    }

    initializeRoutes() {
        
        this.router.post(
            "",
            BusinessGuard.jwtValid,
            multer.single('receipt'),
            DtoValidator.validate(CreateReceiptDto, "body"),
            this.controller.create
        )

    }
    
}