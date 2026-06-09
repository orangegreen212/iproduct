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

  const apiKey = process.env.GROQ_API_KEY;
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
      messages: [
        { 
          role: "system", 
          content: `You are an expert interviewer. Evaluate the candidate's answer. 
          Return ONLY a JSON object with this structure:
          {
            "structure": score 1-10,
            "business": score 1-10,
            "terminology": score 1-10,
            "closesLoop": "Yes" or "No",
            "good": "1 sentence what was good",
            "missing": "1 sentence what was missing",
            "completedSteps": ["Step1", "Step2"]
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
