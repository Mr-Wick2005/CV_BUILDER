'use client';

import { useState, useCallback } from 'react';
import { FileText, Zap } from 'lucide-react';
import { ControlPanel } from '@/components/control-panel';
import { ResumePreview } from '@/components/resume-preview';
import { MASTER_RESUME } from '@/lib/master-data';
import { tailorResume } from '@/lib/tailor';
import type { ResumeData, TailorResponse } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

const DEFAULT_SECTION_ORDER = [
  'summary',
  'skills',
  'projects',
  'positions',
  'certifications',
];

export default function Home() {
  const [resume, setResume] = useState<ResumeData>(MASTER_RESUME);
  const [role, setRole] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [sectionOrder, setSectionOrder] = useState<string[]>(DEFAULT_SECTION_ORDER);
  const { toast } = useToast();

  const handleTailor = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/tailor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role, jobDescription, resume }),
      });

      if (res.ok) {
        const data = (await res.json()) as TailorResponse;
        setResume((prev) => ({
          ...prev,
          summary: data.summary ?? prev.summary,
          skills: data.skills ?? prev.skills,
          projects: data.projects ?? prev.projects,
          positions: data.positions ?? prev.positions,
        }));
        toast({ title: 'Resume tailored with AI', description: `Optimised for ${role}.` });
      } else {
        // Fallback to local tailoring
        const tailored = tailorResume(resume, role, jobDescription);
        setResume(tailored);
        toast({
          title: 'Tailored locally',
          description: 'AI service unavailable — used built-in tailoring.',
        });
      }
    } catch {
      const tailored = tailorResume(resume, role, jobDescription);
      setResume(tailored);
      toast({
        title: 'Tailored locally',
        description: 'AI service unreachable — used built-in tailoring.',
      });
    } finally {
      setLoading(false);
    }
  }, [role, jobDescription, resume, toast]);

  const handleToggleProject = useCallback((index: number) => {
    setResume((prev) => ({
      ...prev,
      projects: prev.projects.map((p, i) =>
        i === index ? { ...p, visible: !p.visible } : p
      ),
    }));
  }, []);

  const handleMoveSection = useCallback((id: string, dir: 'up' | 'down') => {
    setSectionOrder((prev) => {
      const arr = [...prev];
      const i = arr.indexOf(id);
      const j = dir === 'up' ? i - 1 : i + 1;
      if (j < 0 || j >= arr.length) return prev;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-background">
      {/* Header */}
      <header className="no-print flex items-center justify-between border-b border-border bg-card/60 px-6 py-3 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight">
              CVAdapt <span className="text-primary">AI</span>
            </h1>
            <p className="text-xs text-muted-foreground">Target-driven resume tailoring</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Zap className="h-3.5 w-3.5 text-primary" />
          <span className="hidden sm:inline">Powered by Gemini AI</span>
        </div>
      </header>

      {/* Split layout */}
      <div className="flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Left panel */}
        <div className="no-print w-full border-b border-border lg:w-[420px] lg:border-b-0 lg:border-r lg:overflow-hidden">
          <ControlPanel
            role={role}
            setRole={setRole}
            jobDescription={jobDescription}
            setJobDescription={setJobDescription}
            onTailor={handleTailor}
            loading={loading}
            resume={resume}
            onToggleProject={handleToggleProject}
            onMoveSection={handleMoveSection}
            sectionOrder={sectionOrder}
          />
        </div>

        {/* Right panel */}
        <div className="flex-1 overflow-hidden">
          <ResumePreview resume={resume} sectionOrder={sectionOrder} />
        </div>
      </div>
    </div>
  );
}
