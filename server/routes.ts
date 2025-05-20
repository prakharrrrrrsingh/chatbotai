import type { Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { ChatCompletionRequest } from "@shared/schema";
import { simulateModelResponse, analyzeSentiment, analyzeImage, generateEmbedding } from "./openai";
import multer from "multer";
import fs from "fs";
import path from "path";

// Configure multer for file uploads
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }

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
      
      // Store the conversation in memory
      try {
        // Create a conversation if it doesn't exist
        let conversation = (await storage.listConversations())[0];
        if (!conversation) {
          conversation = await storage.createConversation({
            title: "New Conversation",
            createdAt: new Date()
          });
        }
        
        // Store the user message
        await storage.createMessage({
          conversationId: conversation.id,
          content: message,
          role: "user",
          model: null,
          createdAt: new Date()
        });
        
        // Store the AI response
        await storage.createMessage({
          conversationId: conversation.id,
          content: aiResponse,
          role: "assistant",
          model: model,
          createdAt: new Date()
        });
      } catch (storageError) {
        console.error("Error storing conversation:", storageError);
        // Continue even if storage fails
      }

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

  // Image analysis endpoint
  app.post("/api/analyze-image", upload.single('image'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const prompt = req.body.prompt || "Analyze this image in detail.";
      
      if (!file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }
      
      // Read the file as base64
      const imageBuffer = fs.readFileSync(file.path);
      const base64Image = imageBuffer.toString('base64');
      
      // Analyze the image
      const analysis = await analyzeImage(base64Image, prompt);
      
      // Clean up the uploaded file
      fs.unlinkSync(file.path);
      
      return res.status(200).json({ analysis });
    } catch (error) {
      console.error("Error analyzing image:", error);
      return res.status(500).json({
        message: "Failed to analyze image",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Sentiment analysis endpoint
  app.post("/api/analyze-sentiment", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const sentiment = await analyzeSentiment(text);
      return res.status(200).json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return res.status(500).json({
        message: "Failed to analyze sentiment",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  // Text embedding endpoint for semantic search
  app.post("/api/generate-embedding", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;
      
      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }
      
      const embedding = await generateEmbedding(text);
      return res.status(200).json({ embedding });
    } catch (error) {
      console.error("Error generating embedding:", error);
      return res.status(500).json({
        message: "Failed to generate embedding",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
