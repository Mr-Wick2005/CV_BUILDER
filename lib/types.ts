export interface ContactInfo {
  name: string;
  phone: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
}

export interface EducationEntry {
  degree: string;
  institution: string;
  dates: string;
}

export interface SkillCategory {
  category: string;
  skills: string[];
}

export interface ProjectEntry {
  name: string;
  tech: string[];
  bullets: string[];
  visible: boolean;
}

export interface PositionEntry {
  title: string;
  bullets: string[];
}

export interface CertificationEntry {
  title: string;
  issuer: string;
  year: string;
}

export interface ResumeData {
  contact: ContactInfo;
  summary: string;
  education: EducationEntry[];
  skills: SkillCategory[];
  positions: PositionEntry[];
  projects: ProjectEntry[];
  certifications: CertificationEntry[];
}

export type TargetRole =
  | 'Full Stack Developer'
  | 'Project / Product Manager'
  | 'UI/UX Designer'
  | 'Software Tester / QA'
  | 'Custom';

export interface TailorRequest {
  role: string;
  jobDescription: string;
  resume: ResumeData;
}

export interface TailorResponse {
  summary: string;
  skills: SkillCategory[];
  projects: ProjectEntry[];
  positions: PositionEntry[];
}
