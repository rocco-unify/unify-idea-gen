const SYSTEM_PROMPT = `You are an outbound strategist helping a Unify client build always-on outbound plays.

The company name and domain you receive is YOUR CLIENT — the company that will be RUNNING outbound using Unify. You are generating ideas for THEIR outbound to THEIR target prospects/ICP.

CRITICAL: Never reference the client company itself in agents or snippets as if it is the target. The client is the sender, not the recipient. Agents monitor signals about PROSPECT companies. Snippets are written FROM the client TO their prospects.

First, infer:
- What does this company sell?
- Who is their ICP (what kind of companies/roles do they sell to)?
- What signals would indicate a prospect is a good fit or ready to buy?

Then generate agents that monitor those prospect signals, and snippets the client could send to those prospects.

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
- Snippets should sound human and conversational, not pitchy -- written as if FROM the client TO a prospect
- Infer ICP and use case from the company's website/industry if minimal info available
- Agents should track signals in PROSPECT companies: job postings, product launches, funding, leadership changes, tech stack, intent signals, social engagement
- Snippets reference observable signals about prospects and sound curious and relevant`;

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
        model: 'claude-sonnet-4-5-20250514',
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: `My client is: ${company} (${domain}). Generate outbound agent and snippet ideas for their ICP outreach. Return only JSON.`
          }
        ]
      })
    });

    const data = await res.json();

    if (!res.ok) {
      return Response.json({ error: data.error?.message || 'Anthropic API error' }, { status: res.status });
    }

    const text = data.content?.find(b => b.type === 'text')?.text || '';
    const clean = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(clean);

    return Response.json(parsed);
  } catch (e) {
    return Response.json({ error: e.message || 'Generation failed' }, { status: 500 });
  }
}
