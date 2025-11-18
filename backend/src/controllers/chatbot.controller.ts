import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.middleware";
import { HTTPSTATUS } from "../config/http.config";
import { chatWithBotService, ChatbotMessage } from "../services/chatbot.service";
import { z } from "zod";

/**
 * Schema for chatbot message request
 */
const chatbotMessageSchema = z.object({
  message: z.string().min(1, "Message is required").max(2000, "Message is too long"),
  conversationHistory: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
        timestamp: z.string().optional(),
      })
    )
    .optional()
    .default([]),
});

/**
 * Controller for chatbot chat endpoint
 * Handles user messages and returns AI-generated responses
 * Now includes access to user's actual financial data
 */
export const chatWithBotController = asyncHandler(
  async (req: Request, res: Response) => {
    const { message, conversationHistory = [] } = chatbotMessageSchema.parse(req.body);
    
    // Get userId from authenticated user (from JWT middleware)
    const userId = req.user?._id ? String(req.user._id) : undefined;
    
    if (!userId) {
      return res.status(HTTPSTATUS.UNAUTHORIZED).json({
        message: "User not authenticated",
      });
    }

    // Convert conversation history to proper format
    const history: ChatbotMessage[] = conversationHistory.map((msg) => ({
      role: msg.role,
      content: msg.content,
      timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date(),
    }));

    // Get chatbot response with user data access
    const response = await chatWithBotService(message, history, userId);

    return res.status(HTTPSTATUS.OK).json({
      message: "Chatbot response generated successfully",
      data: {
        response,
        timestamp: new Date().toISOString(),
      },
    });
  }
);

