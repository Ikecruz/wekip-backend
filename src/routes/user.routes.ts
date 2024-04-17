import { Router } from "express";
import { Route } from "../interfaces/route.interface";
import { UserController } from "../controllers/user.controller";
import { UserGuard } from "../guards/user.guard";

export class UserRoute implements Route {
    public path: string;
    public router: Router;
    private readonly controller: UserController;
    
    constructor() {
        this.path = "user";
        this.router = Router();
        this.controller = new UserController();
        this.initializeRoutes()
    }

    public initializeRoutes() {

        this.router.post(
            '/share-code',
            UserGuard.jwtValid,
            this.controller.createShareCode
        )

    }

}