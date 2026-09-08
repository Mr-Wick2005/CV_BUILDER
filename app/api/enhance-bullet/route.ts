import { NextRequest, NextResponse } from 'next/server';
import { enhanceBulletLocally } from '@/lib/tailor';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let body: {
    bullet?: string;
    role?: string;
    context?: string;
    action?: string;
    userApiKey?: string;
    name?: string;
    tech?: string[];
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const {
    bullet = '',
    role = 'Software Engineer',
    context = '',
    action = 'enhance_bullet',
    userApiKey,
    name = '',
    tech = [],
  } = body;

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  // 1. Generate Headline / Tagline
  if (action === 'generate_headline') {
    if (!apiKey) {
      return NextResponse.json({
        enhanced: `${role} | ${context || 'Full Stack & Cloud Applications'}`,
      });
    }

    const prompt = `Generate a modern, ATS-friendly professional 1-line headline/tagline for a resume.
Target Role: ${role}
Candidate Details / Skills: ${context || 'Computer Engineering, React, Node.js, SQL'}
Output ONLY the 1-line headline (e.g. "Software Engineer | Full Stack & Distributed Systems" or "Computer Engineering Student | Web & Cloud Technologies"). Do NOT add quotes or chatter.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ enhanced: text || `${role} | Engineering & Development` });
    } catch {
      return NextResponse.json({ enhanced: `${role} | Engineering & Development` });
    }
  }

  // 2. Polish Summary
  if (action === 'polish_summary') {
    if (!apiKey) {
      return NextResponse.json({
        enhanced: `Results-driven ${role} student with hands-on experience building scalable web applications and distributed systems. Proven track record in rapid prototyping, collaborative development, and implementing clean, high-performance UI/UX architectures.`,
      });
    }

    const prompt = `You are a Fortune 500 tech recruiter. Rewrite this resume summary into an impactful, concise 2-3 sentence executive summary tailored for a ${role}.
Original text: "${bullet || context}"
Focus on technical execution, problem solving, impact, and scalability.
Output ONLY the rewritten summary paragraph with NO quotation marks or preamble.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.3 },
          }),
        }
      );
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      return NextResponse.json({ enhanced: text || bullet });
    } catch {
      return NextResponse.json({ enhanced: bullet });
    }
  }

  // 3. Generate Project Bullets from Tech Stack
  if (action === 'generate_project_bullets') {
    const projectTitle = name || context || 'Web Application';
    const techStack = tech.join(', ') || 'React, Node.js, SQL';

    if (!apiKey) {
      return NextResponse.json({
        bullets: [
          `Architected responsive ${projectTitle} platform using ${techStack}, supporting seamless user workflows and real-time state synchronization.`,
          `Engineered modular backend REST APIs and secure database schemas, reducing query response times by 30%.`,
          `Integrated comprehensive authentication protocols and automated testing, elevating reliability and user retention.`,
        ],
      });
    }

    const prompt = `Generate 3 strong STAR-method resume bullet points for a project titled "${projectTitle}" built using: ${techStack}.
Target Role: ${role}
Rules:
- Each bullet must start with a powerful past-tense action verb (Architected, Engineered, Developed, Deployed, Automated).
- Include realistic engineering metrics (e.g. latency, throughput, test coverage, user scale).
- Output exactly 3 bullet points separated by newlines, with no bullet characters and no extra conversational text.`;

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4 },
          }),
        }
      );
      if (!res.ok) throw new Error('API failed');
      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
      const bullets = text
        .split('\n')
        .map((b: string) => b.replace(/^[-•*\d.]+\s*/, '').trim())
        .filter((b: string) => b.length > 10)
        .slice(0, 3);

      return NextResponse.json({
        bullets:
          bullets.length > 0
            ? bullets
            : [
                `Architected full-stack ${projectTitle} using ${techStack}, optimizing performance and user experience.`,
                `Implemented robust REST API endpoints and state management, reducing data fetch latencies by 25%.`,
                `Streamlined deployment workflows and responsive design patterns across multiple viewports.`,
              ],
      });
    } catch {
      return NextResponse.json({
        bullets: [
          `Architected full-stack ${projectTitle} using ${techStack}, optimizing performance and user experience.`,
          `Implemented robust REST API endpoints and state management, reducing data fetch latencies by 25%.`,
          `Streamlined deployment workflows and responsive design patterns across multiple viewports.`,
        ],
      });
    }
  }

  // 4. Default: Single Bullet Point Enhancement
  if (!bullet || bullet.trim().length < 4) {
    return NextResponse.json({ error: 'Bullet text is too short' }, { status: 400 });
  }

  if (!apiKey) {
    const local = enhanceBulletLocally(bullet, role, []);
    return NextResponse.json({ enhanced: local });
  }

  const prompt = `You are an elite ATS resume optimizer. Rewrite this single resume bullet point to make it punchy, metric-driven, and ATS-optimized.

Rules:
1. Start with a powerful past-tense action verb (e.g. Engineered, Spearheaded, Architected, Automated, Streamlined).
2. Follow the STAR format (Action + Technical Implementation + Impact/Result).
3. If no specific metric was provided, include realistic technical outcomes (e.g. "reducing latency by 25%", "improving test coverage to 90%", "handling 10k+ requests").
4. Keep it to exactly 1 concise sentence (20-35 words).
5. Output ONLY the rewritten bullet point text with no quotes, no markdown, and no extra chatter.

Target Role: ${role}
Context / Tech: ${context}
Original Bullet: "${bullet}"`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
          },
        }),
      }
    );

    if (!res.ok) {
      const local = enhanceBulletLocally(bullet, role, []);
      return NextResponse.json({ enhanced: local });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      const local = enhanceBulletLocally(bullet, role, []);
      return NextResponse.json({ enhanced: local });
    }

    return NextResponse.json({ enhanced: text.replace(/^[-•*"]+|["\n]+$/g, '').trim() });
  } catch {
    const local = enhanceBulletLocally(bullet, role, []);
    return NextResponse.json({ enhanced: local });
  }
}
