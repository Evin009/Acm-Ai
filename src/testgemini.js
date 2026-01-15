import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

async function test() {
  try {
    if (!process.env.GEMINI_API_KEY) {
      console.error("❌ Error: GEMINI_API_KEY is not set in .env file");
      console.log("Please create a .env file with: GEMINI_API_KEY=your_api_key_here");
      return;
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    
    console.log("🧪 Testing Gemini API...");
    const result = await model.generateContent(
      "Hi, when is Independence Day in the US?"
    );
    
    console.log("✅ Success! Response:");
    console.log(result.response.text());
  } catch (err) {
    console.error("❌ Gemini test error:", err.message);
    if (err.message?.includes("API_KEY")) {
      console.error("   Make sure your GEMINI_API_KEY is valid");
    }
  }
}

test();
