import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '.env'),
});

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️  WARNING: GEMINI_API_KEY is not set in environment variables");
  console.warn("   Please create a .env file with: GEMINI_API_KEY=your_api_key_here");
}

const genAI = new GoogleGenerativeAI(apiKey || "");

export async function getGeminiResponse(prompt) {
  try {
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
    });

    const result = await model.generateContent(prompt);

    if (
      !result ||
      !result.response ||
      typeof result.response.text !== "function"
    ) {
      throw new Error("Invalid response from Gemini");
    }

    return result.response.text();
  } catch (err) {
    console.error("Gemini Error:", err);
    console.error("Error details:", {
      message: err.message,
      status: err.status,
      code: err.code,
      statusCode: err.statusCode
    });
    
    // Check for rate limit errors (429 status)
    if (err.status === 429 || err.statusCode === 429 || 
        (err.message && err.message.includes("429"))) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    
    // Check for quota exceeded
    if (err.message && (
      err.message.includes("quota") || 
      err.message.includes("Quota") ||
      err.message.includes("RESOURCE_EXHAUSTED") ||
      err.message.includes("resource exhausted")
    )) {
      throw new Error("QUOTA_EXCEEDED");
    }
    
    // Check for API key errors (401 status)
    if (err.status === 401 || err.statusCode === 401 ||
        (err.message && (
          err.message.includes("API_KEY") ||
          err.message.includes("401") ||
          err.message.includes("Unauthorized") ||
          err.message.includes("invalid API key")
        ))) {
      throw new Error("API_KEY_INVALID");
    }
    
    // Check for missing API key
    if (err.message === "API_KEY_MISSING") {
      throw new Error("API_KEY_MISSING");
    }
    
    // Generic error - include original message for debugging
    throw new Error(`GEMINI_API_ERROR: ${err.message || "Unknown error"}`);
  }
}
