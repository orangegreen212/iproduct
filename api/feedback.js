export const config = { runtime: 'edge', regions: ['iad1'] };

export default async function handler(req) {
  const apiKey = process.env.GEMINI_API_KEY;
  // В 2026 году API может использовать v1 или v1beta. Проверим список моделей:
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await response.json();
  
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
