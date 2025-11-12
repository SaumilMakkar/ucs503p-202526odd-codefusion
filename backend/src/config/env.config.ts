import { get } from "http";
import { getEnv } from "../utils/get-env";

const envConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),

  PORT: getEnv("PORT", "8000"),
  BASE_PATH: getEnv("BASE_PATH", "/api"),
  MONGODB_URL: getEnv("MONGODB_URL"),

  JWT_SECRET: getEnv("JWT_SECRET", "secert_jwt"),
  JWT_EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m") as string,

  JWT_REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET", "secert_jwt_refresh"),
  JWT_REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "7d") as string,

  GEMINI_API_KEY: getEnv("GEMINI_API_KEY"),



CLOUDINARY_CLOUD_NAME:getEnv("CLOUDINARY_CLOUD_NAME"),
CLOUDINARY_API_KEY:getEnv("CLOUDINARY_API_KEY"),
CLOUDINARY_API_SECRET:getEnv("CLOUDINARY_API_SECRET"),
RESEND_API_KEY:getEnv("RESEND_API_KEY"),
RESEND_MAILER_SENDER:getEnv("RESEND_MAILER_SENDER"),

  // Twilio WhatsApp Configuration
  TWILIO_ACCOUNT_SID: getEnv("TWILIO_ACCOUNT_SID"),
  TWILIO_AUTH_TOKEN: getEnv("TWILIO_AUTH_TOKEN"),
  TWILIO_WHATSAPP_FROM: getEnv("TWILIO_WHATSAPP_FROM", "whatsapp:+14155238886"),

  FRONTEND_ORIGIN: getEnv("FRONTEND_ORIGIN", "localhost"),
  RAZORPAY_KEY_ID: getEnv("RAZORPAY_KEY_ID"),
  RAZORPAY_KEY_SECRET: getEnv("RAZORPAY_KEY_SECRET"),
});

export const Env = envConfig();