import { getGeminiResponse } from "./gemini.js";
const prompt = "Hello how are you?";

// You must 'await' the response because getGeminiResponse is asynchronous
try {
  const res = await getGeminiResponse(prompt);
  console.log("Gemini says:", res);
} catch (error) {
  console.error("Caught Error:", error.message);
}
