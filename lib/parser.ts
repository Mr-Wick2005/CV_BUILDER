import type {
  ResumeData,
  SkillCategory,
  ProjectEntry,
  PositionEntry,
  EducationEntry,
  CertificationEntry,
} from './types';
import { DEFAULT_STYLE_SETTINGS, DEFAULT_SECTION_ORDER } from './sample-profiles';

export interface PdfTextItem {
  str: string;
  x: number;
  y: number;
  fontSize: number;
  fontName: string;
}

export interface PdfAnnotation {
  type: string;
  url: string;
  rect: [number, number, number, number];
  pageNum?: number;
}

export interface LayoutLine {
  y: number;
  fontSize: number;
  items: PdfTextItem[];
  text: string;
  columns?: { x: number; text: string; items: PdfTextItem[] }[];
}

export interface LayoutExtractedDoc {
  rawText: string;
  lines: LayoutLine[];
  annotations: PdfAnnotation[];
  rawItems: PdfTextItem[];
  pageCount: number;
}

// Clean spacing and artifacts without corrupting names or words
export function cleanPdfArtifacts(text: string): string {
  if (!text) return '';
  return text
    // Normalize comma and colon spacing: "Mumbai ,Maharashtra ,India" -> "Mumbai, Maharashtra, India"
    .replace(/\s+([,:;])/g, '$1')
    .replace(/([,:;])(?=[^\s\d])/g, '$1 ')
    // Fix split single capital letters: "C oordinated" -> "Coordinated", "S haping" -> "Shaping"
    .replace(/\b([A-Z])\s+([a-z]{2,})\b/g, '$1$2')
    // Fix split suffixes: "Manag ed" -> "Managed", "build ing" -> "building"
    .replace(/\b([a-zA-Z]{3,})\s+(ed|ing|tion|ment|able|ly|ers|es|ive|form|al|ic)\b/gi, '$1$2')
    // Fix specific known words commonly corrupted by PDF layout
    .replace(/\bC\s+oordinated\b/gi, 'Coordinated')
    .replace(/\bCre\s*ative\b/gi, 'Creative')
    .replace(/\bS\s*haping\b/gi, 'Shaping')
    .replace(/\bManag\s*ed\b/gi, 'Managed')
    .replace(/[ \t]+/g, ' ')
    .trim();
}

