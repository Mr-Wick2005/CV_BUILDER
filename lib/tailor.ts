import type {
  ResumeData,
  SkillCategory,
  ProjectEntry,
  PositionEntry,
} from './types';
import { extractKeywordsFromText } from './ats-scorer';

// Universal Action Verb Boosters for local tailoring
const ACTION_VERB_MAP: Record<string, string[]> = {
  'build': ['Architected', 'Engineered', 'Developed', 'Constructed'],
  'built': ['Architected', 'Engineered', 'Developed', 'Constructed'],
  'make': ['Designed and implemented', 'Formulated', 'Engineered'],
  'made': ['Designed and implemented', 'Formulated', 'Engineered'],
  'work': ['Spearheaded initiatives across', 'Collaborated cross-functionally on', 'Delivered'],
  'worked': ['Spearheaded initiatives across', 'Collaborated cross-functionally on', 'Delivered'],
  'help': ['Accelerated team velocity by', 'Facilitated', 'Enabled'],
  'helped': ['Accelerated team velocity by', 'Facilitated', 'Enabled'],
  'manage': ['Orchestrated', 'Directed', 'Supervised'],
  'managed': ['Orchestrated', 'Directed', 'Supervised'],
  'create': ['Pioneered', 'Spearheaded', 'Crafted', 'Authored'],
  'created': ['Pioneered', 'Spearheaded', 'Crafted', 'Authored'],
  'use': ['Leveraged', 'Integrated', 'Employed'],
  'used': ['Leveraged', 'Integrated', 'Employed'],
  'do': ['Executed', 'Accomplished', 'Delivered'],
  'did': ['Executed', 'Accomplished', 'Delivered'],
  'test': ['Validated and tested', 'Automated test suites for'],
  'tested': ['Validated and verified', 'Automated regression testing for'],
};

// Dynamic Bullet Enhancer (Universal rule-based NLP)
export function enhanceBulletLocally(bullet: string, targetRole: string, keywords: string[]): string {
  let enhanced = bullet.trim();
  if (!enhanced) return enhanced;

  // Enhance weak starting verbs
  const firstWord = enhanced.split(/\s+/)[0]?.toLowerCase().replace(/[^a-z]/g, '');
  if (firstWord && ACTION_VERB_MAP[firstWord]) {
    const replacements = ACTION_VERB_MAP[firstWord];
    const chosen = replacements[Math.floor(Math.random() * replacements.length)];
    enhanced = enhanced.replace(new RegExp(`^${firstWord}\\b`, 'i'), chosen);
  }

  // Ensure sentence ends with a period
  if (!enhanced.endsWith('.')) {
    enhanced += '.';
  }

  return enhanced;
}

// Dynamic Skill Re-ranking based on JD keywords and Target Role
export function scoreAndSortSkills(
  skills: SkillCategory[],
  role: string,
  jdKeywords: string[]
): SkillCategory[] {
  const roleTerms = role.toLowerCase().split(/\s+/).filter((w) => w.length >= 3);
  const jdSet = new Set(jdKeywords.map((k) => k.toLowerCase()));

  return skills
    .map((cat) => {
      const catLower = cat.category.toLowerCase();
      let score = 0;

      // Score matching categories
      if (roleTerms.some((t) => catLower.includes(t))) score += 5;
      if (jdSet.has(catLower)) score += 3;

      // Score skills inside category
      for (const s of cat.skills) {
        const sLower = s.toLowerCase();
        if (roleTerms.some((t) => sLower.includes(t))) score += 4;
        if (jdSet.has(sLower)) score += 3;
      }

      return { ...cat, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...cat }) => cat);
}

// Universal dynamic local resume tailor (works for ANY resume and ANY role)
export function tailorResume(
  resume: ResumeData,
  role: string,
  jobDescription: string
): ResumeData {
  const jdKeywords = extractKeywordsFromText(jobDescription);
  const roleTitle = role.trim() || 'Software Engineer';

  // 1. Dynamic Summary Generation
  let tailoredSummary = resume.summary;
  if (!tailoredSummary || tailoredSummary.length < 30) {
    tailoredSummary = `Proactive and results-driven student with solid foundational knowledge in ${roleTitle}. Experienced in designing reliable solutions, collaborating across cross-functional teams, and implementing scalable features.`;
  } else {
    // If the summary doesn't mention the target role, inject a tailored lead
    const lower = tailoredSummary.toLowerCase();
    if (!lower.includes(roleTitle.toLowerCase())) {
      // Re-anchor the opening sentence
      const sentences = tailoredSummary.split(/(?<=[.?!])\s+/);
      if (sentences.length > 0) {
        sentences[0] = sentences[0].replace(
          /^(Computer Engineering student|Student|Software developer|Passionate engineer|Motivated student)/i,
          `Aspiring ${roleTitle}`
        );
        tailoredSummary = sentences.join(' ');
      }
    }
  }

  // 2. Dynamic Skill Categorization & Prioritization
  const tailoredSkills = scoreAndSortSkills(resume.skills, roleTitle, jdKeywords);

  // 3. Dynamic Universal Bullet Optimization for Projects
  const tailoredProjects: ProjectEntry[] = resume.projects.map((p) => ({
    ...p,
    bullets: p.bullets.map((b) => enhanceBulletLocally(b, roleTitle, jdKeywords)),
  }));

  // 4. Dynamic Universal Bullet Optimization for Positions
  const tailoredPositions: PositionEntry[] = resume.positions.map((pos) => ({
    ...pos,
    bullets: pos.bullets.map((b) => enhanceBulletLocally(b, roleTitle, jdKeywords)),
  }));

  return {
    ...resume,
    summary: tailoredSummary,
    skills: tailoredSkills,
    projects: tailoredProjects,
    positions: tailoredPositions,
  };
}

