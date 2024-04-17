import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import { AuthController } from "../controllers/auth.controller";
import { DtoValidator } from "../middlewares/validation.middleware";
import { BusinessLoginDto, BusinessRegisterDto, ChangePasswordDto, EmailDto, UserLoginDto, UserRegisterDto, VerifyEmailDto } from "../dtos/auth.dto";
import multer from "../utils/multer";

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

        this.router.post(
            '/business/register',
            multer.single('logo'),
            DtoValidator.validate(BusinessRegisterDto, "body"),
            this.controller.registerBusiness
        )

        this.router.post(
            '/business/login',
            DtoValidator.validate(BusinessLoginDto, "body"),
            this.controller.loginBusiness
        )

        this.router.post(
            '/verify-email',
            DtoValidator.validate(VerifyEmailDto, 'body'),
            this.controller.verifyEmail
        )

        this.router.post(
            `/forgot-password`,
            DtoValidator.validate(EmailDto, "body"),
            this.controller.forgotPassword
        )

        this.router.post(
            `/change-password`,
            DtoValidator.validate(ChangePasswordDto, "body"),
            this.controller.changePassword
        )

    }

}