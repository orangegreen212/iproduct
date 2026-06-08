export const config = { 
  runtime: 'edge',
  regions: ['iad1'] 
};

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
  const body = await req.json();

  // Используем модель gemini-1.5-flash-8b, она стабильнее для бесплатных аккаунтов
  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`;

  const response = await fetch(geminiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  const data = await response.json();

  return new Response(JSON.stringify(data), {
    status: response.status,
    headers: { 
        'Content-Type': 'application/json', 
        'Access-Control-Allow-Origin': '*' 
    }
  });
}