export function resumeToPlainText(resume: ResumeData): string {
  const lines: string[] = [];
  const c = resume.contact;
  lines.push(c.name.toUpperCase());
  if (c.location) lines.push(c.location);
  
  const contactParts: string[] = [];
  if (c.phone) contactParts.push(c.phone);
  if (c.email) contactParts.push(c.email);
  if (c.linkedin) contactParts.push(c.linkedin);
  if (c.github) contactParts.push(c.github);
  if (c.portfolio) contactParts.push(c.portfolio);
  lines.push(contactParts.join(' | '));
  lines.push('');

  if (resume.summary) {
    lines.push('PROFESSIONAL SUMMARY');
    lines.push('--------------------');
    lines.push(resume.summary);
    lines.push('');
  }

  if (resume.education && resume.education.length > 0) {
    lines.push('EDUCATION');
    lines.push('---------');
    for (const e of resume.education) {
      lines.push(`${e.degree} — ${e.dates}`);
      lines.push(`${e.institution}${e.location ? ` | ${e.location}` : ''}`);
      if (e.gpa) lines.push(`GPA: ${e.gpa}`);
      if (e.coursework) lines.push(`Relevant Coursework: ${e.coursework}`);
      lines.push('');
    }
  }

  if (resume.skills && resume.skills.length > 0) {
    lines.push('TECHNICAL & CORE SKILLS');
    lines.push('-----------------------');
    for (const s of resume.skills) {
      lines.push(`• ${s.category}: ${s.skills.join(', ')}`);
    }
    lines.push('');
  }

  if (resume.positions && resume.positions.length > 0) {
    lines.push('EXPERIENCE & LEADERSHIP');
    lines.push('-----------------------');
    for (const pos of resume.positions) {
      lines.push(`${pos.title}${pos.organization ? ` — ${pos.organization}` : ''}${pos.dates ? ` (${pos.dates})` : ''}`);
      for (const b of pos.bullets) lines.push(`  • ${b}`);
      lines.push('');
    }
  }

  if (resume.projects && resume.projects.length > 0) {
    lines.push('PROJECTS');
    lines.push('--------');
    for (const p of resume.projects) {
      if (!p.visible) continue;
      lines.push(`${p.name} | ${p.tech.join(', ')}`);
      for (const b of p.bullets) lines.push(`  • ${b}`);
      lines.push('');
    }
  }

  if (resume.certifications && resume.certifications.length > 0) {
    lines.push('CERTIFICATIONS & HONORS');
    lines.push('-----------------------');
    for (const cert of resume.certifications) {
      lines.push(`• ${cert.title} — ${cert.issuer} (${cert.year})`);
    }
    lines.push('');
  }

  if (resume.customSections) {
    for (const sec of resume.customSections) {
      lines.push(sec.sectionTitle.toUpperCase());
      lines.push('-'.repeat(sec.sectionTitle.length));
      for (const item of sec.items) {
        lines.push(`${item.title}${item.subtitle ? ` — ${item.subtitle}` : ''}${item.date ? ` (${item.date})` : ''}`);
        for (const b of item.bullets) lines.push(`  • ${b}`);
      }
      lines.push('');
    }
  }

  return lines.join('\n');
}

export function resumeToMarkdown(resume: ResumeData): string {
  const lines: string[] = [];
  const c = resume.contact;

  lines.push(`# ${c.name}`);
  const contactLinks: string[] = [];
  if (c.email) contactLinks.push(`[${c.email}](mailto:${c.email})`);
  if (c.phone) contactLinks.push(c.phone);
  if (c.location) contactLinks.push(c.location);
  if (c.linkedin) contactLinks.push(`[LinkedIn](${c.linkedin})`);
  if (c.github) contactLinks.push(`[GitHub](${c.github})`);
  if (c.portfolio) contactLinks.push(`[Portfolio](${c.portfolio})`);
  lines.push(contactLinks.join(' • '));
  lines.push('');

  if (resume.summary) {
    lines.push('## Summary');
    lines.push(resume.summary);
    lines.push('');
  }

  if (resume.education.length > 0) {
    lines.push('## Education');
    for (const e of resume.education) {
      lines.push(`### ${e.degree} — ${e.institution}`);
      lines.push(`*${e.dates}${e.location ? ` | ${e.location}` : ''}*`);
      if (e.gpa) lines.push(`**GPA:** ${e.gpa}`);
      if (e.coursework) lines.push(`**Coursework:** ${e.coursework}`);
      lines.push('');
    }
  }

  if (resume.skills.length > 0) {
    lines.push('## Skills');
    for (const s of resume.skills) {
      lines.push(`- **${s.category}:** ${s.skills.join(', ')}`);
    }
    lines.push('');
  }

  if (resume.positions.length > 0) {
    lines.push('## Experience & Leadership');
    for (const pos of resume.positions) {
      lines.push(`### ${pos.title}${pos.organization ? ` — ${pos.organization}` : ''}`);
      if (pos.dates) lines.push(`*${pos.dates}*`);
      for (const b of pos.bullets) lines.push(`- ${b}`);
      lines.push('');
    }
  }

  if (resume.projects.length > 0) {
    lines.push('## Projects');
    for (const p of resume.projects) {
      if (!p.visible) continue;
      lines.push(`### ${p.name} \`(${p.tech.join(', ')})\``);
      for (const b of p.bullets) lines.push(`- ${b}`);
      lines.push('');
    }
  }

  if (resume.certifications.length > 0) {
    lines.push('## Certifications');
    for (const cert of resume.certifications) {
      lines.push(`- **${cert.title}** — ${cert.issuer} (${cert.year})`);
    }
    lines.push('');
  }

  return lines.join('\n');
}
