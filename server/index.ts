import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Middleware for logging API responses
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }
      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  // ✅ Place /api/chat route AFTER registerRoutes so it takes effect
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";

    console.log("Received message:", lastMessage); // Debug

    if (lastMessage.includes("tell me a joke")) {
      return res.json({ message: getRandomJoke() });
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
      return res.json({ message: getRandomQuote() });
    }

    if (lastMessage.includes("trivia")) {
      return res.json({ message: getRandomTrivia() });
    }

    // Fallback response
    res.json({
      message: "Hello! I'm your GPT assistant. How can I help you today?",
    });
  });

  // Global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  // Vite setup
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
})();

// 🔽 Helper Functions
function getRandomJoke(): string {
  const jokes = [
    "Why don't scientists trust atoms? Because they make up everything!",
    "Why did the scarecrow win an award? Because he was outstanding in his field!",
    "Why don’t skeletons fight each other? They don’t have the guts.",
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

function getRandomQuote(): string {
  const quotes = [
    "Believe you can and you're halfway there.",
    "The only way to do great work is to love what you do.",
    "Your limitation—it’s only your imagination.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getRandomTrivia(): string {
  const facts = [
    "Honey never spoils. Archaeologists found pots of honey in ancient tombs!",
    "Bananas are berries, but strawberries aren't.",
    "Octopuses have three hearts and blue blood.",
  ];
  return facts[Math.floor(Math.random() * facts.length)];
}
