import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes"; // will edit this next
import { setupVite, serveStatic, log } from "./vite";
import { webcrypto } from "crypto";

if (!globalThis.crypto) {
  (globalThis as any).crypto = webcrypto;
}

const app = express();

// Add CORS middleware here
app.use(cors({
  origin: ["http://localhost:5173", "https://chatbotai-ntnt.vercel.app"],
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Logging middleware
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

  // Your AI route — after registerRoutes
  app.post("/api/chat", async (req: Request, res: Response) => {
    const { messages } = req.body;
    const lastMessage = messages?.[messages.length - 1]?.content?.toLowerCase() || "";

    console.log("Received:", lastMessage); // Debugging

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

    // Fallback
    return res.json({
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

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();

// Helpers
function getRandomJoke(): string {
  const jokes = [
    "Why don’t scientists trust atoms? Because they make up everything!",
    "Why did the math book look sad? Because it had too many problems.",
    "Why do we never tell secrets on a farm? Because the potatoes have eyes and the corn has ears.",
  ];
  return jokes[Math.floor(Math.random() * jokes.length)];
}

function getRandomQuote(): string {
  const quotes = [
    "Believe in yourself and all that you are.",
    "Start where you are. Use what you have. Do what you can.",
    "The only way to do great work is to love what you do.",
  ];
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function getRandomTrivia(): string {
  const trivia = [
    "Did you know? A group of flamingos is called a 'flamboyance'!",
    "Octopuses have three hearts and blue blood.",
    "Bananas are technically berries, but strawberries aren't!",
  ];
  return trivia[Math.floor(Math.random() * trivia.length)];
}
