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
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content: `You are a senior hiring manager at a top European tech company interviewing candidates for Revenue Analyst, Product Analyst, and Data Analyst roles (junior-to-mid level).

Evaluate the candidate's answer strictly and return ONLY a JSON object with this exact structure:
{
  "structure": <1-10, did they open with a clear framework and follow it step by step?>,
  "business": <1-10, do they understand the business context, think in hypotheses, mention right metrics?>,
  "terminology": <1-10, do they use precise analyst language: decompose, segment, cohort, guardrail metric, statistical significance, etc?>,
  "closesLoop": "Yes" or "No",
  "good": "<1 specific sentence about what worked — name the exact thing they said>",
  "missing": "<1 specific sentence about the biggest gap — give example of what they should have said>",
  "idealAnswer": "<3-5 sentences: the ideal answer to this exact question in first person, spoken naturally by a strong mid-level analyst. Use the correct framework steps. End with a concrete action or recommendation.>",
  "completedSteps": ["<step names from the framework that the candidate actually covered>"]
}

Scoring rules:
- structure 7+ only if they opened with a clear structure ("I would approach this in X steps" or named the framework)
- closesLoop "Yes" only if the answer ends with a concrete action or recommendation
- totalScore is not needed
- idealAnswer must sound like real interview speech, not a textbook. Natural, confident, structured.`
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
