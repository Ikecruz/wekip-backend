import App from "./app"
import TestRoute from "./routes/test.route"

function bootstrap() {
    const app = new App([
        new TestRoute()
    ])
    
    app.listen()
}

bootstrap();