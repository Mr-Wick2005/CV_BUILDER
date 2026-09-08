import { NextRequest, NextResponse } from 'next/server';
import type { TailorRequest, TailorResponse } from '@/lib/types';
import { tailorResume } from '@/lib/tailor';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let body: TailorRequest;
  try {
    body = (await req.json()) as TailorRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { role, jobDescription, resume, userApiKey } = body;

  if (!role || !resume) {
    return NextResponse.json({ error: 'Role and resume data are required' }, { status: 400 });
  }

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  // If no Gemini key is available, execute dynamic local tailoring
  if (!apiKey) {
    const localTailored = tailorResume(resume, role, jobDescription || '');
    return NextResponse.json({
      summary: localTailored.summary,
      skills: localTailored.skills,
      projects: localTailored.projects,
      positions: localTailored.positions,
    });
  }

  const prompt = `You are a world-class executive resume strategist and ATS optimization expert.
Given a student's resume JSON, a target role ("${role}"), and the job description, rewrite and optimize the resume.

STRICT ATS & INTEGRITY RULES:
1. NEVER fabricate fake degrees, fake universities, fake companies, or fake project names.
2. REWRITE the "summary" (2-3 concise, impactful sentences) highlighting relevant technical capabilities and enthusiasm for ${role}.
3. RE-ORDER & CATEGORIZE "skills" so the skills most critical to ${role} appear in the first categories.
4. RE-FRAME each project and position bullet point using the STAR method (Situation, Task, Action, Result) with strong action verbs (e.g. Engineered, Spearheaded, Architected, Automated, Optimized) and quantifiable impact metrics where applicable.
5. PRESERVE the exact array lengths and names of projects and positions.

Target Role: ${role}
Job Description:
${jobDescription || 'Standard requirements for ' + role}

Current Resume JSON:
${JSON.stringify(resume)}

Respond ONLY with a valid JSON object strictly matching this schema:
{
  "summary": string,
  "skills": [ { "category": string, "skills": string[] } ],
  "projects": [ { "name": string, "tech": string[], "bullets": string[], "visible": boolean } ],
  "positions": [ { "title": string, "organization"?: string, "dates"?: string, "bullets": string[] } ]
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) {
      const localTailored = tailorResume(resume, role, jobDescription || '');
      return NextResponse.json({
        summary: localTailored.summary,
        skills: localTailored.skills,
        projects: localTailored.projects,
        positions: localTailored.positions,
      });
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      const localTailored = tailorResume(resume, role, jobDescription || '');
      return NextResponse.json({
        summary: localTailored.summary,
        skills: localTailored.skills,
        projects: localTailored.projects,
        positions: localTailored.positions,
      });
    }

    const tailored = JSON.parse(text) as TailorResponse;
    return NextResponse.json(tailored);
  } catch {
    const localTailored = tailorResume(resume, role, jobDescription || '');
    return NextResponse.json({
      summary: localTailored.summary,
      skills: localTailored.skills,
      projects: localTailored.projects,
      positions: localTailored.positions,
    });
  }
}
