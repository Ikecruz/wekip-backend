import nodemailer, { Transporter, createTransport } from "nodemailer"
import { MAIL_HOST, MAIL_PASSWORD, MAIL_PORT, MAIL_USERNAME } from "../config";
import { Options } from "nodemailer/lib/mailer";

interface VerificationMail {
    email: string;
    signup: boolean;
    token: string;
    username: string
}

export class MailService {

    private transport: Transporter;
    private mailHost: string;
    private mailPort: number;
    public mailUsername: string;
    private mailPassword: string

    constructor() {
        this.mailHost = MAIL_HOST as string;
        this.mailPort = Number(MAIL_PORT);
        this.mailUsername = MAIL_USERNAME as string;
        this.mailPassword = MAIL_PASSWORD as string;
        this.initTransport()
    }

    private initTransport() {
        this.transport = createTransport({
            host: this.mailHost,
            port: this.mailPort,
            secure: false,
            auth: {
                user: this.mailUsername,
                pass: this.mailPassword
            }
        })
    }

    public async sendVerificationMail({
        email,
        signup,
        token,
        username
    }: VerificationMail) {

        const mailOptions: Options = {
            from: `"Wekip" ${this.mailUsername}`,
            to: email,
            subject: signup ? "Welcome to Wekip" : "Verify Email Address",
            html: `
                <strong>Hello ${username}</strong>
                <p>Here's your one time pin <strong>${token}</strong> </p> 
            `
        }

        return await this.transport.sendMail(mailOptions);

    }

}