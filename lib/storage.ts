import type { ResumeData, SavedResumeMeta } from './types';
import { SAMPLE_PROFILES } from './sample-profiles';

const STORAGE_KEY_RESUMES = 'cvadapt_saved_resumes_v2';
const STORAGE_KEY_ACTIVE_ID = 'cvadapt_active_resume_id_v2';
const STORAGE_KEY_USER_API_KEY = 'cvadapt_user_gemini_key_v2';

export function getSavedResumesList(): SavedResumeMeta[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
    if (!raw) return [];
    const list = JSON.parse(raw) as { id: string; title?: string; contact?: { name?: string }; updatedAt?: string }[];
    return list.map((item) => ({
      id: item.id,
      title: item.title || item.contact?.name || 'Untitled Resume',
      updatedAt: item.updatedAt || new Date().toISOString(),
    }));
  } catch {
    return [];
  }
}

export function loadAllResumes(): ResumeData[] {
  if (typeof window === 'undefined') return [SAMPLE_PROFILES['full-stack'].data];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_RESUMES);
    if (!raw) {
      // Initialize with sample profiles if empty
      const initial: ResumeData[] = [
        SAMPLE_PROFILES['full-stack'].data,
        SAMPLE_PROFILES['ai-data-science'].data,
      ];
      saveAllResumes(initial);
      return initial;
    }
    const parsed = JSON.parse(raw) as ResumeData[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [SAMPLE_PROFILES['full-stack'].data];
  } catch {
    return [SAMPLE_PROFILES['full-stack'].data];
  }
}

export function saveAllResumes(resumes: ResumeData[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY_RESUMES, JSON.stringify(resumes));
  } catch (err) {
    console.error('Failed to save resumes to localStorage', err);
  }
}

export function getActiveResumeId(): string {
  if (typeof window === 'undefined') return 'profile-fullstack';
  return localStorage.getItem(STORAGE_KEY_ACTIVE_ID) || 'profile-fullstack';
}

export function setActiveResumeId(id: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_ACTIVE_ID, id);
}

export function saveCurrentResume(resume: ResumeData): ResumeData[] {
  const resumes = loadAllResumes();
  const id = resume.id || `resume-${Date.now()}`;
  const updatedResume: ResumeData = {
    ...resume,
    id,
    updatedAt: new Date().toISOString(),
  };

  const index = resumes.findIndex((r) => r.id === id);
  if (index >= 0) {
    resumes[index] = updatedResume;
  } else {
    resumes.push(updatedResume);
  }

  saveAllResumes(resumes);
  setActiveResumeId(id);
  return resumes;
}

export function deleteResume(id: string): { remaining: ResumeData[]; newActive: ResumeData } {
  let resumes = loadAllResumes().filter((r) => r.id !== id);
  if (resumes.length === 0) {
    resumes = [SAMPLE_PROFILES['blank'].data];
  }
  saveAllResumes(resumes);
  const newActive = resumes[0];
  setActiveResumeId(newActive.id || 'profile-blank');
  return { remaining: resumes, newActive };
}

export function duplicateResume(id: string): { updatedList: ResumeData[]; newResume: ResumeData } {
  const resumes = loadAllResumes();
  const source = resumes.find((r) => r.id === id) || resumes[0] || SAMPLE_PROFILES['full-stack'].data;
  const newId = `resume-${Date.now()}`;
  const newResume: ResumeData = {
    ...JSON.parse(JSON.stringify(source)),
    id: newId,
    title: `${source.title || source.contact.name || 'Resume'} (Copy)`,
    updatedAt: new Date().toISOString(),
  };

  resumes.push(newResume);
  saveAllResumes(resumes);
  setActiveResumeId(newId);
  return { updatedList: resumes, newResume };
}

export function getUserApiKey(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(STORAGE_KEY_USER_API_KEY) || '';
}

export function setUserApiKey(key: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY_USER_API_KEY, key.trim());
}
