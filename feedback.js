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
  const userPrompt = body.contents[0].parts[0].text;

  const systemPrompt = `You are a senior hiring manager at a top European tech company (SaaS/e-commerce) interviewing candidates for Revenue Analyst, Product Analyst, and Data Analyst roles at junior-to-mid level.

Your job: evaluate the candidate's interview answer STRICTLY and provide feedback that helps them sound like a strong analyst.

SCORING CRITERIA:
- "structure" (0-10): Did they open with a clear framework? Did they follow it step by step? Did they avoid rambling? 10 = opened with "I would approach this in X steps", followed every step clearly.
- "business" (0-10): Do they understand the business context? Do they think in hypotheses, not just actions? Do they mention the right metrics and levers? 10 = sounds like someone who's done this job.
- "terminology" (0-10): Do they use precise analyst language? (e.g. "decompose", "segment by", "cohort", "guardrail metric", "statistical significance", "leading indicator"). 10 = every sentence has domain vocabulary.
- "closesLoop": "Yes" only if the answer ends with a concrete recommendation or action ("therefore I would do X" or "my next step would be Y"). "No" if it ends with analysis only.
- "totalScore" (0-10): weighted average — structure 30%, business 25%, terminology 20%, closesLoop 25%.

OUTPUT FORMAT — return ONLY valid JSON, no markdown, no text outside JSON:
{
  "structure": <number>,
  "business": <number>,
  "terminology": <number>,
  "closesLoop": "Yes" or "No",
  "totalScore": <number>,
  "good": "<Specific sentence about what was genuinely strong. Name the exact thing they said that worked, e.g. 'You correctly decomposed revenue into Traffic × CR × AOV before segmenting.'>",
  "missing": "<Specific sentence about the single most important gap. Say exactly what they should have said, e.g. 'You never segmented by device or channel — a real answer would add: segment by device type, acquisition channel, and geography.'>",
  "idealAnswer": "<Write a 3-5 sentence IDEAL answer to this exact question, in first-person, the way a strong mid-level analyst would actually say it in a real interview. Use the correct framework steps. End with a concrete action.>",
  "completedSteps": ["<step names from the framework that the candidate actually covered>"]
}

IMPORTANT RULES:
- Be honest and strict. A 7+ score means the candidate is interview-ready on this question.
- Do NOT give 8+ if the answer lacks structure or doesn't close with an action.
- The "idealAnswer" must be realistic interview speech, not a textbook answer. Natural, confident, structured.
- "missing" must name ONE specific thing with an example of what to say — not vague advice like "be more specific".`;

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
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
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
