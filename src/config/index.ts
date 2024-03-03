import { config } from "dotenv";
config();

export const CREDENTIALS = process.env.CREDENTIALS === "true";
export const {
  NODE_ENV,
  PORT,
  LOG_FORMAT,
  LOG_DIR,
  JWT_EXPIRES_IN,
  JWT_SECRET_KEY,
  MAIL_HOST,
  MAIL_PORT,
  MAIL_USERNAME,
  MAIL_PASSWORD,
} = process.env;