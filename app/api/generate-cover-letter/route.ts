import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData } from '@/lib/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  let body: {
    resume: ResumeData;
    role: string;
    company?: string;
    jobDescription: string;
    userApiKey?: string;
  };

  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { resume, role, company = 'Hiring Team', jobDescription, userApiKey } = body;
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  const today = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const c = resume.contact;

  if (!apiKey) {
    const fallbackCoverLetter = `${c.name}
${c.email} | ${c.phone} | ${c.location}
${c.linkedin}

${today}

Hiring Manager
${company}

Dear ${company} Hiring Team,

I am writing to express my strong interest in the ${role} position at ${company}. As a dedicated student with a solid foundation in ${resume.skills.map((s) => s.category).slice(0, 2).join(' and ')}, I have built practical experience through projects such as ${resume.projects[0]?.name || 'key technical projects'} and coursework.

Throughout my academic journey, I have developed technical competencies in ${resume.skills.flatMap((s) => s.skills).slice(0, 5).join(', ')}. My hands-on experience has equipped me with the problem-solving mindset and collaborative skills necessary to make immediate contributions to your team.

I am particularly excited about the opportunity to contribute to ${company}'s ongoing initiatives. I welcome the opportunity to discuss how my background, technical skills, and drive align with your goals.

Thank you for your time and consideration.

Sincerely,
${c.name}`;

    return NextResponse.json({ coverLetter: fallbackCoverLetter });
  }

  const prompt = `You are an executive career coach. Write a tailored, persuasive, and ATS-aligned Cover Letter for this student applying for the "${role}" role at "${company}".

Student Details:
Name: ${c.name}
Email: ${c.email}
Phone: ${c.phone}
Location: ${c.location}
Key Projects: ${resume.projects.map((p) => p.name).join(', ')}
Skills: ${resume.skills.flatMap((s) => s.skills).slice(0, 8).join(', ')}

Target Role: ${role}
Target Company: ${company}
Job Description:
${jobDescription || 'Standard requirements for ' + role}

Tone: Professional, confident, articulate, and authentic.
Length: 3 concise paragraphs (approx 250-320 words).
Format: Include candidate contact header, date (${today}), recipient salutation, 3-paragraph body, and professional sign-off.
Respond ONLY with the cover letter plain text.`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) {
      throw new Error('AI failed');
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text) {
      throw new Error('Empty AI response');
    }

    return NextResponse.json({ coverLetter: text });
  } catch {
    const fallbackCoverLetter = `${c.name}
${c.email} | ${c.phone} | ${c.location}
${c.linkedin}

${today}

Hiring Manager
${company}

Dear ${company} Hiring Team,

I am writing to enthusiastically express my interest in the ${role} role at ${company}. With a strong background in software engineering and hands-on experience delivering scalable applications, I am eager to contribute to your engineering team.

My technical toolkit includes ${resume.skills.flatMap((s) => s.skills).slice(0, 6).join(', ')}. In my recent project ${resume.projects[0]?.name || 'work'}, I applied these technologies to build reliable, high-performance systems. I pride myself on clean code architecture and effective cross-functional collaboration.

I would love the opportunity to discuss how my qualifications align with ${company}'s needs. Thank you for your time and consideration.

Sincerely,
${c.name}`;

    return NextResponse.json({ coverLetter: fallbackCoverLetter });
  }
}
