// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// server/storage.ts
var MemStorage = class {
  conversations;
  messages;
  conversationCurrentId;
  messageCurrentId;
  constructor() {
    this.conversations = /* @__PURE__ */ new Map();
    this.messages = /* @__PURE__ */ new Map();
    this.conversationCurrentId = 1;
    this.messageCurrentId = 1;
  }
  async getConversation(id) {
    return this.conversations.get(id);
  }
  async createConversation(insertConversation) {
    const id = this.conversationCurrentId++;
    const conversation = {
      ...insertConversation,
      id,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.conversations.set(id, conversation);
    return conversation;
  }
  async listConversations() {
    return Array.from(this.conversations.values());
  }
  async getMessage(id) {
    return this.messages.get(id);
  }
  async getMessagesByConversation(conversationId) {
    return Array.from(this.messages.values()).filter((message) => message.conversationId === conversationId).sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }
  async createMessage(insertMessage) {
    const id = this.messageCurrentId++;
    const message = {
      ...insertMessage,
      id,
      createdAt: /* @__PURE__ */ new Date(),
      // Ensure required fields are always set
      conversationId: insertMessage.conversationId || 0,
      model: insertMessage.model || null
    };
    this.messages.set(id, message);
    return message;
  }
};
var storage = new MemStorage();

// server/openai.ts
import OpenAI from "openai";
var openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || ""
  // Using OpenAI API key directly
});
async function analyzeImage(base64Image, prompt) {
  try {
    console.log("Using simulated image analysis response");
    const isJpeg = base64Image.substring(0, 20).includes("JFIF") || prompt.toLowerCase().includes("jpeg") || prompt.toLowerCase().includes("jpg");
    const isPng = base64Image.substring(0, 20).includes("PNG") || prompt.toLowerCase().includes("png");
    const isScreenshot = prompt.toLowerCase().includes("screenshot") || prompt.toLowerCase().includes("screen");
    if (prompt.toLowerCase().includes("cat") || prompt.toLowerCase().includes("kitten")) {
      return "I can see a cat in this image! It appears to be a domestic cat, likely a house pet. The cat has a typical feline appearance with pointed ears, whiskers, and a distinctive cat face. Without color information in this demo mode, I can't tell you the exact coloration, but cats commonly come in tabbies, solid colors, calicos, or tuxedo patterns.";
    } else if (prompt.toLowerCase().includes("dog") || prompt.toLowerCase().includes("puppy")) {
      return "This image shows a dog! It appears to be a domestic dog, likely a pet. The dog has the characteristic canine features including a snout, floppy or pointed ears, and a friendly expression. In a full implementation with API access, I could tell you the specific breed and more details about the animal.";
    } else if (prompt.toLowerCase().includes("text") || prompt.toLowerCase().includes("read")) {
      return "This image appears to contain text. In demo mode, I can't read the specific text content, but I can see that it's formatted as writing. With a full API implementation, I would be able to extract and process the text content for you.";
    } else if (isScreenshot) {
      return "This appears to be a screenshot of a digital interface. I can see what looks like a user interface with various elements such as buttons, text fields, and possibly navigation components. In a fully functional system, I could provide more details about the specific application or website shown.";
    } else if (isJpeg) {
      return "I've received your JPEG image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis of its contents. With a proper API connection, I could describe the scene, identify objects, people, or text within the image.";
    } else if (isPng) {
      return "I've received your PNG image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis of its contents. PNG images are often used for graphics with transparency or screenshots, and with a proper API connection, I could analyze the specific content.";
    } else {
      return "I've received your image. In this demo mode, I can acknowledge that you've uploaded an image, but cannot provide detailed analysis without API access. In a full implementation, I would use computer vision to describe the contents, identify objects, read text, and answer specific questions about what's shown in the image.";
    }
  } catch (error) {
    console.error("Error analyzing image:", error);
    return "I encountered an error while analyzing this image. Please make sure your OpenAI API key has access to GPT-4o Vision capabilities.";
  }
}
async function analyzeSentiment(text) {
  try {
    console.log("Using simulated sentiment analysis response");
    const positiveWords = ["good", "great", "excellent", "happy", "love", "wonderful", "amazing", "fantastic", "awesome", "best", "like", "thanks", "thank you", "nice", "helpful", "beautiful", "perfect"];
    const negativeWords = ["bad", "terrible", "awful", "sad", "hate", "poor", "horrible", "worst", "angry", "disappointed", "useless", "stupid", "annoying", "broken", "fail", "failed", "waste"];
    const lowerText = text.toLowerCase();
    let positiveScore = 0;
    let negativeScore = 0;
    positiveWords.forEach((word) => {
      if (lowerText.includes(word)) positiveScore++;
    });
    negativeWords.forEach((word) => {
      if (lowerText.includes(word)) negativeScore++;
    });
    let sentiment = "neutral";
    let score = 0;
    let explanation = "";
    if (positiveScore > negativeScore) {
      sentiment = "positive";
      score = Math.min(positiveScore * 0.2, 1);
      explanation = `The text contains positive language, including ${positiveScore} positive indicators.`;
    } else if (negativeScore > positiveScore) {
      sentiment = "negative";
      score = -Math.min(negativeScore * 0.2, 1);
      explanation = `The text contains negative language, including ${negativeScore} negative indicators.`;
    } else {
      sentiment = "neutral";
      explanation = "The text appears to be neutral or balanced between positive and negative sentiment.";
    }
    return {
      sentiment,
      score,
      explanation
    };
  } catch (error) {
    console.error("Error analyzing sentiment:", error);
    return {
      sentiment: "neutral",
      score: 0,
      explanation: "An error occurred during sentiment analysis in demo mode."
    };
  }
}
async function generateEmbedding(text) {
  try {
    console.log("Using simulated embedding response");
    const seed = text.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const mockEmbedding = new Array(1536).fill(0).map(
      (_, i) => Math.sin(seed * (i + 1) / 1536) / 2 + 0.5
    );
    return mockEmbedding;
  } catch (error) {
    console.error("Error generating embedding:", error);
    return new Array(1536).fill(0);
  }
}
async function simulateModelResponse(model, messages) {
  const lastUserMessage = messages.filter((msg) => msg.role === "user").pop()?.content || "";
  try {
    console.log("Using simulated response for testing (no API key required)");
    switch (model) {
      case "claude":
        return generateClaudeResponse(lastUserMessage);
      case "llama":
        return generateLlamaResponse(lastUserMessage);
      case "gemini":
        return generateGeminiResponse(lastUserMessage);
      default:
        return generateGPTResponse(lastUserMessage);
    }
  } catch (error) {
    console.error("Error in simulateModelResponse:", error);
    return "I'm currently in demo mode with simulated responses since there's an issue with the API key.";
  }
}
function generateGPTResponse(message) {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello! I'm your GPT assistant. How can I help you today?";
  } else if (message.toLowerCase().includes("weather")) {
    return "I can't check the actual weather without an API, but I can tell you that weather forecasts typically include temperature, precipitation chances, and wind conditions. Would you like to know more about meteorology?";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm a GPT-powered AI assistant, designed to be helpful, harmless, and honest.";
  } else {
    return "As a GPT assistant, I'd normally process your request with the OpenAI API, but I'm currently in demo mode. In a fully functional setup, I could help with information, creative writing, problem-solving, and more.";
  }
}
function generateClaudeResponse(message) {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello there. I'm Claude. How may I assist you today?";
  } else if (message.toLowerCase().includes("weather")) {
    return "While I can't access current weather data in this demo mode, I'd be happy to discuss climate patterns or help you understand meteorological concepts. What specific aspect of weather interests you?";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm Claude, an AI assistant created by Anthropic. I aim to be helpful, harmless, and honest in all my interactions.";
  } else {
    return "I'm Claude, currently running in a demonstration mode. In a fully functional environment, I could help answer your questions thoughtfully and provide nuanced perspectives on complex topics.";
  }
}
function generateLlamaResponse(message) {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hey there! \u{1F44B} I'm Llama, ready to chat! What's up?";
  } else if (message.toLowerCase().includes("weather")) {
    return "Can't check the real weather right now (demo mode) \u{1F326}\uFE0F But I'd love to talk about something else! Any other topics on your mind? \u{1F4AD}";
  } else if (message.toLowerCase().includes("name")) {
    return "I'm Llama! \u{1F999} Your friendly neighborhood AI assistant from Meta. Nice to meet you! \u{1F60A}";
  } else {
    return "Just FYI, I'm in demo mode right now \u{1F9EA} so I'm giving you simulated responses. In real mode, I'd be way more helpful! Anything specific you want to chat about? \u{1F4AC}";
  }
}
function generateGeminiResponse(message) {
  if (message.toLowerCase().includes("hello") || message.toLowerCase().includes("hi")) {
    return "Hello, I'm Gemini. How can I assist you today?\n\nI can help with:\n\u2022 Information and research\n\u2022 Creative tasks\n\u2022 Problem-solving";
  } else if (message.toLowerCase().includes("weather")) {
    return "I'm currently in demo mode without access to real-time weather data. However, I can explain:\n\n\u2022 How weather forecasting works\n\u2022 Climate patterns\n\u2022 Weather phenomena";
  } else if (message.toLowerCase().includes("name")) {
    return "I am Gemini, an AI assistant developed by Google. I'm designed to be:\n\n\u2022 Helpful - providing clear and useful information\n\u2022 Structured - organizing information logically\n\u2022 Comprehensive - covering topics thoroughly";
  } else {
    return "I'm currently running in demo mode with pre-programmed responses. In a full implementation, I could provide more detailed assistance with:\n\n\u2022 Research questions\n\u2022 Data analysis\n\u2022 Learning resources\n\u2022 Creative projects";
  }
}

