export interface ContactInfo {
  name: string;
  headline?: string;
  phone: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  portfolio?: string;
  website?: string;
}

export interface EducationEntry {
  id?: string;
  degree: string;
  institution: string;
  dates: string;
  location?: string;
  gpa?: string;
  coursework?: string;
  honors?: string;
}

export interface SkillCategory {
  id?: string;
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  id?: string;
  name: string;
  tech: string[];
  bullets: string[];
  link?: string;
  github?: string;
  date?: string;
  visible: boolean;
}

export interface PositionEntry {
  id?: string;
  title: string;
  organization?: string;
  location?: string;
  dates?: string;
  bullets: string[];
}

export interface CertificationEntry {
  id?: string;
  title: string;
  issuer: string;
  year: string;
  link?: string;
}

export interface CustomSectionItem {
  id: string;
  title: string;
  subtitle?: string;
  date?: string;
  bullets: string[];
}

export interface CustomSection {
  id: string;
  sectionTitle: string;
  items: CustomSectionItem[];
}

export type TemplateId = 'harvard-ats' | 'modern-tech' | 'executive-slate' | 'compact-grid';
export type FontFamily = 'inter' | 'merriweather' | 'outfit' | 'roboto' | 'jetbrains';
export type AccentColor = 'slate' | 'sapphire' | 'emerald' | 'crimson' | 'royal' | 'charcoal';
export type SpacingDensity = 'compact' | 'standard' | 'relaxed';
export type BulletStyle = 'disc' | 'circle' | 'square' | 'dash';
export type FontSizeScale = 'sm' | 'base' | 'lg';

export interface ResumeStyleSettings {
  template: TemplateId;
  fontFamily: FontFamily;
  accentColor: AccentColor;
  customColor?: string;
  density: SpacingDensity;
  fontSizeScale?: FontSizeScale;
  showIcons: boolean;
  highlightKeywords: boolean;
  boldKeywords?: boolean;
  bulletStyle?: BulletStyle;
  headerAlignment?: 'center' | 'left';
}

export interface ResumeData {
  id?: string;
  title?: string;
  contact: ContactInfo;
  summary: string;
  education: EducationEntry[];
  skills: SkillCategory[];
  positions: PositionEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
  customSections?: CustomSection[];
  style?: ResumeStyleSettings;
  sectionOrder?: string[];
  updatedAt?: string;
}

export type TargetRole =
  | 'Full Stack Developer'
  | 'Frontend Engineer'
  | 'Backend / Cloud Engineer'
  | 'AI / Data Scientist'
  | 'Project / Product Manager'
  | 'UI/UX Designer'
  | 'Software Tester / QA'
  | 'DevOps / SRE'
  | 'Business Analyst'
  | 'Custom';

export interface TailorRequest {
  role: string;
  jobDescription: string;
  resume: ResumeData;
  userApiKey?: string;
}

export interface TailorResponse {
  summary: string;
  skills: SkillCategory[];
  projects: ProjectEntry[];
  positions: PositionEntry[];
  keywordsMatched?: string[];
  scoreEstimate?: number;
}

export interface ATSAnalysis {
  score: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D';
  matchedKeywords: string[];
  missingKeywords: string[];
  actionVerbCount: number;
  metricCount: number;
  suggestions: string[];
  wordCount: number;
  readingTimeMinutes: number;
}

export interface SavedResumeMeta {
  id: string;
  title: string;
  updatedAt: string;
  targetRole?: string;
}
