import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData } from '@/lib/types';
import { DEFAULT_STYLE_SETTINGS, DEFAULT_SECTION_ORDER } from '@/lib/sample-profiles';
import { parseResumeSmart } from '@/lib/parser';

export const runtime = 'edge';

function sanitizeResume(data: Partial<ResumeData>, fallbackRaw: string): ResumeData {
  const fallback = parseResumeSmart(fallbackRaw);

  let cleanName = data.contact?.name?.trim() || fallback.contact.name;
  // If name is suspiciously long (e.g. paragraph or > 40 chars), use fallback name
  if (cleanName.length > 40 || cleanName.split(/\s+/).length > 4 || cleanName.includes('\n')) {
    cleanName = fallback.contact.name;
  }

  return {
    id: `imported-${Date.now()}`,
    title: `${cleanName}'s Resume`,
    contact: {
      name: cleanName,
      phone: data.contact?.phone || fallback.contact.phone,
      email: data.contact?.email || fallback.contact.email,
      location: data.contact?.location || fallback.contact.location,
      github: data.contact?.github || fallback.contact.github,
      linkedin: data.contact?.linkedin || fallback.contact.linkedin,
      portfolio: data.contact?.portfolio || fallback.contact.portfolio,
    },
    summary: data.summary || fallback.summary,
    education: data.education && data.education.length > 0 ? data.education : fallback.education,
    skills: data.skills && data.skills.length > 0 ? data.skills : fallback.skills,
    positions: data.positions && data.positions.length > 0 ? data.positions : fallback.positions,
    projects: data.projects && data.projects.length > 0 ? data.projects : fallback.projects,
    certifications: data.certifications && data.certifications.length > 0 ? data.certifications : fallback.certifications,
    style: DEFAULT_STYLE_SETTINGS,
    sectionOrder: DEFAULT_SECTION_ORDER,
    updatedAt: new Date().toISOString(),
  };
}

export async function POST(req: NextRequest) {
  let body: { text: string; userApiKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const { text, userApiKey } = body;
  if (!text || text.trim().length < 15) {
    return NextResponse.json({ error: 'Please provide valid resume text' }, { status: 400 });
  }

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    const parsed = parseResumeSmart(text);
    return NextResponse.json(parsed);
  }

  const prompt = `You are an expert ATS Resume Parser. Extract all details from this resume text into a clean, validated JSON object.

Rules:
1. Extract candidate's FULL NAME (1-4 words max, e.g. "VEDANTH GALI"). NEVER put paragraphs or contact lists into the name.
2. Extract phone, email, location (City, State, Country), linkedin URL, github URL.
3. Extract professional summary (2-3 sentences max).
4. Group education items into array of { degree, institution, dates, gpa?, coursework? }.
5. Group skills into categories { category: string, skills: string[] }.
6. Extract positions/experience into array of { title, organization?, dates?, bullets: string[] }.
7. Extract projects into array of { name, tech: string[], bullets: string[], visible: true }.
8. Extract certifications into array of { title, issuer, year }.

Raw Resume Text:
"""
${text.slice(0, 15000)}
"""

Respond ONLY with valid JSON matching this schema:
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
  "education": [ { "degree": string, "institution": string, "dates": string, "gpa"?: string, "coursework"?: string } ],
  "skills": [ { "category": string, "skills": string[] } ],
  "positions": [ { "title": string, "organization"?: string, "dates"?: string, "bullets": string[] } ],
  "projects": [ { "name": string, "tech": string[], "bullets": string[], "visible": true } ],
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
            temperature: 0.1,
          },
        }),
      }
    );

    if (!res.ok) {
      const parsed = parseResumeSmart(text);
      return NextResponse.json(parsed);
    }

    const data = await res.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!resultText) {
      const parsed = parseResumeSmart(text);
      return NextResponse.json(parsed);
    }

    const parsedJson = JSON.parse(resultText) as Partial<ResumeData>;
    const sanitized = sanitizeResume(parsedJson, text);
    return NextResponse.json(sanitized);
  } catch {
    const parsed = parseResumeSmart(text);
    return NextResponse.json(parsed);
  }
}
