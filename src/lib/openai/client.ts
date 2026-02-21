import OpenAI from "openai";

let _client: OpenAI | null = null;

export function getOpenAIClient(): OpenAI {
  if (!_client) {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) throw new Error("NEXT_PUBLIC_OPENAI_API_KEY is not set");
    _client = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }
  return _client;
}
