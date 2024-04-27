import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import { ReceiptController } from "../controllers/receipt.controller";
import { BusinessGuard } from "../guards/business.guard";
import multer from "../utils/multer";
import { DtoValidator } from "../middlewares/validation.middleware";
import { CreateReceiptDto, GetReceiptDto } from "../dtos/receipt.dto";
import { UserGuard } from "../guards/user.guard";

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

        this.router.get(
            "",
            UserGuard.jwtValid,
            DtoValidator.validate(GetReceiptDto, "query"),
            this.controller.get
        )

        this.router.get(
            "/stats",
            UserGuard.jwtValid,
            this.controller.stats
        )

    }
    
}