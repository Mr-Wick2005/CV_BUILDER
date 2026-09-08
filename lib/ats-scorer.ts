import type { ResumeData, ATSAnalysis } from './types';

// High-impact action verbs across tech, management, engineering, and data
const POWER_ACTION_VERBS = new Set([
  'architected', 'spearheaded', 'engineered', 'orchestrated', 'streamlined',
  'developed', 'designed', 'implemented', 'optimized', 'scaled', 'accelerated',
  'automated', 'built', 'delivered', 'led', 'managed', 'reduced', 'increased',
  'boosted', 'improved', 'transformed', 'formulated', 'directed', 'executed',
  'mentored', 'facilitated', 'authored', 'integrated', 'deployed', 'migrated',
  'standardized', 'fine-tuned', 'trained', 'evaluated', 'modeled', 'synthesized',
]);

// Common filler/stop words to ignore when extracting job keywords
const STOP_WORDS = new Set([
  'and', 'the', 'for', 'with', 'you', 'will', 'are', 'our', 'that', 'this',
  'have', 'from', 'your', 'about', 'must', 'should', 'been', 'work', 'working',
  'candidate', 'team', 'teams', 'looking', 'role', 'responsibilities', 'requirements',
  'qualifications', 'years', 'experience', 'ability', 'strong', 'skills', 'good',
  'understanding', 'knowledge', 'across', 'using', 'well', 'such', 'more', 'than',
  'self', 'starter', 'fast', 'paced', 'environment', 'plus', 'preferred', 'degree',
  'high', 'level', 'help', 'join', 'company', 'solutions', 'opportunity',
]);

export function extractKeywordsFromText(text: string): string[] {
  if (!text) return [];
  const cleaned = text
    .toLowerCase()
    .replace(/[^a-z0-9+#./\s-]/g, ' ')
    .split(/\s+/)
    .map((w) => w.trim())
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));

  // Count word frequencies
  const freqMap: Record<string, number> = {};
  for (const word of cleaned) {
    freqMap[word] = (freqMap[word] || 0) + 1;
  }

  // Multi-word tech term detector (e.g. "machine learning", "rest api", "full stack", "ci cd")
  const commonPhrases = [
    'machine learning', 'deep learning', 'react js', 'next js', 'node js',
    'rest api', 'restful api', 'ci cd', 'full stack', 'cloud computing',
    'agile scrum', 'unit testing', 'sql database', 'data structures',
    'responsive design', 'user experience', 'system design', 'microservices',
  ];

  const lowerText = text.toLowerCase();
  const phraseMatches: string[] = [];
  for (const phrase of commonPhrases) {
    if (lowerText.includes(phrase)) {
      phraseMatches.push(phrase);
    }
  }

  // Sort unique individual words by frequency
  const sortedWords = Object.keys(freqMap)
    .sort((a, b) => freqMap[b] - freqMap[a])
    .slice(0, 30);

  // Return unique combination of top phrases and top words
  return Array.from(new Set([...phraseMatches, ...sortedWords])).slice(0, 25);
}

export function getAllResumeText(resume: ResumeData): string {
  const parts: string[] = [
    resume.contact.name,
    resume.summary,
    ...resume.education.map((e) => `${e.degree} ${e.institution} ${e.coursework || ''}`),
    ...resume.skills.flatMap((s) => [s.category, ...s.skills]),
    ...resume.positions.flatMap((p) => [p.title, p.organization || '', ...p.bullets]),
    ...resume.projects.flatMap((p) => [p.name, ...p.tech, ...p.bullets]),
    ...resume.certifications.map((c) => `${c.title} ${c.issuer}`),
  ];

  if (resume.customSections) {
    for (const sec of resume.customSections) {
      parts.push(sec.sectionTitle);
      for (const item of sec.items) {
        parts.push(item.title, item.subtitle || '', ...item.bullets);
      }
    }
  }

  return parts.join(' ').toLowerCase();
}

export function analyzeResumeATS(resume: ResumeData, jobDescription: string): ATSAnalysis {
  const resumeText = getAllResumeText(resume);
  const jdKeywords = extractKeywordsFromText(jobDescription);

  const matchedKeywords: string[] = [];
  const missingKeywords: string[] = [];

  for (const kw of jdKeywords) {
    if (resumeText.includes(kw.toLowerCase())) {
      matchedKeywords.push(kw);
    } else {
      missingKeywords.push(kw);
    }
  }

  // Action verb detection
  const resumeWords = resumeText.split(/\s+/);
  let actionVerbCount = 0;
  for (const word of resumeWords) {
    if (POWER_ACTION_VERBS.has(word)) {
      actionVerbCount++;
    }
  }

  // Metric detection (numbers, %, $, ms, x, k)
  const metricRegex = /\b(\d+(\.\d+)?%|\$\d+(\.\d+)?(k|m|b)?|\d+x|\d+\+?|\d+\s*(ms|seconds|minutes|hours|days|users|clients|students))\b/gi;
  const metricsFound = resumeText.match(metricRegex) || [];
  const metricCount = metricsFound.length;

  // Calculate score breakdown
  const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 45 : 35;
  const verbScore = Math.min((actionVerbCount / 6) * 20, 20);
  const metricScore = Math.min((metricCount / 4) * 20, 20);
  const structureScore = resume.summary && resume.skills.length >= 2 && resume.projects.length >= 1 ? 15 : 8;

  const totalScore = Math.min(Math.round(keywordScore + verbScore + metricScore + structureScore), 100);

  let grade: 'A+' | 'A' | 'B' | 'C' | 'D' = 'C';
  if (totalScore >= 90) grade = 'A+';
  else if (totalScore >= 80) grade = 'A';
  else if (totalScore >= 70) grade = 'B';
  else if (totalScore >= 60) grade = 'C';
  else grade = 'D';

  const suggestions: string[] = [];
  if (missingKeywords.length > 0) {
    suggestions.push(`Add top missing keywords like: ${missingKeywords.slice(0, 4).join(', ')}`);
  }
  if (metricCount < 3) {
    suggestions.push('Include more quantifiable impact metrics (e.g. "% improvement", "$ budget", "X users").');
  }
  if (actionVerbCount < 5) {
    suggestions.push('Start project & experience bullets with high-impact action verbs (Engineered, Architected, Spearheaded).');
  }
  if (!resume.summary || resume.summary.length < 50) {
    suggestions.push('Add a concise 2-3 sentence professional summary tailored to the target position.');
  }

  const wordCount = resumeText.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.round(wordCount / 200));

  return {
    score: totalScore,
    grade,
    matchedKeywords,
    missingKeywords,
    actionVerbCount,
    metricCount,
    suggestions,
    wordCount,
    readingTimeMinutes,
  };
}
