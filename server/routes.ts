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

  // Chat completion with custom prompt logic
  app.post("/api/chat", async (req: Request, res: Response) => {
    try {
      const { message, model, context } = req.body as ChatCompletionRequest;

      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }

      const lower = message.toLowerCase();

      // Custom replies
      if (lower.includes("tell me a joke")) {
        return res.json({ message: getRandomJoke() });
      }

      if (lower.includes("flip a coin")) {
        return res.json({ message: Math.random() > 0.5 ? "Heads!" : "Tails!" });
      }

      if (lower.includes("roll a dice")) {
        return res.json({ message: `You rolled a ${Math.floor(Math.random() * 6) + 1}` });
      }

      if (lower.match(/what is \d+ \+ \d+/)) {
        const match = lower.match(/what is (\d+) \+ (\d+)/);
        if (match) {
          const sum = parseInt(match[1]) + parseInt(match[2]);
          return res.json({ message: `${match[1]} + ${match[2]} = ${sum}` });
        }
      }

      if (lower.includes("motivate me") || lower.includes("inspire me")) {
        return res.json({ message: getRandomQuote() });
      }

      if (lower.includes("trivia")) {
        return res.json({ message: getRandomTrivia() });
      }

      // Check API key
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(200).json({
          message: "I need a valid OpenAI API key to work properly. Please provide one in the environment variables.",
          model: model
        });
      }

      const messageHistory = context.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      messageHistory.push({
        role: "user",
        content: message
      });

      const aiResponse = await simulateModelResponse(model, messageHistory);

      try {
        let conversation = (await storage.listConversations())[0];
        if (!conversation) {
          conversation = await storage.createConversation({
            title: "New Conversation",
            createdAt: new Date()
          });
        }

        await storage.createMessage({
          conversationId: conversation.id,
          content: message,
          role: "user",
          model: null,
          createdAt: new Date()
        });

        await storage.createMessage({
          conversationId: conversation.id,
          content: aiResponse,
          role: "assistant",
          model: model,
          createdAt: new Date()
        });
      } catch (err) {
        console.error("Error storing conversation:", err);
      }

      return res.status(200).json({
        message: aiResponse,
        model: model
      });
    } catch (error) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({ 
        message: "Failed to generate AI response",
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // Image analysis
  app.post("/api/analyze-image", upload.single('image'), async (req: Request, res: Response) => {
    try {
      const file = req.file;
      const prompt = req.body.prompt || "Analyze this image in detail.";

      if (!file) {
        return res.status(400).json({ message: "No image file uploaded" });
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(200).json({ 
          analysis: "I need a valid OpenAI API key to analyze images. Please provide one in the environment variables."
        });
      }

      const imageBuffer = fs.readFileSync(file.path);
      const base64Image = imageBuffer.toString('base64');

      const analysis = await analyzeImage(base64Image, prompt);

      fs.unlinkSync(file.path);

      return res.status(200).json({ analysis });
    } catch (error) {
      console.error("Error analyzing image:", error);
      return res.status(200).json({
        analysis: "I encountered an error analyzing this image. Please check your OpenAI API key."
      });
    }
  });

  // Sentiment analysis
  app.post("/api/analyze-sentiment", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(200).json({
          sentiment: "neutral",
          score: 0,
          explanation: "I need a valid OpenAI API key to analyze sentiment."
        });
      }

      const sentiment = await analyzeSentiment(text);
      return res.status(200).json(sentiment);
    } catch (error) {
      console.error("Error analyzing sentiment:", error);
      return res.status(200).json({
        sentiment: "neutral",
        score: 0,
        explanation: "An error occurred while analyzing sentiment."
      });
    }
  });

  // Embedding
  app.post("/api/generate-embedding", async (req: Request, res: Response) => {
    try {
      const { text } = req.body;

      if (!text) {
        return res.status(400).json({ message: "Text is required" });
      }

      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(200).json({ 
          embedding: new Array(1536).fill(0),
          note: "Using zero vector due to missing OpenAI API key"
        });
      }

      const embedding = await generateEmbedding(text);
      return res.status(200).json({ embedding });
    } catch (error) {
      console.error("Error generating embedding:", error);
      return res.status(200).json({ 
        embedding: new Array(1536).fill(0),
        note: "Error occurred during embedding generation"
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions
function getRandomJoke(): string {
  const jokes = [
    "Why don’t scientists trust atoms? Because they make up everything!",
    "Why did the math book look sad? Because it had too many problems.",
    "Parallel lines have so much in common. It’s a shame they’ll never meet."
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

function getRandomQuote(): string {
  const quotes = [
    "Believe in yourself and all that you are.",
    "You are stronger than you think.",
    "Every day is a fresh start."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getRandomTrivia(): string {
  const trivia = [
    "Honey never spoils. Archaeologists have found 3000-year-old honey and it’s still good.",
    "Bananas are berries, but strawberries aren’t.",
    "Octopuses have three hearts."
  ];
  return trivia[Math.floor(Math.random() * trivia.length)];
}
