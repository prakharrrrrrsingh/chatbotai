import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ChatCompletionRequest } from "@shared/schema";
import { simulateModelResponse } from "./openai";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat completion endpoint
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, model, context } = req.body as ChatCompletionRequest;
      
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      
      // Convert the context to the format expected by the OpenAI client
      const messageHistory = context.map(msg => ({
        role: msg.role,
        content: msg.content
      }));
      
      // Add the new user message
      messageHistory.push({
        role: "user",
        content: message
      });
      
      // Generate a response
      const aiResponse = await simulateModelResponse(
        model,
        messageHistory
      );
      
      // Store the conversation if needed
      // In a production app, you might want to store conversations in a database

      return res.status(200).json({
        message: aiResponse,
        model: model
      });
    } catch (error) {
      console.error("Error generating AI response:", error);
      return res.status(500).json({ 
        message: "Failed to generate AI response",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
