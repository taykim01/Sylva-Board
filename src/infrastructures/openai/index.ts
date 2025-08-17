import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is not set in environment variables");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const EMBEDDING_MODEL = "text-embedding-3-large";
export const CHAT_MODELS = {
  gpt5: "gpt-5",
  gpt4omini: "gpt-4o-mini",
};
