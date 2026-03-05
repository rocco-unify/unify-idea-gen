'use client';

import { useState } from 'react';

export default function Home() {
  const [company, setCompany] = useState('GigSafe');
  const [domain, setDomain] = useState('gigsafe.com');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(null);

  async function generate() {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, domain }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
    } catch (e) {
      setError('Something went wrong. Check the company info and try again.');
    } finally {
      setLoading(false);
    }
  }

  function copyText(text, id) {
    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.position = 'fixed';
      el.style.opacity = '0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(id);
      setTimeout(() => setCopied(null), 1500);
    } catch (e) {}
  }

  function copyAll() {
    if (!result) return;
    const lines = [
      `AGENTS — ${company}`,
      '',
      ...result.agents.map((a, i) => `${i + 1}. ${a.name}\n   Trigger: ${a.trigger}\n   Why: ${a.why}`),
      '',
      'SNIPPETS',
      '',
      ...result.snippets.map(s => `• ${s}`)
    ];
    copyText(lines.join('\n'), 'all');
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Syne:wght@700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        body { background: #0a0a0a; }
        ::selection { background: #b5ff4d; color: #0a0a0a; }
        .tag { display: inline-block; background: #b5ff4d; color: #0a0a0a; font-size: 10px; font-weight: 500; padding: 2px 8px; border-radius: 3px; letter-spacing: 0.08em; text-transform: uppercase; }
        .card { background: #141414; border: 1px solid #252525; border-radius: 8px; }
        .btn { cursor: pointer; border: none; font-family: 'DM Mono', monospace; font-size: 13px; border-radius: 5px; transition: all 0.15s; }
        .btn-primary { background: #b5ff4d; color: #0a0a0a; padding: 12px 28px; font-weight: 500; width: 100%; }
        .btn-primary:hover { background: #c8ff6e; transform: translateY(-1px); }
        .btn-primary:disabled { background: #2a2a2a; color: #555; cursor: not-allowed; transform: none; }
        .btn-copy { background: #1e1e1e; color: #888; padding: 5px 12px; border: 1px solid #2a2a2a; font-size: 11px; cursor: pointer; border-radius: 5px; font-family: 'DM Mono', monospace; transition: all 0.15s; }
        .btn-copy:hover { background: #252525; color: #ccc; }
        .btn-copy.active { background: #1a2a0a; color: #b5ff4d; border-color: rgba(181,255,77,0.27); }
        .agent-card { background: #111; border: 1px solid #1e1e1e; border-radius: 6px; padding: 16px 18px; margin-bottom: 10px; transition: border-color 0.2s; }
        .agent-card:hover { border-color: #2e2e2e; }
        .snippet-row { background: #111; border: 1px solid #1e1e1e; border-radius: 6px; padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: flex-start; gap: 12px; }
        .snippet-row:hover { border-color: #2e2e2e; }
        input[type=text] { background: #111; border: 1px solid #252525; color: #e8e4da; padding: 10px 14px; border-radius: 5px; font-size: 14px; width: 100%; outline: none; transition: border-color 0.15s; font-family: 'DM Mono', monospace; }
        input[type=text]:focus { border-color: rgba(181,255,77,0.33); }
        .shimmer { animation: pulse 1.5s ease-in-out infinite; background: #141414; border-radius: 6px; margin-bottom: 10px; }
        @keyframes pulse { 0%,100%{opacity:0.4} 50%{opacity:0.8} }
        .fade-in { animation: fadeIn 0.4s ease; }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        label { font-size: 11px; color: #555; display: block; margin-bottom: 6px; letter-spacing: 0.06em; text-transform: uppercase; font-family: 'DM Mono', monospace; }
      `}</style>

      <div style={{
        minHeight: '100vh',
        background: '#0a0a0a',
        fontFamily: "'DM Mono', 'Courier New', monospace",
        color: '#e8e4da',
        padding: '40px 24px',
      }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ marginBottom: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#555', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Unify</span>
              <span style={{ color: '#2a2a2a' }}>·</span>
              <span className="tag">Agent + Snippet Generator</span>
            </div>
            <h1 style={{ fontFamily: "'Syne', sans-serif", fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: '-0.02em', lineHeight: 1.1, color: '#e8e4da' }}>
              Outbound Idea<br />
              <span style={{ color: '#b5ff4d' }}>Generator</span>
            </h1>
            <p style={{ color: '#555', fontSize: 13, marginTop: 12, lineHeight: 1.6 }}>
              Drop in a company name + domain. Get instant agent and snippet ideas to power outbound in Unify.
            </p>
          </div>

          {/* Input */}
          <div className="card" style={{ padding: 20, marginBottom: 24 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
              <div>
                <label>Company Name</label>
                <input type="text" value={company} onChange={e => setCompany(e.target.value)} placeholder="e.g. GigSafe" />
              </div>
              <div>
                <label>Domain</label>
                <input type="text" value={domain} onChange={e => setDomain(e.target.value)} placeholder="e.g. gigsafe.com" />
              </div>
            </div>
            <button className="btn btn-primary" onClick={generate} disabled={loading || !company || !domain}>
              {loading ? 'Generating...' : 'Generate Ideas →'}
            </button>
          </div>

          {/* Loading */}
          {loading && [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 72 }} />)}

          {/* Error */}
          {error && (
            <div style={{ background: '#1a0a0a', border: '1px solid #3a1a1a', borderRadius: 6, padding: 14, color: '#ff6b6b', fontSize: 13 }}>
              {error}
            </div>
          )}

          {/* Results */}
          {result && (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 12, color: '#444' }}>{result.agents.length} agents · {result.snippets.length} snippets</span>
                <button className={`btn-copy ${copied === 'all' ? 'active' : ''}`} onClick={copyAll}>
                  {copied === 'all' ? 'Copied!' : 'Copy all'}
                </button>
              </div>

              {/* Agents */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="tag">Agents</span>
                  <span style={{ fontSize: 11, color: '#444' }}>always-on signals</span>
                </div>
                {result.agents.map((agent, i) => (
                  <div key={i} className="agent-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#e8e4da', marginBottom: 6 }}>
                          <span style={{ color: '#444', marginRight: 8 }}>{String(i+1).padStart(2,'0')}</span>
                          {agent.name}
                        </div>
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4, lineHeight: 1.5 }}>
                          <span style={{ color: '#444' }}>Trigger: </span>{agent.trigger}
                        </div>
                        <div style={{ fontSize: 12, color: '#555', lineHeight: 1.5 }}>
                          <span style={{ color: '#444' }}>Why: </span>{agent.why}
                        </div>
                      </div>
                      <button className={`btn-copy ${copied === `a${i}` ? 'active' : ''}`} style={{ marginLeft: 12, flexShrink: 0 }}
                        onClick={() => copyText(`${agent.name}\nTrigger: ${agent.trigger}\nWhy: ${agent.why}`, `a${i}`)}>
                        {copied === `a${i}` ? '✓' : 'Copy'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Snippets */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                  <span className="tag" style={{ background: '#e8e4da', color: '#0a0a0a' }}>Snippets</span>
                  <span style={{ fontSize: 11, color: '#444' }}>drop into email or LinkedIn</span>
                </div>
                {result.snippets.map((snippet, i) => (
                  <div key={i} className="snippet-row">
                    <span style={{ color: '#333', flexShrink: 0, fontSize: 13, marginTop: 1 }}>—</span>
                    <span style={{ fontSize: 13, color: '#bbb', lineHeight: 1.6, flex: 1 }}>{snippet}</span>
                    <button className={`btn-copy ${copied === `s${i}` ? 'active' : ''}`} style={{ flexShrink: 0 }}
                      onClick={() => copyText(snippet, `s${i}`)}>
                      {copied === `s${i}` ? '✓' : 'Copy'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
