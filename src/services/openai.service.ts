import { openai } from "@/infrastructures/openai";

type ModelTypes = "gpt-5" | "gpt-4o-mini" | "text-embedding-3-large";
type ResponseTypes = "json_object" | "text";
export type ChatCompletionParam = {
  role: "system" | "user" | "assistant",
  content: string
}

export default class OpenAIService {
  async generateResponse(messages: ChatCompletionParam[], format: ResponseTypes, model: ModelTypes) {
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages,
      response_format: { type: format },
    });

    const response: string = chatCompletion.choices[0].message.content!;
    if (!response) throw new Error();

    if(format === "json_object") return JSON.parse(response);
    else if(format === "text")  return response;
  }

  async generateVisionResponse(messages: never[], format: ResponseTypes, model: ModelTypes): Promise<string> {
    const chatCompletion = await openai.chat.completions.create({
      model,
      messages: messages,
      response_format: { type: format },
    });

    const response: string = chatCompletion.choices[0].message.content!;
    if (!response) throw new Error();

    return response;
  }

  async generateEmbedding(input: string, model: ModelTypes = "text-embedding-3-large"): Promise<number[]> {
    const embedding = await openai.embeddings.create({
      model,
      input,
      encoding_format: "float",
    });
    const vector = embedding.data[0].embedding;
    return vector;
  }
}
