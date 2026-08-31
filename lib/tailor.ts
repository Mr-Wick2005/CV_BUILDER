import type {
  ResumeData,
  SkillCategory,
  ProjectEntry,
  PositionEntry,
} from './types';

const ROLE_KEYWORDS: Record<string, string[]> = {
  'full stack developer': [
    'react', 'node', 'express', 'javascript', 'typescript', 'sql', 'api', 'rest',
    'frontend', 'backend', 'database', 'authentication', 'full-stack', 'fullstack',
  'web', 'git', 'css', 'tailwind', 'postgres', 'mysql',
  'scalable', 'architecture', 'clean code', 'tested', 'maintainable',
  'ci', 'cd', 'workflow',
  'feature', 'endpoint', 'routing', 'schema', 'component',
  'performance', 'optimisation', 'optimization',
  'role-based', 'access', 'dashboard',
  'modular', 'typed', 'engineered', 'integrated', 'built', 'designed', 'implemented',
  'secure', 'normalised', 'normalized',
  'tracking', 'scoring', 'delivery', 'progress',
    'interactive', 'challenges', 'gamified',
    'portfolio', 'gallery', 'transitions', 'media',
    'events', 'participant', 'moderation',
    'production', 'showcasing',
    'coding', 'aptitude', 'weak areas', 'practice',
    'secure', 'access control',
    'load', 'responsive',
  ],
  'project / product manager': [
    'project', 'product', 'stakeholder', 'agile', 'scrum', 'sprint', 'roadmap',
    'timeline', 'milestone', 'delivery', 'cross-functional', 'cross-functional',
    'coordination', 'planning', 'resource', 'allocation', 'risk', 'mitigation',
    'communication', 'process', 'improvement', 'priority', 'scope',
    'team', 'leadership', 'facilitated', 'organised', 'organized', 'coordinated',
    'mentoring', 'workshops', 'ideation', 'participation', 'preparedness',
    'branding', 'identity', 'visual', 'creative',
    'international', 'conference', 'logistics', 'scheduling',
    'submission', 'quality', 'sessions',
    'tracking', 'progress', 'workflows',
    'events', 'participant',
    'admin', 'dashboard',
    'production', 'delivery',
    'scoring', 'recommendations',
  ],
  'ui/ux designer': [
    'design', 'ui', 'ux', 'figma', 'wireframe', 'prototype', 'mockup',
    'user', 'research', 'interface', 'responsive', 'accessibility', 'usability',
    'component', 'system', 'visual', 'branding', 'identity', 'creative',
    'portfolio', 'gallery', 'layout', 'transition', 'media', 'immersive',
    'aesthetic', 'consistency', 'fidelity', 'collaborate', 'developer',
    'mobile', 'web', 'design-driven', 'component-driven',
    'tailwind', 'css', 'vite', 'react',
    'visual work', 'showcasing', 'film', 'production',
    'creative head', 'branding', 'identity',
    'workshops', 'mentoring',
    'events', 'platform',
    'user-centered', 'user-centered',
    'high-fidelity', 'wireframes',
    'optimised', 'optimized', 'load', 'performance',
    'interactive', 'gamified', 'challenges',
    'scoring', 'weak areas',
    'admin', 'dashboard',
  ],
  'software tester / qa': [
    'test', 'testing', 'qa', 'quality', 'automation', 'automated', 'manual',
    'defect', 'bug', 'validation', 'verification', 'regression', 'integration',
    'api', 'rest', 'endpoint', 'database', 'sql', 'javascript', 'typescript',
    'ci', 'cd', 'pipeline', 'tracking', 'reproduce', 'diagnose',
    'analytical', 'detail', 'oriented', 'meticulous',
    'authentication', 'access', 'role-based',
    'scoring', 'weak areas', 'targeted',
    'admin', 'dashboard', 'moderation',
    'participant', 'tracking',
    'progress', 'tracking',
    'workflows', 'submission',
    'quality', 'preparedness',
    'sessions', 'workshops',
    'normalised', 'normalized', 'schema',
    'modular', 'routing',
    'typed', 'engineered',
    'challenges', 'interactive',
    'media', 'optimised', 'optimized',
    'responsive', 'load',
  ],
};

