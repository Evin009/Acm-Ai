import { getGeminiResponse } from "./gemini.js";
const prompt = "Hello how are you?";

// You must 'await' the response because getGeminiResponse is asynchronous
try {
  const res = await getGeminiResponse(prompt);
  console.log("Gemini says:", res);
} catch (error) {
  console.error("Caught Error:", error.message);
}

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// export async function getGeminiResponse(prompt) {
//   try {
//     const model = genAI.getGenerativeModel({
//       model: "gemini-pro",
//     });

//     // const prompt = "Write a sonnet about a programmers life, but also make it rhyme"

//     const result = await model.generateContent(prompt);

//     if (
//       !result ||
//       !result.response ||
//       typeof result.response.text !== "function"
//     ) {
//       throw new Error("Invalid response from Gemini");
//     }

//     return result.response.text();
//   } catch (err) {
//     console.error("Gemini Error:", err);
//     throw new Error("Gemini API failed");
//   }
// }
