import { Router } from "express";
import { chatWithBotController } from "../controllers/chatbot.controller";
import { passportAuthenticateJwt } from "../config/passport.config";

const chatbotRoutes = Router();

// Chatbot endpoint - requires authentication
chatbotRoutes.post("/chat", passportAuthenticateJwt, chatWithBotController);

export default chatbotRoutes;

