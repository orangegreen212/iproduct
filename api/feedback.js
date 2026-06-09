export const config = { runtime: 'edge', regions: ['iad1'] };

export default async function handler(req) {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' } });
  }

  const apiKey = process.env.GROQ_API_KEY;
  const body = await req.json();
  const prompt = body.contents[0].parts[0].text;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      temperature: 0.5, // Немного поднял для более развернутого ответа
      messages: [
        { 
          role: "system", 
          content: `You are a senior analyst interviewer. Evaluate the answer.
          Return ONLY JSON:
          {
            "structure": score 1-10,
            "business": score 1-10,
            "terminology": score 1-10,
            "closesLoop": "Yes" or "No",
            "totalScore": score 1-10,
            "good": "one specific sentence",
            "missing": "one specific sentence",
            "idealAnswer": "Provide a complete 3-5 sentence ideal response in the first person, demonstrating perfect framework usage and action-oriented conclusion.",
            "completedSteps": ["Validate", "Decompose", "Segment", "Hypothesize", "Validate hyp."]
          }`
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    })
  });

  const data = await response.json();
  return new Response(data.choices[0].message.content, {
    status: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }
  });
}
