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

  const apiKey = process.env.GROQ_API_KEY; // Вставьте ключ Groq сюда
  const body = await req.json();
  const prompt = body.contents[0].parts[0].text;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }]
    })
  });

  const data = await response.json();

  return new Response(JSON.stringify({
    candidates: [{ content: { parts: [{ text: data.choices[0].message.content }] } }]
  }), {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
