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

const SYSTEM_PROMPT = `You are playing a Taboo-style word guessing game.

Your goal is to guess a hidden target word based on clues provided by the player.

Rules you must follow:
- The player is NOT allowed to use certain taboo words (or their close variants).
- You must NEVER guess the word immediately if the player violates the taboo list.
- If you detect a taboo word, politely state that a taboo word was used and ask the player to rephrase.
- Do NOT assist the player by suggesting clues, strategies, or alternative words.
- Do NOT reveal or hint at the taboo words.
- Do NOT ask leading questions that narrow the answer too aggressively.

Gameplay behavior:
- Carefully interpret the clues provided.
- Use reasoning and inference, but keep guesses concise.
- If unsure, ask ONE neutral clarification question or make an educated guess.
- When confident, guess a single word or short phrase only.
- Once you guess correctly, clearly acknowledge success and stop guessing.

Tone & style:
- Be neutral, friendly, and game-focused.
- Avoid technical explanations or meta-commentary.
- Treat this as a live game, not a tutoring session.

You are here to play fairly and make the game fun, challenging, and engaging.`;

export async function getOpenAIResponse(prompt) {
  try {
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
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
