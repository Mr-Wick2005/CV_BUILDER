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
  column?: 1 | 2;
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

export interface OriginalDocument {
  id: string;
  type: 'pdf';
  fileName: string;          // exact uploaded name
  mimeType: 'application/pdf';
  sizeBytes: number;
  sha256: string;            // integrity check of original bytes
  uploadedAt: string;        // ISO
  pageCount?: number;
  blobRef: string;           // key/path to stored bytes in IndexedDB
}

export interface EditableResume {
  id: string;
  sourceDocumentId?: string; // link to OriginalDocument
  versionLabel?: string;     // e.g., "Original", "Full Stack Developer"
  baseVersionId?: string;    // parent version (future-proofing)
  data: ResumeData;          // reuse existing resume schema
  extractionStatus: 'ok' | 'partial' | 'failed';
  isDirty: boolean;          // true once user edits or AI tailoring is applied
  updatedAt: string;
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
  originalDocId?: string;
  isDirty?: boolean;
  extractionStatus?: 'ok' | 'partial' | 'failed';
  versionLabel?: string;
  previewMode?: 'original' | 'editable';
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
