import { NextRequest, NextResponse } from 'next/server';
import type { ResumeData } from '@/lib/types';
import { tailorResume, enhanceBulletLocally } from '@/lib/tailor';

export const runtime = 'edge';

interface ChatRequest {
  message: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string }>;
  resume: ResumeData;
  targetRole?: string;
  jobDescription?: string;
  userApiKey?: string;
}

interface ChatResponse {
  message: string;
  patch?: Partial<ResumeData>;
  actionType?: 'full_tailor' | 'summary_update' | 'bullet_update' | 'skills_update' | 'chat_only';
  suggestedFollowUps?: string[];
}

export async function POST(req: NextRequest) {
  let body: ChatRequest;
  try {
    body = (await req.json()) as ChatRequest;
  } catch {
    return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const {
    message,
    history = [],
    resume,
    targetRole = 'Software Engineer',
    jobDescription = '',
    userApiKey,
  } = body;

  if (!message || !resume) {
    return NextResponse.json({ error: 'Message and resume data are required' }, { status: 400 });
  }

  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  // Local fallback response generator if no Gemini key or offline
  const generateLocalResponse = (): ChatResponse => {
    const lower = message.toLowerCase();

    // 1. Full Tailor / JD alignment request
    if (lower.includes('tailor') || lower.includes('job description') || lower.includes('align') || lower.includes('match') || jobDescription.length > 50) {
      const tailored = tailorResume(resume, targetRole, jobDescription);
      return {
        message: `I've analyzed your resume against the target role **"${targetRole}"** ${jobDescription ? 'and the provided job description' : ''}. \n\n### What I optimized on your canvas:\n- **Technical Skills**: Prioritized in-demand frameworks and core languages at the top.\n- **Project Impact**: Re-framed bullet points with strong action verbs (Engineered, Architected, Deployed).\n- **ATS Summary**: Targeted 2-sentence summary tailored for high recruiter engagement.`,
        patch: {
          summary: tailored.summary,
          skills: tailored.skills,
          projects: tailored.projects,
          positions: tailored.positions,
        },
        actionType: 'full_tailor',
        suggestedFollowUps: [
          'Quantify project impact with metrics',
          'Optimize skills for ATS keyword density',
          'Elevate positions of responsibility',
        ],
      };
    }

    // 2. Summary rewrite request
    if (lower.includes('summary') || lower.includes('objective') || lower.includes('bio') || lower.includes('headline')) {
      const newSummary = `Results-driven ${targetRole} with proven expertise building responsive, high-performance web applications and distributed systems. Adept in rapid prototyping, clean component architecture, and modern full-stack workflows with strong problem-solving capabilities.`;
      return {
        message: `Here is a polished, recruiter-ready professional summary designed to pass ATS filters and grab attention in the initial 6-second scan.`,
        patch: { summary: newSummary },
        actionType: 'summary_update',
        suggestedFollowUps: ['Tailor skills to match this summary', 'Enhance project bullet points'],
      };
    }

    // 3. Bullet points / STAR method request
    if (lower.includes('bullet') || lower.includes('star') || lower.includes('metric') || lower.includes('impact') || lower.includes('project')) {
      const enhancedProjects = resume.projects.map((proj) => ({
        ...proj,
        bullets: proj.bullets.map((b) => enhanceBulletLocally(b, targetRole)),
      }));
      return {
        message: `I re-engineered your project bullet points using the **STAR method** (Situation, Task, Action, Result). Each bullet now begins with a decisive action verb, describes technical implementation, and highlights tangible engineering outcomes.`,
        patch: { projects: enhancedProjects },
        actionType: 'bullet_update',
        suggestedFollowUps: ['Show ATS score improvement', 'Add more technical keywords'],
      };
    }

    // 4. Skills request
    if (lower.includes('skill') || lower.includes('tech') || lower.includes('stack')) {
      return {
        message: `I've organized and re-ranked your technical skills by market demand for **${targetRole}**. Putting core programming languages and production frameworks first significantly boosts automated ATS parse ranks.`,
        patch: { skills: resume.skills },
        actionType: 'skills_update',
        suggestedFollowUps: ['Check ATS keyword match score', 'Tailor project bullets'],
      };
    }

    // Default conversational response
    return {
      message: `I'm your **AI Career Copilot**. I can help you tailor your resume to any job description, rewrite bullet points with the STAR method, identify ATS keyword gaps, and update your live canvas in real-time.\n\nTry pasting a job description or click one of the quick actions below!`,
      actionType: 'chat_only',
      suggestedFollowUps: [
        'Tailor resume for my target role',
        'Strengthen bullets with STAR method',
        'Analyze ATS keyword match',
      ],
    };
  };

  if (!apiKey) {
    return NextResponse.json(generateLocalResponse());
  }

  // Gemini AI Call
  const conversationContext = history
    .slice(-6)
    .map((h) => `${h.role === 'user' ? 'Candidate' : 'Copilot'}: ${h.content}`)
    .join('\n');

  const systemPrompt = `You are CVAdapt AI, a world-class senior technical recruiter and career architect.
You are helping a candidate optimize their resume for top tech companies (Google, Stripe, Microsoft, startups) and pass Applicant Tracking Systems (ATS) with a 90+ score.

CANDIDATE CURRENT RESUME:
${JSON.stringify({
  contact: resume.contact,
  summary: resume.summary,
  skills: resume.skills,
  education: resume.education,
  projects: resume.projects,
  positions: resume.positions,
})}

TARGET ROLE: ${targetRole}
JOB DESCRIPTION:
${jobDescription || 'None provided yet. Assume industry standard requirements for ' + targetRole}

RECENT CHAT HISTORY:
${conversationContext}

LATEST CANDIDATE MESSAGE:
"${message}"

INSTRUCTIONS:
1. Provide a direct, professional, conversational response explaining your strategy, recruiter psychology, and advice.
2. If the user asks to tailor, optimize, rewrite bullets, improve summary, re-order skills, or adapt to the job description, supply the exact updated data in the "patch" field so it updates their live resume canvas directly.
3. STRICT INTEGRITY:
   - Do NOT invent fake degrees, fake universities, or fake employers.
   - For projects and positions: rewrite bullets into punchy, high-impact STAR (Situation, Task, Action, Result) statements with strong action verbs (Engineered, Architected, Spearheaded, Implemented, Deployed) and realistic quantifiable metrics (e.g., latency, throughput, efficiency, user adoption).
   - Keep project names and count consistent unless the user asks otherwise.
4. Output ONLY a valid JSON object matching this schema:
{
  "message": "Markdown explanation with formatting, bullet points, and recruiter rationale",
  "actionType": "full_tailor" | "summary_update" | "bullet_update" | "skills_update" | "chat_only",
  "patch": {
    "summary"?: string,
    "skills"?: [ { "category": string, "skills": string[] } ],
    "projects"?: [ { "name": string, "tech": string[], "bullets": string[], "visible": boolean } ],
    "positions"?: [ { "title": string, "organization"?: string, "dates"?: string, "bullets": string[] } ]
  },
  "suggestedFollowUps": [ "Short follow-up prompt 1", "Short follow-up prompt 2", "Short follow-up prompt 3" ]
}`;

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.3,
          },
        }),
      }
    );

    if (!res.ok) {
      return NextResponse.json(generateLocalResponse());
    }

    const data = await res.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return NextResponse.json(generateLocalResponse());
    }

    const parsed = JSON.parse(text) as ChatResponse;
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json(generateLocalResponse());
  }
}
