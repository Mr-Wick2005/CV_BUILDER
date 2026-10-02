'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Zap,
  Plus,
  Copy,
  Trash2,
  UploadCloud,
  Settings,
  FileSignature,
  Sparkles,
  ChevronDown,
  Check,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ControlPanel } from '@/components/control-panel';
import { ResumePreview } from '@/components/resume-preview';
import { ImportModal } from '@/components/import-modal';
import { SettingsModal } from '@/components/settings-modal';
import { CoverLetterModal } from '@/components/cover-letter-modal';
import {
  loadAllResumes,
  saveCurrentResume,
  getActiveResumeId,
  setActiveResumeId,
  duplicateResume,
  deleteResume,
  getUserApiKey,
} from '@/lib/storage';
import { getOriginalDocument } from '@/lib/original-doc-storage';
import { SAMPLE_PROFILES, DEFAULT_SECTION_ORDER } from '@/lib/sample-profiles';
import { tailorResume } from '@/lib/tailor';
import type { ResumeData, TailorResponse, OriginalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [activeResume, setActiveResume] = useState<ResumeData>(SAMPLE_PROFILES['full-stack'].data);
  const [activeOriginalDoc, setActiveOriginalDoc] = useState<OriginalDocument | null>(null);
  const [activeOriginalBlob, setActiveOriginalBlob] = useState<Blob | null>(null);
  const [previewMode, setPreviewMode] = useState<'original' | 'editable'>('editable');
  const [role, setRole] = useState('Full Stack Developer');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);

  // Modals state
  const [importOpen, setImportOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [coverLetterOpen, setCoverLetterOpen] = useState(false);

  const { toast } = useToast();

  // Load original document & blob from IndexedDB for the active resume
  const loadOriginalDocForResume = useCallback(async (resume: ResumeData) => {
    if (resume.originalDocId) {
      try {
        const stored = await getOriginalDocument(resume.originalDocId);
        if (stored) {
          setActiveOriginalDoc(stored.meta);
          setActiveOriginalBlob(stored.blob);
          setPreviewMode(resume.previewMode || (resume.isDirty ? 'editable' : 'original'));
          return;
        }
      } catch (err) {
        console.error('Failed to load original document from IndexedDB', err);
      }
    }
    setActiveOriginalDoc(null);
    setActiveOriginalBlob(null);
    setPreviewMode('editable');
  }, []);

  // Load resumes from LocalStorage on mount
  useEffect(() => {
    const all = loadAllResumes();
    setResumes(all);
    const activeId = getActiveResumeId();
    const found = all.find((r) => r.id === activeId) || all[0] || SAMPLE_PROFILES['full-stack'].data;
    setActiveResume(found);
    if (found.sectionOrder) {
      setSectionOrder(found.sectionOrder);
    }
    loadOriginalDocForResume(found);
  }, [loadOriginalDocForResume]);

  // Update active resume and auto-save (switches to editable mode on actual user edit)
  const handleUpdateResume = useCallback((updated: ResumeData) => {
    const isDirty = updated.originalDocId ? true : (updated.isDirty ?? false);
    const updatedResume: ResumeData = {
      ...updated,
      isDirty,
      previewMode: 'editable',
    };
    setActiveResume(updatedResume);
    setPreviewMode('editable');
    const savedList = saveCurrentResume(updatedResume);
    setResumes(savedList);
  }, []);

  // Toggle preview mode between original and editable
  const handleTogglePreviewMode = useCallback((mode: 'original' | 'editable') => {
    setPreviewMode(mode);
    const updated = { ...activeResume, previewMode: mode };
    setActiveResume(updated);
    saveCurrentResume(updated);
  }, [activeResume]);

  // Switch active resume
  const handleSwitchResume = useCallback((id: string) => {
    const all = loadAllResumes();
    const target = all.find((r) => r.id === id);
    if (target) {
      setActiveResume(target);
      setActiveResumeId(id);
      if (target.sectionOrder) {
        setSectionOrder(target.sectionOrder);
      }
      loadOriginalDocForResume(target);
      toast({ title: 'Switched Resume', description: `Now editing ${target.title || target.contact.name}.` });
    }
  }, [loadOriginalDocForResume, toast]);

  // Create new blank or sample resume
  const handleCreateNewResume = useCallback(() => {
    const newResume: ResumeData = {
      ...SAMPLE_PROFILES['blank'].data,
      id: `resume-${Date.now()}`,
      title: `Resume #${resumes.length + 1}`,
      updatedAt: new Date().toISOString(),
      previewMode: 'editable',
    };
    const saved = saveCurrentResume(newResume);
    setResumes(saved);
    setActiveResume(newResume);
    setActiveOriginalDoc(null);
    setActiveOriginalBlob(null);
    setPreviewMode('editable');
    toast({ title: 'New Resume Created', description: 'Start editing your custom details.' });
  }, [resumes.length, toast]);

  // Duplicate current resume
  const handleDuplicateResume = useCallback(() => {
    if (!activeResume.id) return;
    const { updatedList, newResume } = duplicateResume(activeResume.id);
    setResumes(updatedList);
    setActiveResume(newResume);
    loadOriginalDocForResume(newResume);
    toast({ title: 'Resume Duplicated', description: `Created copy: "${newResume.title}".` });
  }, [activeResume, loadOriginalDocForResume, toast]);

  // Delete current resume
  const handleDeleteResume = useCallback(() => {
    if (!activeResume.id) return;
    if (confirm(`Are you sure you want to delete "${activeResume.title || 'this resume'}"?`)) {
      const { remaining, newActive } = deleteResume(activeResume.id);
      setResumes(remaining);
      setActiveResume(newActive);
      loadOriginalDocForResume(newActive);
      toast({ title: 'Resume Deleted', description: 'Switched to next available resume.' });
    }
  }, [activeResume, loadOriginalDocForResume, toast]);

  // Import imported resume
  const handleImportResume = useCallback((imported: ResumeData, originalDoc?: OriginalDocument) => {
    const saved = saveCurrentResume(imported);
    setResumes(saved);
    setActiveResume(imported);
    if (imported.sectionOrder) {
      setSectionOrder(imported.sectionOrder);
    }
    if (imported.originalDocId) {
      loadOriginalDocForResume(imported);
    } else {
      setActiveOriginalDoc(null);
      setActiveOriginalBlob(null);
      setPreviewMode('editable');
    }
  }, [loadOriginalDocForResume]);

  // Reset all data
  const handleResetAllData = useCallback(() => {
    const initial = [
      SAMPLE_PROFILES['full-stack'].data,
      SAMPLE_PROFILES['ai-data-science'].data,
      SAMPLE_PROFILES['product-manager'].data,
    ];
    localStorage.clear();
    setResumes(initial);
    setActiveResume(initial[0]);
    setActiveResumeId(initial[0].id || 'profile-fullstack');
    setActiveOriginalDoc(null);
    setActiveOriginalBlob(null);
    setPreviewMode('editable');
    toast({ title: 'Workspace Reset', description: 'Restored default ATS student templates.' });
  }, [toast]);

  // Tailor Resume with AI or Local Fallback
  const handleTailor = useCallback(async () => {
    if (!role || !jobDescription.trim()) {
      toast({
        title: 'Missing information',
        description: 'Please select a target role and provide a job description.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role,
          jobDescription,
          resume: activeResume,
          userApiKey,
        }),
      });

      if (res.ok) {
        const data = (await res.json()) as TailorResponse;
        const updated: ResumeData = {
          ...activeResume,
          summary: data.summary ?? activeResume.summary,
          skills: data.skills ?? activeResume.skills,
          projects: data.projects ?? activeResume.projects,
          positions: data.positions ?? activeResume.positions,
          isDirty: true,
          previewMode: 'editable',
          versionLabel: role,
        };
        handleUpdateResume(updated);
        toast({
          title: 'Resume Tailored with AI',
          description: `Optimized and re-ranked for "${role}". Editable version displayed.`,
        });
      } else {
        const localTailored = tailorResume(activeResume, role, jobDescription);
        const updated: ResumeData = {
          ...localTailored,
          isDirty: true,
          previewMode: 'editable',
          versionLabel: role,
        };
        handleUpdateResume(updated);
        toast({
          title: 'Tailored with Built-in Engine',
          description: 'Optimized action verbs and keyword alignment locally.',
        });
      }
    } catch {
      const localTailored = tailorResume(activeResume, role, jobDescription);
      const updated: ResumeData = {
        ...localTailored,
        isDirty: true,
        previewMode: 'editable',
        versionLabel: role,
      };
      handleUpdateResume(updated);
      toast({
        title: 'Tailored Locally',
        description: 'AI server unreachable — applied intelligent local bullet re-ranking.',
      });
    } finally {
      setLoading(false);
    }
  }, [role, jobDescription, activeResume, handleUpdateResume, toast]);

  // Toggle project visibility
  const handleToggleProject = useCallback((index: number) => {
    const updatedProjects = activeResume.projects.map((p, i) =>
      i === index ? { ...p, visible: p.visible === false } : p
    );
    handleUpdateResume({ ...activeResume, projects: updatedProjects });
  }, [activeResume, handleUpdateResume]);

  // Add new section to section order
  const handleAddSectionToOrder = useCallback((sectionId: string) => {
    setSectionOrder((prev) => (prev.includes(sectionId) ? prev : [...prev, sectionId]));
  }, []);

  // Reorder sections
  const handleMoveSection = useCallback((id: string, dir: 'up' | 'down') => {
    setSectionOrder((prev) => {
      const arr = [...prev];
      const i = arr.indexOf(id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      handleUpdateResume({ ...activeResume, sectionOrder: arr });
      return arr;
    });
  }, [activeResume, handleUpdateResume]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Top Universal Platform Header */}
      <header className="no-print flex items-center justify-between border-b border-border bg-card/70 px-4 sm:px-6 py-2.5 backdrop-blur z-20">
        {/* Brand & Active Resume Title */}
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm shadow-primary/30">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold tracking-tight">
                CVAdapt <span className="text-primary">AI</span>
              </h1>
              <Badge variant="secondary" className="hidden sm:inline-flex text-[10px] py-0 px-1.5 h-4 bg-primary/10 text-primary border-primary/20">
                Universal ATS Platform
              </Badge>
            </div>
            <p className="hidden sm:block text-[11px] text-muted-foreground">
              Intelligent ATS Resume & Career Optimizer for Students
            </p>
          </div>
        </div>

        {/* Center / Right Toolbar Actions */}
        <div className="flex items-center gap-2">
          {/* Active Resume Switcher */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs max-w-[170px] sm:max-w-[220px] truncate">
                <span className="truncate">{activeResume.title || activeResume.contact.name || 'My Resume'}</span>
                <ChevronDown className="h-3 w-3 shrink-0 opacity-60" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="text-xs">Your Saved Resumes</DropdownMenuLabel>
              {resumes.map((r) => {
                const isCurrent = r.id === activeResume.id;
                return (
                  <DropdownMenuItem
                    key={r.id}
                    onClick={() => r.id && handleSwitchResume(r.id)}
                    className="text-xs flex items-center justify-between cursor-pointer"
                  >
                    <span className="truncate">{r.title || r.contact.name}</span>
                    {isCurrent && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                  </DropdownMenuItem>
                );
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleCreateNewResume} className="text-xs gap-2 cursor-pointer">
                <Plus className="h-3.5 w-3.5 text-primary" />
                New Blank Resume
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDuplicateResume} className="text-xs gap-2 cursor-pointer">
                <Copy className="h-3.5 w-3.5" />
                Duplicate Current
              </DropdownMenuItem>
              {resumes.length > 1 && (
                <DropdownMenuItem onClick={handleDeleteResume} className="text-xs gap-2 text-rose-400 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete Current
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Import / Upload Resume Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setImportOpen(true)}
            className="h-8 gap-1.5 text-xs"
          >
            <UploadCloud className="h-3.5 w-3.5 text-primary" />
            <span className="hidden sm:inline">Import CV</span>
          </Button>

          {/* Cover Letter Modal Trigger */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCoverLetterOpen(true)}
            className="h-8 gap-1.5 text-xs hidden md:inline-flex"
          >
            <FileSignature className="h-3.5 w-3.5" />
            Cover Letter
          </Button>

          {/* Settings Modal Trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSettingsOpen(true)}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title="Settings & BYOK Gemini API Key"
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Split-Panel Studio */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left Studio Panel */}
        <div className="no-print w-full border-b border-border lg:w-[460px] lg:border-b-0 lg:border-r lg:overflow-hidden bg-card/30">
          <ControlPanel
            role={role}
            setRole={setRole}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onTailor={handleTailor}
            loading={loading}
            resume={activeResume}
            onResumeChange={handleUpdateResume}
            onToggleProject={handleToggleProject}
            onMoveSection={handleMoveSection}
            onAddSectionToOrder={handleAddSectionToOrder}
            sectionOrder={sectionOrder}
          />
        </div>

        {/* Right Live A4 ATS Document Preview */}
        <div className="flex-1 overflow-hidden">
          <ResumePreview
            resume={activeResume}
            sectionOrder={sectionOrder}
            originalDoc={activeOriginalDoc}
            originalBlob={activeOriginalBlob}
            previewMode={previewMode}
            onTogglePreviewMode={handleTogglePreviewMode}
            onOpenCoverLetter={() => setCoverLetterOpen(true)}
          />
        </div>
      </div>

      {/* Modals */}
      <ImportModal
        open={importOpen}
        onOpenChange={setImportOpen}
        onImportResume={handleImportResume}
      />

      <SettingsModal
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        onResetAllData={handleResetAllData}
      />

      <CoverLetterModal
        open={coverLetterOpen}
        onOpenChange={setCoverLetterOpen}
        resume={activeResume}
        targetRole={role}
        jobDescription={jobDescription}
      />
    </div>
  );
}
