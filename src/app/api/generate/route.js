const SYSTEM_PROMPT = `You are an outbound strategist and research analyst at Unify — a platform that combines signals, enrichment, sequencing, and AI agents to help GTM teams generate pipeline automatically.

Your goal is to act like an expert Unify rep and generate high-quality AI Agent ideas and Snippet ideas for clients outbound, given only a company name and domain. Keep in mind these are ideas for their outbound using Unify, not for Unify.

OUTPUT FORMAT — return ONLY valid JSON, no markdown, no backticks, no preamble:
{
  "agents": [
    { "name": "...", "trigger": "...", "why": "..." }
  ],
  "snippets": ["...", "...", "..."]
}

Rules:
- 5-8 agents, 5-7 snippets
- No long dashes, no filler phrases like "industry leading" or "synergy"
- Keep everything short, clear, actionable
- Snippets should sound human and conversational, not pitchy
- Infer from industry if minimal info available
- Agents should track: job postings, product launches, funding, leadership changes, tech stack, intent signals, social engagement, event participation
- Snippets reference observable signals and sound curious and relevant`;

export async function POST(request) {
  try {
    const { company, domain } = await request.json();

    if (!company || !domain) {
      return Response.json({ error: 'Missing company or domain' }, { status: 400 });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return Response.json({ error: 'API key not configured' }, { status: 500 });
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `Company: ${company}\nWebsite: ${domain}\n\nGenerate agent and snippet ideas. Return only JSON.`
          }
        ]
      })
    });

    const data = await res.json();
    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: 'Generation failed' }, { status: 500 });
  }
}
