import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import { AuthController } from "../controllers/auth.controller";
import { DtoValidator } from "../middlewares/validation.middleware";
import { UserLoginDto, UserRegisterDto } from "../dtos/auth.dto";

export class AuthRoute implements Route {
    public path: string;
    public router: Router;
    private readonly controller: AuthController;

    constructor() {
        this.path = "auth";
        this.router = Router();
        this.controller = new AuthController();
        this.initializeRoutes()
    }

    public initializeRoutes() {

        this.router.post(
            '/user/register',
            DtoValidator.validate(UserRegisterDto, "body"),
            this.controller.registerUser
        )

        this.router.post(
            '/user/login',
            DtoValidator.validate(UserLoginDto, "body"),
            this.controller.loginUser
        )

    }

}