const ROLE_SUMMARIES: Record<string, string> = {
  'full stack developer':
    'Final-year Computer Engineering student with hands-on full-stack development experience across React.js, Node.js, and SQL. Built and shipped full-stack applications with secure authentication, REST APIs, and normalised database schemas. Passionate about clean, tested, maintainable code and scalable architecture.',
  'project / product manager':
    'Final-year Computer Engineering student with proven leadership in coordinating cross-functional teams, international conferences, and technical clubs. Skilled in planning, stakeholder communication, and process improvement. Adept at bridging engineering and business priorities to deliver on time.',
  'ui/ux designer':
    'Final-year Computer Engineering student with a strong design sensibility and hands-on experience building responsive, component-driven interfaces. Skilled in Figma, Tailwind CSS, and user-centered design. Passionate about crafting intuitive, accessible, and visually polished digital experiences.',
  'software tester / qa':
    'Final-year Computer Engineering student with a detail-oriented mindset and hands-on experience building tested full-stack applications. Skilled in API validation, database querying, and writing clean, maintainable code. Passionate about quality assurance, defect diagnosis, and automation-friendly practices.',
};

function normaliseRole(role: string): string {
  return role.toLowerCase().trim();
}

function extractKeywords(jd: string): Set<string> {
  const words = jd
    .toLowerCase()
    .replace(/[^a-z0-9\s+#./-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  return new Set(words);
}

function scoreCategories(
  skills: SkillCategory[],
  roleKey: string,
  jdKeywords: Set<string>
): SkillCategory[] {
  const roleKw = ROLE_KEYWORDS[roleKey] || [];
  const roleSet = new Set(roleKw);

  return skills
    .map((cat) => {
      const categoryLower = cat.category.toLowerCase();
      const skillsLower = cat.skills.map((s) => s.toLowerCase());

      let score = 0;

      for (const s of skillsLower) {
        if (roleSet.has(s)) score += 3;
        if (jdKeywords.has(s)) score += 2;
      }

      if (roleSet.has(categoryLower)) score += 2;
      if (jdKeywords.has(categoryLower)) score += 1;

      for (const kw of roleKw) {
        if (categoryLower.includes(kw) || skillsLower.some((s) => s.includes(kw))) {
          score += 1;
        }
      }

      return { ...cat, _score: score };
    })
    .sort((a, b) => b._score - a._score)
    .map(({ _score, ...cat }) => cat);
}

const PROJECT_REWRITES: Record<string, Record<string, string[]>> = {
  'full stack developer': {
    'College Buzz': [
      'Built a full-stack college events platform with secure JWT authentication and role-based access control.',
      'Designed and documented REST APIs for event creation, registration, and admin workflows backed by a normalised SQL schema.',
      'Implemented an admin dashboard for event moderation with real-time participant tracking and CRUD operations.',
    ],
    'Escape Placement Cell': [
      'Developed a gamified placement-prep platform with interactive coding and aptitude challenges using React and TypeScript.',
      'Engineered a typed Express backend with modular routing for challenge delivery and per-user progress tracking.',
      'Integrated a scoring engine that surfaced weak areas and recommended targeted practice sets.',
    ],
    'Wings Studios': [
      'Built a responsive portfolio platform for a film production house with component-driven React and Vite.',
      'Implemented a Tailwind-based UI with an immersive gallery layout and optimised media delivery.',
      'Achieved fast load performance through Vite bundling and lazy-loaded media assets.',
    ],
  },
  'project / product manager': {
    'College Buzz': [
      'Led end-to-end delivery of a college events platform, coordinating requirements across development and admin stakeholders.',
      'Defined scope and workflows for event creation, registration, and moderation, tracking milestones to launch.',
      'Managed an admin dashboard rollout that streamlined event moderation and participant tracking for organisers.',
    ],
    'Escape Placement Cell': [
      'Drove product vision for a gamified placement-prep platform, balancing feature scope with delivery timelines.',
      'Coordinated cross-functional development of challenge delivery and progress-tracking workflows.',
      'Introduced a scoring-driven feedback loop that improved user engagement and targeted practice adoption.',
    ],
    'Wings Studios': [
      'Managed delivery of a portfolio platform for a film production house, aligning design and engineering priorities.',
      'Oversaw a responsive UI rollout with Tailwind CSS and Vite, ensuring on-time launch and quality standards.',
      'Coordinated an immersive gallery experience that met client expectations across visual categories.',
    ],
  },
  'ui/ux designer': {
    'College Buzz': [
      'Designed the user experience for a college events platform, crafting intuitive registration and admin workflows.',
      'Created a responsive, accessible UI with React and Tailwind CSS, ensuring consistency across user roles.',
      'Prototyped an admin dashboard layout that simplified event moderation and participant tracking.',
    ],
    'Escape Placement Cell': [
      'Designed a gamified placement-prep experience with interactive, user-centered challenge flows.',
      'Crafted a clean, component-driven UI in Figma and React, prioritising clarity and engagement.',
      'Iterated on a scoring feedback interface that surfaced weak areas with clear, actionable visuals.',
    ],
    'Wings Studios': [
      'Designed an immersive portfolio platform for a film production house, showcasing visual work across categories.',
      'Built a responsive, component-driven UI with Tailwind CSS and Vite for fast, polished load performance.',
      'Created an immersive gallery layout with smooth transitions and optimised media delivery.',
    ],
  },
  'software tester / qa': {
    'College Buzz': [
      'Tested a full-stack college events platform, validating secure authentication and role-based access control.',
      'Validated REST APIs for event creation, registration, and admin workflows against a normalised SQL schema.',
      'Verified admin dashboard functionality for event moderation and real-time participant tracking.',
    ],
    'Escape Placement Cell': [
      'Tested a gamified placement-prep platform, validating interactive coding and aptitude challenge flows.',
      'Verified a typed Express backend with modular routing for challenge delivery and progress tracking.',
      'Validated the scoring engine logic, ensuring weak-area detection and targeted recommendations were accurate.',
    ],
    'Wings Studios': [
      'Tested a responsive portfolio platform across viewports, validating layout and media delivery.',
      'Verified UI components built with Tailwind CSS and Vite for cross-browser consistency.',
      'Checked gallery transitions and optimised media loading for performance regressions.',
    ],
  },
};

const POSITION_REWRITES: Record<string, Record<string, string[]>> = {
  'full stack developer': {
    'Conference Coordinator & Creative Head — ICSICE 2026': [
      'Coordinated an international conference, managing cross-team planning across scheduling, logistics, and participant workflows.',
      'Directed visual branding and identity design, ensuring consistent digital and print collateral.',
    ],
    'Hackathon Club Head — Computer Engineering Department (2024-2025)': [
      'Facilitated student participation in inter-collegiate hackathons, supporting ideation and submission workflows.',
      'Organised mentoring sessions that improved team preparedness and project quality.',
    ],
    'Technical Head — CESA & CSI (2024)': [
      'Managed student workshops and technical lectures, mentoring juniors on core CS and web development concepts.',
      'Coordinated hands-on coding sessions that strengthened the departmental technical culture.',
    ],
  },
  'project / product manager': {
    'Conference Coordinator & Creative Head — ICSICE 2026': [
      'Coordinated an international conference, leading cross-team planning across logistics, scheduling, and participant management.',
      'Directed visual branding and identity, ensuring consistent stakeholder communication across all event collateral.',
    ],
    'Hackathon Club Head — Computer Engineering Department (2024-2025)': [
      'Facilitated student participation in inter-collegiate hackathons, supporting ideation and submission workflows.',
      'Organised mentoring sessions that improved team preparedness and overall project quality.',
    ],
    'Technical Head — CESA & CSI (2024)': [
      'Managed student workshops and technical lectures, mentoring juniors on core CS concepts.',
      'Coordinated hands-on coding sessions that strengthened the departmental technical culture.',
    ],
  },
  'ui/ux designer': {
    'Conference Coordinator & Creative Head — ICSICE 2026': [
      'Led creative direction for an international conference, designing visual branding and identity across all collateral.',
      'Coordinated cross-team planning to ensure consistent design language across digital and print touchpoints.',
    ],
    'Hackathon Club Head — Computer Engineering Department (2024-2025)': [
      'Facilitated student participation in inter-collegiate hackathons, supporting ideation and submission workflows.',
      'Organised mentoring sessions that improved team preparedness and project quality.',
    ],
    'Technical Head — CESA & CSI (2024)': [
      'Managed student workshops and technical lectures, mentoring juniors on core CS concepts.',
      'Coordinated hands-on coding sessions that strengthened the departmental technical culture.',
    ],
  },
  'software tester / qa': {
    'Conference Coordinator & Creative Head — ICSICE 2026': [
      'Coordinated an international conference, managing cross-team planning across scheduling, logistics, and participant workflows.',
      'Directed visual branding and identity, ensuring consistent quality across all event collateral.',
    ],
    'Hackathon Club Head — Computer Engineering Department (2024-2025)': [
      'Facilitated student participation in inter-collegiate hackathons, supporting ideation and submission workflows.',
      'Organised mentoring sessions that improved team preparedness and submission quality.',
    ],
    'Technical Head — CESA & CSI (2024)': [
      'Managed student workshops and technical lectures, mentoring juniors on core CS concepts.',
      'Coordinated hands-on coding sessions that strengthened the departmental technical culture.',
    ],
  },
};

export function tailorResume(
  resume: ResumeData,
  role: string,
  jobDescription: string
): ResumeData {
  const roleKey = normaliseRole(role);
  const jdKeywords = extractKeywords(jobDescription);

  const summary =
    ROLE_SUMMARIES[roleKey] ||
    `Final-year Computer Engineering student with hands-on experience in ${role}. Skilled in React.js, Node.js, and SQL with a strong foundation in problem-solving and clean architecture. Passionate about delivering high-quality, user-focused work.`;

  const skills = scoreCategories(resume.skills, roleKey, jdKeywords);

  const projects: ProjectEntry[] = resume.projects.map((p) => {
    const rewrites = PROJECT_REWRITES[roleKey]?.[p.name];
    return {
      ...p,
      bullets: rewrites ?? p.bullets,
    };
  });

  const positions: PositionEntry[] = resume.positions.map((pos) => {
    const rewrites = POSITION_REWRITES[roleKey]?.[pos.title];
    return {
      ...pos,
      bullets: rewrites ?? pos.bullets,
    };
  });

  return {
    ...resume,
    summary,
    skills,
    projects,
    positions,
  };
}

export function resumeToPlainText(resume: ResumeData): string {
  const lines: string[] = [];
  const c = resume.contact;
  lines.push(c.name.toUpperCase());
  lines.push(`${c.phone} | ${c.email} | ${c.location}`);
  lines.push(`${c.github} | ${c.linkedin}`);
  lines.push('');

  lines.push('SUMMARY');
  lines.push(resume.summary);
  lines.push('');

  lines.push('EDUCATION');
  for (const e of resume.education) {
    lines.push(`${e.degree} — ${e.institution} (${e.dates})`);
  }
  lines.push('');

  lines.push('TECHNICAL SKILLS');
  for (const s of resume.skills) {
    lines.push(`${s.category}: ${s.skills.join(', ')}`);
  }
  lines.push('');

  lines.push('PROJECTS');
  for (const p of resume.projects) {
    if (!p.visible) continue;
    lines.push(`${p.name} (${p.tech.join(', ')})`);
    for (const b of p.bullets) lines.push(`  - ${b}`);
  }
  lines.push('');

  lines.push('POSITIONS OF RESPONSIBILITY');
  for (const pos of resume.positions) {
    lines.push(pos.title);
    for (const b of pos.bullets) lines.push(`  - ${b}`);
  }
  lines.push('');

  lines.push('CERTIFICATIONS');
  for (const cert of resume.certifications) {
    lines.push(`${cert.title} — ${cert.issuer} (${cert.year})`);
  }

  return lines.join('\n');
}
