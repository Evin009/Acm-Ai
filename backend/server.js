// server.js (Node/Express)
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { getOpenAIResponse } from "./openai.js";
import path from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});
// console.log("CWD:", process.cwd());
// console.log("KEY EXISTS:", !!process.env.GEMINI_API_KEY);
console.log("RUNNING SERVER FROM:", __filename);

const app = express();

// Enable CORS for all origins (you can restrict this in production)
app.use(
  cors({
    origin: "http://localhost:5173",
  })
);
// JSON parsing middleware with error handling
app.use(express.json({
  strict: false, // Allow parsing of any JSON value (not just objects/arrays)
}));

// Handle JSON parsing errors - must be after express.json() but before routes
app.use((err, req, res, next) => {
  // Handle JSON parsing errors (SyntaxError from express.json)
  if (err instanceof SyntaxError) {
    return res.status(400).json({
      error: "Invalid JSON in request body"
    });
  }
  // Handle empty body or malformed JSON errors from express.json
  if (err.status === 400) {
    if (err.type === 'entity.parse.failed' || 
        err.type === 'entity.verify.failed' ||
        (err.message && (err.message.includes('JSON') || err.message.includes('Unexpected')))) {
      return res.status(400).json({
        error: "Request body is missing or invalid. Expected JSON format."
      });
    }
  }
  next(err);
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "ACM AI Server is running",
    hasApiKey: !!process.env.OPENAI_API_KEY,
  });
});

// Chat endpoint
app.post("/api/chat", async (req, res) => {
  try {
    // 1. Safety check: ensure req.body exists
    // When no body is sent, express.json() might set req.body to {} or undefined
    if (req.body === undefined || req.body === null) {
      return res.status(400).json({
        error:
          "Request body is missing. Did you send Content-Type: application/json?",
      });
    }
    
    // 2. Check if req.body is an object (not a string, number, boolean, or array)
    // In JavaScript, typeof null === "object" (quirky!), so we check for null separately
    // Also, typeof "string" === "string", typeof 123 === "number", etc.
    const bodyType = typeof req.body;
    const isArray = Array.isArray(req.body);
    
    // Explicitly check for non-object types
    if (bodyType === "string" || bodyType === "number" || bodyType === "boolean" || 
        bodyType !== "object" || isArray || req.body === null) {
      return res.status(400).json({
        error:
          "Invalid request format. Expected an object with a 'prompt' field. Example: { \"prompt\": \"your message\" }",
      });
    }

    // 3. Extract prompt from request body
    const { prompt } = req.body;

    // 4. Validate prompt exists and is a non-empty string
    if (!prompt || typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({ 
        error: "Prompt is required and must be a non-empty string" 
      });
    }

    const reply = await getOpenAIResponse(prompt);
    return res.json({ reply });
  } catch (err) {
    console.error("Chat endpoint error:", err.message);
    console.error("Error stack:", err.stack);
    const msg = err.message || "";

    // Handle specific error types (exact match)
    if (msg === "RATE_LIMIT_EXCEEDED") {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a minute and try again.",
      });
    }
    if (msg === "QUOTA_EXCEEDED") {
      return res.status(429).json({
        error: "Daily quota exceeded. Please try again tomorrow or check your API plan.",
      });
    }
    if (msg === "API_KEY_MISSING" || msg === "API_KEY_INVALID") {
      return res.status(500).json({
        error: "API configuration error. Please check your API key in the backend .env file.",
      });
    }

    // Handle API errors by message content (e.g. OPENAI_API_ERROR)
    if (msg.includes("429") || msg.includes("Too Many Requests") || msg.toLowerCase().includes("rate limit")) {
      return res.status(429).json({
        error: "Rate limit exceeded. Please wait a minute and try again.",
      });
    }
    if (msg.toLowerCase().includes("quota") || msg.includes("RESOURCE_EXHAUSTED")) {
      return res.status(429).json({
        error: "Daily quota exceeded. Please try again tomorrow or check your API plan.",
      });
    }
    if (msg.includes("API_KEY") || msg.includes("401") || msg.includes("Unauthorized") || msg.includes("Incorrect API key")) {
      return res.status(500).json({
        error: "API configuration error. Please check your API key in the backend .env file.",
      });
    }

    // Generic error – still return 500 but with a clearer message
    return res.status(500).json({
      error: "AI service is temporarily unavailable. Please check your API key and quota, then try again.",
    });
  }
});

// Error handling middleware (catches all unhandled errors)
app.use((err, req, res, next) => {
  // Don't log or handle errors that were already handled
  if (res.headersSent) {
    return next(err);
  }
  
  // Log the error for debugging
  console.error("Unhandled Error:", err);
  console.error("Error type:", err.constructor.name);
  console.error("Error message:", err.message);
  
  // Check if it's a JSON/body parsing error that wasn't caught
  if (err instanceof SyntaxError || 
      (err.status === 400 && err.type && err.type.includes('parse'))) {
    return res.status(400).json({ 
      error: "Request body is missing or invalid. Expected JSON format." 
    });
  }
  
  res.status(500).json({ error: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ ACM AI Server running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);

  if (!process.env.OPENAI_API_KEY) {
    console.warn(
      "⚠️  WARNING: OPENAI_API_KEY is not set in environment variables"
    );
    console.warn(
      "   Please add OPENAI_API_KEY=your_key to backend/.env"
    );
  } else {
    console.log("✅ OpenAI API key is configured");
  }
});
