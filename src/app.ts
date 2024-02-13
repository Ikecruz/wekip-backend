import cors from 'cors';
import "express-async-errors"
import express, { Application, Request } from "express";
import { PORT } from './config';
import { Route } from './interfaces/route.interface';
import morganMiddleware from './middlewares/morgan.middleware';
import { logger } from './utils/logger';
import ErrorMiddleWare from './middlewares/error.middleware';
import expressListRoutes from "express-list-routes"
import database from './database';

export default class App {

    public app: Application;
    public port: string | number;
    public database: typeof database

    constructor(routes: Route[]) {
        this.app = express();
        this.port = PORT || 8000;
        this.database = database;
        this.initializeMiddlewares()
        this.initializeRoutes(routes)
        this.initializeErrorHandling()
        this.initializeDatabase()
        this.listRoutes()
    }

    public listen(): void {
        this.app.listen(this.port, () => {
            logger.info(`📡 [server]: Server is running @ http://localhost:${this.port}`)
        })
    }

    private initializeMiddlewares(): void {
        this.app.use(express.json());
        this.app.use(cors<Request>());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morganMiddleware)
    }

    private initializeRoutes(routes: Route[]): void {
        routes.forEach(route => {
            this.app.use("/api/v1", route.router)
        })
    } 
    
    private async initializeDatabase(): Promise<void>{
        try {
            await database.connect();
            logger.info(`🛢️ [Database]: Database connected`)
        } catch (error) {
            logger.error(`🛢️ [Database]: Database connection failed`)
            console.log(error)
        }
    }

    private initializeErrorHandling() {
        this.app.use(ErrorMiddleWare.handleErrors)
    }

    private listRoutes() {
        expressListRoutes(
            this.app,
            {
                logger: ((method, space, path) => logger.info(`🚏 [Routes]: ${method}  ${path}`))
            }
        )
    }

}