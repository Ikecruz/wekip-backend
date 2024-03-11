import App from "./app"
import { AuthRoute } from "./routes/auth.routes";

function bootstrap() {
    const app = new App([
        new AuthRoute(),
    ])
    
    app.listen()
}

bootstrap();