// server/routes.ts
import multer from "multer";
import fs from "fs";
import path from "path";
var upload = multer({
  dest: "uploads/",
  limits: { fileSize: 10 * 1024 * 1024 }
  // 10MB limit
});
async function registerRoutes(app2) {
  const uploadsDir = path.join(process.cwd(), "uploads");
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  app2.post("/api/chat", async (req, res) => {
    try {
      const { message, model, context } = req.body;
      if (!message) {
        return res.status(400).json({ message: "Message is required" });
      }
      const lower = message.toLowerCase();
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
      if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.trim() === "") {
        return res.status(200).json({
          message: "I need a valid OpenAI API key to work properly. Please provide one in the environment variables.",
          model
        });
      }
      const messageHistory = context.map((msg) => ({
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
            createdAt: /* @__PURE__ */ new Date()
          });
        }
        await storage.createMessage({
          conversationId: conversation.id,
          content: message,
          role: "user",
          model: null,
          createdAt: /* @__PURE__ */ new Date()
        });
        await storage.createMessage({
          conversationId: conversation.id,
          content: aiResponse,
          role: "assistant",
          model,
          createdAt: /* @__PURE__ */ new Date()
        });
      } catch (err) {
        console.error("Error storing conversation:", err);
      }
      return res.status(200).json({
        message: aiResponse,
        model
      });
    } catch (error) {
      console.error("Error in /api/chat:", error);
      return res.status(500).json({
        message: "Failed to generate AI response",
        error: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });
  app2.post("/api/analyze-image", upload.single("image"), async (req, res) => {
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
      const base64Image = imageBuffer.toString("base64");
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
  app2.post("/api/analyze-sentiment", async (req, res) => {
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
  app2.post("/api/generate-embedding", async (req, res) => {
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
  const httpServer = createServer(app2);
  return httpServer;
}
function getRandomJoke() {
  const jokes = [
    "Why don\u2019t scientists trust atoms? Because they make up everything!",
    "Why did the math book look sad? Because it had too many problems.",
    "Parallel lines have so much in common. It\u2019s a shame they\u2019ll never meet."
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}
function getRandomQuote() {
  const quotes = [
    "Believe in yourself and all that you are.",
    "You are stronger than you think.",
    "Every day is a fresh start."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
function getRandomTrivia() {
  const trivia = [
    "Honey never spoils. Archaeologists have found 3000-year-old honey and it\u2019s still good.",
    "Bananas are berries, but strawberries aren\u2019t.",
    "Octopuses have three hearts."
  ];
  return trivia[Math.floor(Math.random() * trivia.length)];
}

// server/vite.ts
import express from "express";
import fs2 from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath } from "url";
import { dirname, resolve } from "path";
var __filename = fileURLToPath(import.meta.url);
var __dirname = dirname(__filename);
var vite_config_default = defineConfig({
  root: resolve(__dirname, "client"),
  // 👈 frontend entry
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "client", "src")
    }
  },
  build: {
    outDir: resolve(__dirname, "client", "dist"),
    // 👈 ensures it outputs inside client
    emptyOutDir: true
  },
  base: "./"
  // 👈 required so relative paths work in production (like on Render)
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs2.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs2.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
import { webcrypto } from "crypto";
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto;
}
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";
    console.log("Received message:", lastMessage);
    if (lastMessage.includes("tell me a joke")) {
      return res.json({ message: getRandomJoke2() });
    }
    if (lastMessage.includes("flip a coin")) {
      return res.json({ message: Math.random() > 0.5 ? "Heads!" : "Tails!" });
    }
    if (lastMessage.includes("roll a dice")) {
      return res.json({ message: `You rolled a ${Math.floor(Math.random() * 6) + 1}` });
    }
    if (lastMessage.match(/what is \d+ \+ \d+/)) {
      const match = lastMessage.match(/what is (\d+) \+ (\d+)/);
      if (match) {
        const sum = parseInt(match[1]) + parseInt(match[2]);
        return res.json({ message: `${match[1]} + ${match[2]} = ${sum}` });
      }
    }
    if (lastMessage.includes("motivate me") || lastMessage.includes("inspire me")) {
      return res.json({ message: getRandomQuote2() });
    }
    if (lastMessage.includes("trivia")) {
      return res.json({ message: getRandomTrivia2() });
    }
    res.json({
      message: "Hello! I'm your GPT assistant. How can I help you today?"
    });
  });
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = 5e3;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();
function getRandomJoke2() {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "Why don\u2019t skeletons fight each other? They don\u2019t have the guts."
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}
function getRandomQuote2() {
  const quotes = [
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do.",
    "Your limitation\u2014it\u2019s only your imagination."
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}
function getRandomTrivia2() {
  const facts = [
    "Honey never spoils. Archaeologists found pots of honey in ancient tombs!",
    "Bananas are berries, but strawberries aren't.",
    "Octopuses have three hearts and blue blood."
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}
