import { NextRequest, NextResponse } from 'next/server';
import type { TailorRequest, TailorResponse } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  const body = (await req.json()) as TailorRequest;
  const { role, jobDescription } = body;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI tailoring unavailable — no API key configured. Using local tailoring.' },
      { status: 503 }
    );
  }

  const prompt = `You are an expert resume tailoring assistant. Given a target role and job description, rewrite the resume JSON.
Rules:
1. NEVER alter: name, contact, education, dates, project names, or certification titles.
2. Rewrite the "summary" (2 lines max) to match the target role.
3. Re-order "skills" categories so the most relevant group appears first.
4. Re-frame "projects" and "positions" bullet points with action verbs and metrics relevant to the role.
5. Return ONLY valid JSON with keys: summary, skills[], projects[], positions[].

Target Role: ${role}
Job Description: ${jobDescription}

Resume JSON: ${JSON.stringify(body.resume)}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: 'application/json' },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { error: 'AI service error. Using local tailoring.' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { error: 'Empty AI response. Using local tailoring.' },
        { status: 502 }
      );
    }

    const tailored = JSON.parse(text) as TailorResponse;
    return NextResponse.json(tailored);
  } catch {
    return NextResponse.json(
      { error: 'AI tailoring failed. Using local tailoring.' },
      { status: 502 }
    );
  }
}
