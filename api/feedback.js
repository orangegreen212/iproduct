import { GoogleGenerativeAI } from "@google/generative-ai";

export const config = { runtime: 'edge', regions: ['iad1'] };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const body = await req.json();
  const prompt = body.contents[0].parts[0].text;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();

  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: text }] } }]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