// Deterministic layout-aware resume parser
export function parseResumeFromLayout(layout: LayoutExtractedDoc, hintedName?: string): ResumeData {
  const { lines, annotations, rawItems } = layout;

  // 1. Extract Full Name
  let name = hintedName ? cleanPdfArtifacts(hintedName).trim() : '';
  if (!name) {
    let maxNameSize = 0;
    for (const it of rawItems) {
      if (
        it.fontSize > maxNameSize &&
        !it.str.includes('@') &&
        !it.str.includes('+') &&
        !it.str.toLowerCase().includes('university') &&
        !it.str.toLowerCase().includes('college')
      ) {
        maxNameSize = it.fontSize;
        name = cleanPdfArtifacts(it.str);
      }
    }
  }
  if (!name) {
    name = 'YOUR NAME';
  }

  // 2. Extract Location
  let location = '';
  const topItems = rawItems.filter((it) => it.y > 700);
  for (const it of topItems) {
    if (it.str.includes('Mumbai') || it.str.includes('Maharashtra') || it.str.includes('India')) {
      location = cleanPdfArtifacts(it.str);
      break;
    }
  }
  if (!location) {
    for (const it of topItems) {
      const match = it.str.match(/([A-Za-z\s]+,\s*[A-Za-z\s]+,\s*[A-Za-z\s]+)/);
      if (match && !it.str.toLowerCase().includes('university') && it.fontSize < 15) {
        location = cleanPdfArtifacts(match[0]);
        break;
      }
    }
  }

  // 3. Extract Phone & Email (Regex verbatim matches from raw text items)
  let phone = '';
  let email = '';
  for (const it of rawItems) {
    const phoneMatch = it.str.match(/(\+?\d{1,3}[\s-]?\d{10})/);
    if (phoneMatch && !phone) {
      phone = phoneMatch[0].trim();
    }
    const emailMatch = it.str.match(/([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/);
    if (emailMatch && !email) {
      email = emailMatch[0].trim();
    }
  }

  // 4. Extract LinkedIn & GitHub URLs from annotations or text
  let linkedin = '';
  let github = '';
  for (const a of annotations) {
    if (a.url.includes('linkedin.com') && !linkedin) {
      linkedin = a.url;
    } else if (a.url.includes('github.com') && !github) {
      github = a.url;
    }
  }
  if (!linkedin) {
    for (const it of rawItems) {
      const match = it.str.match(/(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+/i);
      if (match) {
        linkedin = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
        break;
      }
    }
  }
  if (!github) {
    for (const it of rawItems) {
      const match = it.str.match(/(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+/i);
      if (match) {
        github = match[0].startsWith('http') ? match[0] : `https://${match[0]}`;
        break;
      }
    }
  }

  // 5. Section Partitioning
  const SECTION_HEADERS = [
    { key: 'summary', regex: /^(summary|professional summary|executive summary|objective|about me)$/i },
    { key: 'education', regex: /^(education|academic background|academics)$/i },
    { key: 'skills', regex: /^(technical skills|skills|core competencies|technical & core skills)$/i },
    { key: 'positions', regex: /^(positions of responsibility|leadership|experience|work experience|positions held)$/i },
    { key: 'projects', regex: /^(projects|key projects|academic projects|technical projects)$/i },
    { key: 'certifications', regex: /^(certifications|licenses & certifications|certificates|certifications & courses)$/i },
  ];

  const sections: { key: string; title: string; lines: LayoutLine[] }[] = [];
  let currentSection: { key: string; title: string; lines: LayoutLine[] } | null = null;

  for (const line of lines) {
    const trimmed = cleanPdfArtifacts(line.text);
    const matchedHeader = SECTION_HEADERS.find((h) => h.regex.test(trimmed));

    if (matchedHeader && (trimmed.length < 35 || line.fontSize >= 11)) {
      if (currentSection) sections.push(currentSection);
      currentSection = { key: matchedHeader.key, title: trimmed, lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);

  // 6. Section Content Parsing
  let summary = '';
  const education: EducationEntry[] = [];
  const skills: SkillCategory[] = [];
  const positions: PositionEntry[] = [];
  const projects: ProjectEntry[] = [];
  const certifications: CertificationEntry[] = [];

  for (const sec of sections) {
    if (sec.key === 'summary') {
      summary = cleanPdfArtifacts(sec.lines.map((l) => l.text).join(' '));
    } else if (sec.key === 'education') {
      let degree = '';
      let institution = '';
      let dates = '';

      for (const line of sec.lines) {
        if (line.text.includes('Duration:')) {
          const parts = line.text.split('Duration:');
          degree = cleanPdfArtifacts(parts[0]);
          dates = cleanPdfArtifacts('Duration: ' + parts[1]);
        } else if ((line.text.includes('–') || line.text.includes('-')) && !degree) {
          degree = cleanPdfArtifacts(line.text);
        } else if (line.text.toLowerCase().includes('university') || line.text.toLowerCase().includes('college')) {
          institution = cleanPdfArtifacts(line.text);
        } else if (!dates && /\d{4}/.test(line.text)) {
          dates = cleanPdfArtifacts(line.text);
        }
      }
      education.push({ degree, institution, dates });
    } else if (sec.key === 'skills') {
      for (const line of sec.lines) {
        if (line.columns && line.columns.length > 1) {
          for (let colIdx = 0; colIdx < line.columns.length; colIdx++) {
            const col = line.columns[colIdx];
            const colonIdx = col.text.indexOf(':');
            if (colonIdx > 0) {
              const category = cleanPdfArtifacts(col.text.slice(0, colonIdx));
              const itemsStr = col.text.slice(colonIdx + 1);
              const skillList = itemsStr.split(',').map((s) => cleanPdfArtifacts(s)).filter(Boolean);
              skills.push({ category, skills: skillList, column: colIdx === 0 ? 1 : 2 });
            }
          }
        } else {
          const colonIdx = line.text.indexOf(':');
          if (colonIdx > 0) {
            const category = cleanPdfArtifacts(line.text.slice(0, colonIdx));
            const itemsStr = line.text.slice(colonIdx + 1);
            const skillList = itemsStr.split(',').map((s) => cleanPdfArtifacts(s)).filter(Boolean);
            skills.push({ category, skills: skillList, column: 1 });
          }
        }
      }
    } else if (sec.key === 'positions') {
      let currentPos: PositionEntry | null = null;

      const isPositionTitle = (t: string) => {
        return (
          (t.includes('–') || t.includes('|') || t.includes('-')) &&
          (/\d{4}/.test(t) || /Head|Coordinator|Lead|President|Secretary|Member|Engineer|Developer|Intern/i.test(t)) &&
          !/^(Coordinated|Shaping|Managed|Developed|Built|Implemented|Directed|Designed|Organized|Created|Led|Assisted|Supported|Overseeing)/i.test(t)
        );
      };

      for (const line of sec.lines) {
        const text = cleanPdfArtifacts(line.text);
        if (isPositionTitle(text)) {
          if (currentPos) positions.push(currentPos);
          currentPos = {
            title: text,
            bullets: [],
          };
        } else if (currentPos) {
          const bulletText = cleanPdfArtifacts(line.text.replace(/^[•\-\*\s]+/, ''));
          if (bulletText) {
            const prevBullet = currentPos.bullets[currentPos.bullets.length - 1];
            const isContinuation =
              prevBullet &&
              (!prevBullet.endsWith('.') ||
                /^[a-z]/.test(bulletText) ||
                bulletText.length < 40 ||
                /^(including|overseeing|final|work\.|and|to|for|with)\b/i.test(bulletText));

            if (isContinuation) {
              currentPos.bullets[currentPos.bullets.length - 1] += ' ' + bulletText;
            } else {
              currentPos.bullets.push(bulletText);
            }
          }
        }
      }
      if (currentPos) positions.push(currentPos);
    } else if (sec.key === 'projects') {
      let currentProj: ProjectEntry | null = null;

      for (const line of sec.lines) {
        if (line.text.includes('|') && line.fontSize >= 11.0) {
          if (currentProj) projects.push(currentProj);
          const parts = line.text.split('|').map((p) => cleanPdfArtifacts(p));
          const projName = parts[0];
          const tech = (parts[1] || '').split(',').map((t) => cleanPdfArtifacts(t)).filter(Boolean);

          const linkAnnot = annotations.find((a) => {
            const normUrl = a.url.toLowerCase();
            const normName = projName.toLowerCase().replace(/\s+/g, '-');
            return normUrl.includes(normName) || Math.abs(a.rect[1] - line.y) < 25;
          });

          currentProj = {
            name: projName,
            tech,
            bullets: [],
            link: linkAnnot ? linkAnnot.url : undefined,
            visible: true,
          };
        } else if (currentProj) {
          const bulletText = cleanPdfArtifacts(line.text.replace(/^[•\-\*\s]+/, ''));
          if (bulletText) {
            const prevBullet = currentProj.bullets[currentProj.bullets.length - 1];
            const isContinuation =
              prevBullet &&
              (!prevBullet.endsWith('.') ||
                /^[a-z]/.test(bulletText) ||
                bulletText.length < 25 ||
                bulletText === 'work.');

            if (isContinuation) {
              currentProj.bullets[currentProj.bullets.length - 1] += ' ' + bulletText;
            } else {
              currentProj.bullets.push(bulletText);
            }
          }
        }
      }
      if (currentProj) projects.push(currentProj);
    } else if (sec.key === 'certifications') {
      for (const line of sec.lines) {
        const text = cleanPdfArtifacts(line.text.replace(/^[•\-\*\s]+/, ''));
        if (text) {
          const parts = text.split(/[—|]/).map((p) => cleanPdfArtifacts(p));
          certifications.push({
            title: parts[0] || text,
            issuer: parts[1] || '',
            year: parts[2] || '',
          });
        }
      }
    }
  }

  const sectionOrder = sections.length > 0 ? sections.map((s) => s.key) : DEFAULT_SECTION_ORDER;

  return {
    id: `resume-${Date.now()}`,
    title: `${name}'s Resume`,
    contact: {
      name,
      phone,
      email,
      location,
      linkedin,
      github,
    },
    summary,
    education,
    skills,
    positions,
    projects,
    certifications,
    style: DEFAULT_STYLE_SETTINGS,
    sectionOrder,
    updatedAt: new Date().toISOString(),
  };
}

// Fallback smart parser for plain text / copy-pasted content
export function parseResumeSmart(rawText: string, hintedName?: string): ResumeData {
  const cleanedText = cleanPdfArtifacts(rawText);
  const rawLines = cleanedText
    .split(/\r?\n/)
    .map((l) => cleanPdfArtifacts(l.trim()))
    .filter(Boolean);

  let name = hintedName ? cleanPdfArtifacts(hintedName).trim() : '';
  let email = '';
  let phone = '';
  let location = '';
  let github = '';
  let linkedin = '';

  const emailMatch = cleanedText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  if (emailMatch) email = emailMatch[0].trim();

  const phoneMatch = cleanedText.match(/(\+?\d{1,3}[\s-]?\d{10})/);
  if (phoneMatch) phone = phoneMatch[0].trim();

  const linkedinMatch = cleanedText.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    linkedin = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;
  }

  const githubMatch = cleanedText.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/([a-zA-Z0-9_-]+)/i);
  if (githubMatch) {
    github = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;
  }

  if (!name) {
    for (let i = 0; i < Math.min(rawLines.length, 5); i++) {
      const line = rawLines[i].replace(/[|•,]/g, '').trim();
      if (
        line.length >= 3 &&
        line.length <= 35 &&
        !line.includes('@') &&
        !line.includes('+') &&
        !line.toLowerCase().includes('university')
      ) {
        name = cleanPdfArtifacts(line);
        break;
      }
    }
  }
  if (!name) name = 'YOUR NAME';

  for (let i = 0; i < Math.min(rawLines.length, 6); i++) {
    const line = rawLines[i];
    if (line.includes('Mumbai') || line.includes('India') || line.includes('Maharashtra')) {
      location = cleanPdfArtifacts(line);
      break;
    }
  }

  const SECTION_PATTERNS = {
    summary: /^(summary|professional summary|objective|about me)$/i,
    education: /^(education|academics|academic background)$/i,
    skills: /^(technical skills|skills|core competencies)$/i,
    positions: /^(positions of responsibility|leadership|experience|work experience)$/i,
    projects: /^(projects|key projects|academic projects)$/i,
    certifications: /^(certifications|licenses & certifications|certificates)$/i,
  };

  const sections: { key: string; title: string; lines: string[] }[] = [];
  let currentSection: { key: string; title: string; lines: string[] } | null = null;

  for (const line of rawLines) {
    let matchedKey: string | null = null;
    for (const [k, regex] of Object.entries(SECTION_PATTERNS)) {
      if (regex.test(line)) {
        matchedKey = k;
        break;
      }
    }

    if (matchedKey) {
      if (currentSection) sections.push(currentSection);
      currentSection = { key: matchedKey, title: line, lines: [] };
    } else if (currentSection) {
      currentSection.lines.push(line);
    }
  }
  if (currentSection) sections.push(currentSection);

  let summary = '';
  const education: EducationEntry[] = [];
  const skills: SkillCategory[] = [];
  const positions: PositionEntry[] = [];
  const projects: ProjectEntry[] = [];
  const certifications: CertificationEntry[] = [];

  for (const sec of sections) {
    if (sec.key === 'summary') {
      summary = cleanPdfArtifacts(sec.lines.join(' '));
    } else if (sec.key === 'education') {
      let degree = '';
      let institution = '';
      let dates = '';
      for (const line of sec.lines) {
        if (line.includes('Duration:')) {
          const parts = line.split('Duration:');
          degree = cleanPdfArtifacts(parts[0]);
          dates = cleanPdfArtifacts('Duration: ' + parts[1]);
        } else if ((line.includes('–') || line.includes('-')) && !degree) {
          degree = cleanPdfArtifacts(line);
        } else if (line.toLowerCase().includes('university') || line.toLowerCase().includes('college')) {
          institution = cleanPdfArtifacts(line);
        } else if (!dates && /\d{4}/.test(line)) {
          dates = cleanPdfArtifacts(line);
        }
      }
      education.push({ degree, institution, dates });
    } else if (sec.key === 'skills') {
      for (const line of sec.lines) {
        const colonIdx = line.indexOf(':');
        if (colonIdx > 0) {
          const category = cleanPdfArtifacts(line.slice(0, colonIdx));
          const itemsStr = line.slice(colonIdx + 1);
          const skillList = itemsStr.split(',').map((s) => cleanPdfArtifacts(s)).filter(Boolean);
          skills.push({ category, skills: skillList });
        }
      }
    } else if (sec.key === 'positions') {
      let currentPos: PositionEntry | null = null;
      for (const line of sec.lines) {
        if (line.includes('–') || line.includes('|')) {
          if (currentPos) positions.push(currentPos);
          currentPos = { title: cleanPdfArtifacts(line), bullets: [] };
        } else if (currentPos) {
          const b = cleanPdfArtifacts(line.replace(/^[•\-\*\s]+/, ''));
          if (b) currentPos.bullets.push(b);
        }
      }
      if (currentPos) positions.push(currentPos);
    } else if (sec.key === 'projects') {
      let currentProj: ProjectEntry | null = null;
      for (const line of sec.lines) {
        if (line.includes('|')) {
          if (currentProj) projects.push(currentProj);
          const parts = line.split('|').map((p) => cleanPdfArtifacts(p));
          currentProj = {
            name: parts[0],
            tech: (parts[1] || '').split(',').map((t) => cleanPdfArtifacts(t)).filter(Boolean),
            bullets: [],
            visible: true,
          };
        } else if (currentProj) {
          const b = cleanPdfArtifacts(line.replace(/^[•\-\*\s]+/, ''));
          if (b) currentProj.bullets.push(b);
        }
      }
      if (currentProj) projects.push(currentProj);
    } else if (sec.key === 'certifications') {
      for (const line of sec.lines) {
        const text = cleanPdfArtifacts(line.replace(/^[•\-\*\s]+/, ''));
        if (text) {
          const parts = text.split(/[—|]/).map((p) => cleanPdfArtifacts(p));
          certifications.push({
            title: parts[0] || text,
            issuer: parts[1] || '',
            year: parts[2] || '',
          });
        }
      }
    }
  }

  return {
    id: `resume-${Date.now()}`,
    title: `${name}'s Resume`,
    contact: {
      name,
      phone,
      email,
      location,
      linkedin,
      github,
    },
    summary,
    education,
    skills,
    positions,
    projects,
    certifications,
    style: DEFAULT_STYLE_SETTINGS,
    sectionOrder: sections.length > 0 ? sections.map((s) => s.key) : DEFAULT_SECTION_ORDER,
    updatedAt: new Date().toISOString(),
  };
}
