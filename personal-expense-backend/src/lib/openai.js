const OpenAI = require("openai");

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});