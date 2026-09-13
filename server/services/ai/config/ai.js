import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  console.warn("⚠️ GEMINI_API_KEY is not defined in environment variables");
}

const genAI = new GoogleGenerativeAI(apiKey);

export const getGenerativeModel = (options = {}) => {
  const modelName = process.env.GEMINI_AI_MODEL || "gemini-3.5-flash";
  return genAI.getGenerativeModel({
    model: modelName,
    ...options,
  });
};

export default genAI;
