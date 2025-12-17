import OpenAI from "openai";
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

module.exports = {
  explainChanges: async (data) => {
    const prompt = `
  Explain financial changes simply:
  ${JSON.stringify(data)}
  Keep it concise, actionable, friendly.
  `;

    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });

    return res.choices[0].message.content;
  },
};
