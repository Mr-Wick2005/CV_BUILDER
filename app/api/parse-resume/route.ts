import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData } from '@/lib/types';
import { DEFAULT_STYLE_SETTINGS, DEFAULT_SECTION_ORDER } from '@/lib/sample-profiles';
import { parseResumeSmart, parseResumeFromLayout, type LayoutExtractedDoc } from '@/lib/parser';

export const runtime = 'edge';

function deterministicValidate(parsed: Partial<ResumeData>, fallback: ResumeData, layout?: LayoutExtractedDoc): ResumeData {
  // Ensure name is verbatim
  const cleanName = fallback.contact.name && fallback.contact.name !== 'YOUR NAME'
    ? fallback.contact.name
    : (parsed.contact?.name || fallback.contact.name || 'YOUR NAME');

  const cleanEmail = fallback.contact.email || parsed.contact?.email || '';
  const cleanPhone = fallback.contact.phone || parsed.contact?.phone || '';
  const cleanLocation = fallback.contact.location || parsed.contact?.location || '';
  const cleanLinkedin = fallback.contact.linkedin || parsed.contact?.linkedin || '';
  const cleanGithub = fallback.contact.github || parsed.contact?.github || '';

  // Ensure skills preserve 2-column layout from layout if available
  let skills = parsed.skills && parsed.skills.length > 0 ? parsed.skills : fallback.skills;
  if (fallback.skills && fallback.skills.length >= 4) {
    skills = fallback.skills;
  }

  // Ensure project links from annotations are preserved
  let projects = parsed.projects && parsed.projects.length > 0 ? parsed.projects : fallback.projects;
  if (fallback.projects && fallback.projects.length > 0) {
    projects = projects.map((p, idx) => {
      const fb = fallback.projects[idx];
      return {
        ...p,
        link: p.link || fb?.link,
        github: p.github || fb?.github,
        visible: true,
      };
    });
  }

  return {
    id: `imported-${Date.now()}`,
    title: `${cleanName}'s Resume`,
    contact: {
      name: cleanName,
      headline: parsed.contact?.headline || fallback.contact.headline,
      phone: cleanPhone,
      email: cleanEmail,
      location: cleanLocation,
      github: cleanGithub,
      linkedin: cleanLinkedin,
      portfolio: parsed.contact?.portfolio || fallback.contact.portfolio,
      website: parsed.contact?.website || fallback.contact.website,
    },
    summary: parsed.summary || fallback.summary,
    education: parsed.education && parsed.education.length > 0 ? parsed.education : fallback.education,
    skills,
    positions: parsed.positions && parsed.positions.length > 0 ? parsed.positions : fallback.positions,
    projects,
    certifications: parsed.certifications && parsed.certifications.length > 0 ? parsed.certifications : fallback.certifications,
    style: DEFAULT_STYLE_SETTINGS,
    sectionOrder: fallback.sectionOrder || DEFAULT_SECTION_ORDER,
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  let body: { text?: string; layout?: LayoutExtractedDoc; userApiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { text, layout, userApiKey } = body;
  const rawText = layout?.rawText || text || '';

  if (!rawText || rawText.trim().length < 15) {
    return NextResponse.json({ error: 'Please provide valid resume content' }, { status: 400 });
  }

  // 1. Compute local layout-aware baseline
  const localParsed = layout ? parseResumeFromLayout(layout) : parseResumeSmart(rawText);

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(localParsed);
  }

  const prompt = `You are an expert ATS Resume Parser. Extract all details from this resume into a clean JSON object.

RULES:
1. Candidate FULL NAME: copy EXACTLY verbatim (e.g. "${localParsed.contact.name}"). NEVER abbreviate, truncate, or merge with location.
2. Location: copy EXACTLY (e.g. "${localParsed.contact.location}").
3. Email & Phone: copy verbatim (e.g. "${localParsed.contact.email}", "${localParsed.contact.phone}").
4. LinkedIn & GitHub: preserve URLs verbatim (LinkedIn: "${localParsed.contact.linkedin}", GitHub: "${localParsed.contact.github}").
5. Professional Summary: extract full summary text without cutting off sentences.
6. Education: extract degree, institution, and exact duration dates (e.g. "Duration: 2023 – 2027").
7. Skills: Extract each category with skill list and preserve column 1 vs 2.
8. Positions of Responsibility: Extract each role title line and its sub-bullets.
9. Projects: Extract each project name, tech stack, clickable links, and bullets.
10. Certifications: Extract title, issuer, year.

Raw Text:
"""
${rawText.slice(0, 15000)}
"""

Respond ONLY with valid JSON:
{
  "contact": {
    "name": string,
    "phone": string,
    "email": string,
    "location": string,
    "github": string,
    "linkedin": string,
    "portfolio"?: string
  },
  "summary": string,
  "education": [ { "degree": string, "institution": string, "dates": string } ],
  "skills": [ { "category": string, "skills": string[], "column"?: 1 | 2 } ],
  "positions": [ { "title": string, "organization"?: string, "dates"?: string, "bullets": string[] } ],
  "projects": [ { "name": string, "tech": string[], "bullets": string[], "link"?: string, "visible": true } ],
  "certifications": [ { "title": string, "issuer": string, "year": string } ]
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
            temperature: 0.0,
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(localParsed);
    }

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      return NextResponse.json(localParsed);
    }

    const parsedJson = JSON.parse(resultText) as Partial<ResumeData>;
    const validated = deterministicValidate(parsedJson, localParsed, layout);
    return NextResponse.json(validated);
  } catch {
    return NextResponse.json(localParsed);
  }
}
