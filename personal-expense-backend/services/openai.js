import OpenAI from "openai";
const openai = new OpenAI();

export async function explainChange(req, res) {
  const { current, previous } = req.body;

  const prompt = `
Explain in simple terms:
Previous: ${JSON.stringify(previous)}
Current: ${JSON.stringify(current)}
`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
  });

  res.json({ explanation: response.choices[0].message.content });
}