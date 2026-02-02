import { getOpenAIResponse } from "./openai.js";
const prompt = "Hello how are you?";

try {
  const res = await getOpenAIResponse(prompt);
  console.log("OpenAI says:", res);
} catch (error) {
  console.error("Caught Error:", error.message);
}
