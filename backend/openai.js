import OpenAI from "openai";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({
  path: path.resolve(__dirname, ".env"),
});

const apiKey = process.env.OPENAI_API_KEY;

if (!apiKey) {
  console.warn("⚠️  WARNING: OPENAI_API_KEY is not set in environment variables");
  console.warn("   Please add OPENAI_API_KEY=your_key to backend/.env");
}

const openai = new OpenAI({ apiKey: apiKey || "" });

export async function getOpenAIResponse(prompt) {
  try {
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const content = completion?.choices?.[0]?.message?.content;
    if (content == null || typeof content !== "string") {
      throw new Error("Invalid response from OpenAI");
    }

    return content;
  } catch (err) {
    console.error("OpenAI Error:", err);
    console.error("Error details:", {
      message: err.message,
      status: err.status,
      code: err.code,
      statusCode: err.statusCode,
    });

    if (err.status === 429 || err.statusCode === 429 || (err.message && err.message.includes("429"))) {
      throw new Error("RATE_LIMIT_EXCEEDED");
    }
    if (
      err.message &&
      (err.message.toLowerCase().includes("quota") ||
        err.message.includes("RESOURCE_EXHAUSTED") ||
        err.message.includes("rate limit"))
    ) {
      throw new Error("QUOTA_EXCEEDED");
    }
    if (
      err.status === 401 ||
      err.statusCode === 401 ||
      (err.message &&
        (err.message.includes("API_KEY") ||
          err.message.includes("401") ||
          err.message.includes("Unauthorized") ||
          err.message.includes("invalid API key") ||
          err.message.includes("Incorrect API key")))
    ) {
      throw new Error("API_KEY_INVALID");
    }
    if (err.message === "API_KEY_MISSING") {
      throw new Error("API_KEY_MISSING");
    }

    throw new Error(`OPENAI_API_ERROR: ${err.message || "Unknown error"}`);
  }
}
