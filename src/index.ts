import App from "./app"
import { AuthRoute } from "./routes/auth.routes";
import { UserRoute } from "./routes/user.routes";

function bootstrap() {
    const app = new App([
        new AuthRoute(),
        new UserRoute()
    ])
    
    app.listen()
}

bootstrap();