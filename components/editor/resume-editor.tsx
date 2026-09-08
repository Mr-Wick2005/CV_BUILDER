'use client';

import { useState } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  User,
  GraduationCap,
  Wrench,
  Briefcase,
  FolderGit2,
  Award,
  Plus,
  Trash2,
  Sparkles,
  Loader2,
  Eye,
  EyeOff,
  ExternalLink,
  Github,
  Globe,
  Layers,
  FileCode,
  BookmarkPlus,
  Wand2,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type {
  ResumeData,
  ProjectEntry,
  PositionEntry,
  EducationEntry,
  SkillCategory,
  CertificationEntry,
  CustomSection,
  CustomSectionItem,
} from '@/lib/types';
import { getUserApiKey } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface ResumeEditorProps {
  resume: ResumeData;
  onChange: (updated: ResumeData) => void;
  targetRole?: string;
  onAddSectionToOrder?: (sectionId: string) => void;
}

export function ResumeEditor({
  resume,
  onChange,
  targetRole = 'Software Engineer',
  onAddSectionToOrder,
}: ResumeEditorProps) {
  const { toast } = useToast();
  const [enhancingBulletIdx, setEnhancingBulletIdx] = useState<string | null>(null);
  const [polishingSummary, setPolishingSummary] = useState(false);
  const [generatingHeadline, setGeneratingHeadline] = useState(false);
  const [generatingProjectBulletsIdx, setGeneratingProjectBulletsIdx] = useState<number | null>(null);
  const [newSectionModalOpen, setNewSectionModalOpen] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');

  // Update contact field
  const updateContact = (field: keyof typeof resume.contact, value: string) => {
    onChange({
      ...resume,
      contact: { ...resume.contact, [field]: value },
    });
  };

  // AI Generate Headline
  const handleGenerateHeadline = async () => {
    setGeneratingHeadline(true);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_headline',
          role: targetRole,
          context: resume.skills.map((s) => s.skills.slice(0, 3).join(', ')).join(', '),
          userApiKey,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      updateContact('headline', data.enhanced);
      toast({ title: 'Headline Generated', description: 'Added tailored professional headline.' });
    } catch {
      toast({ title: 'AI Error', description: 'Could not generate headline.', variant: 'destructive' });
    } finally {
      setGeneratingHeadline(false);
    }
  };

  // Enhance a single bullet point with AI
  const handleEnhanceBullet = async (
    originalBullet: string,
    onSuccess: (newBullet: string) => void,
    identifier: string,
    context?: string
  ) => {
    setEnhancingBulletIdx(identifier);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'enhance_bullet',
          bullet: originalBullet,
          role: targetRole,
          context: context || '',
          userApiKey,
        }),
      });

      if (!res.ok) throw new Error('Enhancement failed');
      const data = await res.json();
      onSuccess(data.enhanced);
      toast({ title: 'Bullet Enhanced', description: 'Rewritten with action verbs and impact metrics.' });
    } catch {
      toast({ title: 'Enhance failed', description: 'Could not enhance bullet with AI.', variant: 'destructive' });
    } finally {
      setEnhancingBulletIdx(null);
    }
  };

  // Polish summary with AI
  const handlePolishSummary = async () => {
    setPolishingSummary(true);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'polish_summary',
          bullet: resume.summary,
          role: targetRole,
          context: resume.summary,
          userApiKey,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      onChange({ ...resume, summary: data.enhanced });
      toast({ title: 'Summary Polished', description: `Optimized for ${targetRole}.` });
    } catch {
      toast({ title: 'Failed', description: 'Could not polish summary.', variant: 'destructive' });
    } finally {
      setPolishingSummary(false);
    }
  };

  // Generate 3 STAR Bullets for Project with AI
  const handleGenerateProjectBullets = async (projIdx: number) => {
    const proj = resume.projects[projIdx];
    if (!proj) return;

    setGeneratingProjectBulletsIdx(projIdx);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/enhance-bullet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_project_bullets',
          name: proj.name,
          tech: proj.tech,
          role: targetRole,
          userApiKey,
        }),
      });

      if (!res.ok) throw new Error('Failed');
      const data = await res.json();
      if (data.bullets && data.bullets.length > 0) {
        const updatedProjects = [...resume.projects];
        updatedProjects[projIdx] = {
          ...proj,
          bullets: data.bullets,
        };
        onChange({ ...resume, projects: updatedProjects });
        toast({ title: 'STAR Bullets Generated', description: `Added 3 metric-driven bullets for ${proj.name}.` });
      }
    } catch {
      toast({ title: 'Generation failed', description: 'Could not generate bullets with AI.', variant: 'destructive' });
    } finally {
      setGeneratingProjectBulletsIdx(null);
    }
  };

  // Education handlers
  const addEducation = () => {
    const newEdu: EducationEntry = {
      degree: 'Bachelor of Engineering in Computer Engineering',
      institution: 'University Name',
      dates: '2023 – 2027',
      location: 'City, Country',
      gpa: '',
      coursework: '',
    };
    onChange({ ...resume, education: [...resume.education, newEdu] });
  };

  const updateEducation = (index: number, field: keyof EducationEntry, value: string) => {
    const updated = [...resume.education];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, education: updated });
  };

  const removeEducation = (index: number) => {
    onChange({ ...resume, education: resume.education.filter((_, i) => i !== index) });
  };

  // Skill category handlers
  const addSkillCategory = () => {
    const newCat: SkillCategory = { category: 'Tools & Platforms', skills: ['Git', 'GitHub', 'VS Code', 'Docker'] };
    onChange({ ...resume, skills: [...resume.skills, newCat] });
  };

  const updateSkillCategory = (index: number, category: string, skillsString: string) => {
    const updated = [...resume.skills];
    const skillsArray = skillsString.split(',').map((s) => s.trim()).filter(Boolean);
    updated[index] = { category, skills: skillsArray };
    onChange({ ...resume, skills: updated });
  };

  const removeSkillCategory = (index: number) => {
    onChange({ ...resume, skills: resume.skills.filter((_, i) => i !== index) });
  };

  // Project handlers
  const addProject = () => {
    const newProj: ProjectEntry = {
      name: 'New Project Title',
      tech: ['React.js', 'Node.js', 'PostgreSQL'],
      bullets: ['Architected scalable full-stack web application supporting high concurrent traffic.'],
      link: 'https://demo.app',
      github: 'https://github.com/username/project',
      date: '2025',
      visible: true,
    };
    onChange({ ...resume, projects: [...resume.projects, newProj] });
  };

  const updateProject = (index: number, field: keyof ProjectEntry, value: any) => {
    const updated = [...resume.projects];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, projects: updated });
  };

  const removeProject = (index: number) => {
    onChange({ ...resume, projects: resume.projects.filter((_, i) => i !== index) });
  };

  // Position / Experience handlers
  const addPosition = () => {
    const newPos: PositionEntry = {
      title: 'Role Title (e.g. Software Engineer Intern)',
      organization: 'Organization / Company Name',
      location: 'City, Country',
      dates: 'Jan 2025 – Present',
      bullets: ['Spearheaded engineering initiatives, improving throughput and reliability.'],
    };
    onChange({ ...resume, positions: [...resume.positions, newPos] });
  };

  const updatePosition = (index: number, field: keyof PositionEntry, value: any) => {
    const updated = [...resume.positions];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, positions: updated });
  };

  const removePosition = (index: number) => {
    onChange({ ...resume, positions: resume.positions.filter((_, i) => i !== index) });
  };

  // Certification handlers
  const addCertification = () => {
    const newCert: CertificationEntry = {
      title: 'Certification Name',
      issuer: 'Issuing Body',
      year: '2025',
      link: '',
    };
    onChange({ ...resume, certifications: [...resume.certifications, newCert] });
  };

  const updateCertification = (index: number, field: keyof CertificationEntry, value: string) => {
    const updated = [...resume.certifications];
    updated[index] = { ...updated[index], [field]: value };
    onChange({ ...resume, certifications: updated });
  };

  const removeCertification = (index: number) => {
    onChange({ ...resume, certifications: resume.certifications.filter((_, i) => i !== index) });
  };

  // Custom Sections Handlers
  const handleCreateCustomSection = (title: string) => {
    if (!title.trim()) return;
    const newId = `custom-${Date.now()}`;
    const newSec: CustomSection = {
      id: newId,
      sectionTitle: title.trim(),
      items: [
        {
          id: `item-${Date.now()}`,
          title: 'Entry Title / Name',
          subtitle: 'Subtitle / Role / Organization',
          date: '2025',
          bullets: ['Accomplished milestone or notable contribution.'],
        },
      ],
    };

    const updatedCustom = [...(resume.customSections || []), newSec];
    const updatedOrder = [...(resume.sectionOrder || []), newId];
    onChange({
      ...resume,
      customSections: updatedCustom,
      sectionOrder: updatedOrder,
    });
    if (onAddSectionToOrder) {
      onAddSectionToOrder(newId);
    }
    setNewSectionModalOpen(false);
    setNewSectionTitle('');
    toast({ title: 'Section Added', description: `Created "${title}" section.` });
  };

  const removeCustomSection = (id: string) => {
    const updatedCustom = (resume.customSections || []).filter((cs) => cs.id !== id);
    const updatedOrder = (resume.sectionOrder || []).filter((s) => s !== id);
    onChange({
      ...resume,
      customSections: updatedCustom,
      sectionOrder: updatedOrder,
    });
    toast({ title: 'Section Removed', description: 'Deleted custom section.' });
  };

  const updateCustomSectionItem = (secId: string, itemIdx: number, field: keyof CustomSectionItem, value: any) => {
    const custom = [...(resume.customSections || [])];
    const secIdx = custom.findIndex((cs) => cs.id === secId);
    if (secIdx === -1) return;

    const items = [...custom[secIdx].items];
    items[itemIdx] = { ...items[itemIdx], [field]: value };
    custom[secIdx] = { ...custom[secIdx], items };
    onChange({ ...resume, customSections: custom });
  };

  const addCustomSectionItem = (secId: string) => {
    const custom = [...(resume.customSections || [])];
    const secIdx = custom.findIndex((cs) => cs.id === secId);
    if (secIdx === -1) return;

    custom[secIdx].items.push({
      id: `item-${Date.now()}`,
      title: 'New Entry',
      subtitle: '',
      date: '2025',
      bullets: ['Key contribution or accomplishment.'],
    });
    onChange({ ...resume, customSections: custom });
  };

  return (
    <div className="space-y-4">
      {/* Add New Custom Section Trigger */}
      <div className="flex items-center justify-between bg-card/60 p-2.5 rounded-lg border border-border">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Layers className="h-4 w-4 text-primary" />
          <span>Need more sections? (Publications, Hackathons, Volunteer)</span>
        </div>

        <Dialog open={newSectionModalOpen} onOpenChange={setNewSectionModalOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-primary/30 text-primary hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5" /> Add Section
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-base flex items-center gap-2">
                <BookmarkPlus className="h-4 w-4 text-primary" /> Add Custom Resume Section
              </DialogTitle>
              <DialogDescription className="text-xs">
                Choose a pre-defined section or type your own custom title.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-3 pt-2">
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Publications',
                  'Achievements & Honors',
                  'Volunteer Experience',
                  'Hackathons & Competitions',
                  'Open Source Contributions',
                  'Languages & Hobbies',
                  'Extracurricular Activities',
                ].map((preset) => (
                  <Button
                    key={preset}
                    variant="outline"
                    size="sm"
                    onClick={() => handleCreateCustomSection(preset)}
                    className="h-7 text-xs hover:border-primary"
                  >
                    + {preset}
                  </Button>
                ))}
              </div>

              <div className="space-y-1.5 pt-2">
                <Label className="text-xs font-semibold">Or Type Custom Section Title</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g. Leadership & Mentorship"
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    onClick={() => handleCreateCustomSection(newSectionTitle)}
                    disabled={!newSectionTitle.trim()}
                    className="h-8 text-xs shrink-0"
                  >
                    Add
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Accordions for Every Section */}
      <Accordion type="multiple" defaultValue={['contact', 'summary', 'skills', 'projects', 'positions', 'education', 'certifications']} className="space-y-3">
        {/* 1. Contact Information */}
        <AccordionItem value="contact" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <User className="h-4 w-4 text-primary" />
              Contact & Header Details
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div className="space-y-1">
                <Label className="text-xs font-medium">Full Candidate Name</Label>
                <Input
                  value={resume.contact.name}
                  onChange={(e) => updateContact('name', e.target.value)}
                  placeholder="e.g. VEDANTH GALI"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-medium">Professional Headline / Subtitle</Label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateHeadline}
                    disabled={generatingHeadline}
                    className="h-5 text-[10px] gap-1 text-primary p-0 hover:bg-transparent"
                  >
                    {generatingHeadline ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                    AI Headline
                  </Button>
                </div>
                <Input
                  value={resume.contact.headline || ''}
                  onChange={(e) => updateContact('headline', e.target.value)}
                  placeholder="e.g. Full Stack Engineer | React & Node.js"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Email Address</Label>
                <Input
                  value={resume.contact.email}
                  onChange={(e) => updateContact('email', e.target.value)}
                  placeholder="jane@domain.com"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Phone Number</Label>
                <Input
                  value={resume.contact.phone}
                  onChange={(e) => updateContact('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Location</Label>
                <Input
                  value={resume.contact.location}
                  onChange={(e) => updateContact('location', e.target.value)}
                  placeholder="Mumbai, Maharashtra, India"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">LinkedIn Profile URL</Label>
                <Input
                  value={resume.contact.linkedin}
                  onChange={(e) => updateContact('linkedin', e.target.value)}
                  placeholder="https://linkedin.com/in/username"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">GitHub Profile URL</Label>
                <Input
                  value={resume.contact.github}
                  onChange={(e) => updateContact('github', e.target.value)}
                  placeholder="https://github.com/username"
                  className="text-xs h-8"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-xs font-medium">Portfolio / Personal Website</Label>
                <Input
                  value={resume.contact.portfolio || resume.contact.website || ''}
                  onChange={(e) => {
                    updateContact('portfolio', e.target.value);
                    updateContact('website', e.target.value);
                  }}
                  placeholder="https://myportfolio.dev"
                  className="text-xs h-8"
                />
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 2. Professional Summary */}
        <AccordionItem value="summary" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-primary" />
              Professional Summary
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-2 pt-2">
            <Textarea
              value={resume.summary}
              onChange={(e) => onChange({ ...resume, summary: e.target.value })}
              placeholder="Write a concise 2-3 sentence overview of your background, core strengths, and goals..."
              className="min-h-[90px] text-xs resize-y font-sans leading-relaxed"
            />
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePolishSummary}
                disabled={polishingSummary || !resume.summary}
                className="h-7 text-xs gap-1 text-primary border-primary/30 hover:bg-primary/10"
              >
                {polishingSummary ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <Sparkles className="h-3 w-3" />
                )}
                AI Polish Summary for {targetRole}
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* 3. Technical & Core Skills */}
        <AccordionItem value="skills" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Wrench className="h-4 w-4 text-primary" />
              Technical Skills ({resume.skills.length} Categories)
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            {resume.skills.map((cat, i) => (
              <div key={i} className="space-y-1.5 p-2.5 rounded-md border border-border/80 bg-card/60">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={cat.category}
                    onChange={(e) => updateSkillCategory(i, e.target.value, cat.skills.join(', '))}
                    placeholder="Category (e.g. Languages, Frontend, Backend)"
                    className="text-xs h-7 font-semibold"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeSkillCategory(i)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <Input
                  value={cat.skills.join(', ')}
                  onChange={(e) => updateSkillCategory(i, cat.category, e.target.value)}
                  placeholder="Comma separated skills (e.g. JavaScript, Python, React, SQL)"
                  className="text-xs h-7"
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addSkillCategory} className="w-full h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Skill Category
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 4. Projects (With Live Demo & GitHub Links) */}
        <AccordionItem value="projects" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <FolderGit2 className="h-4 w-4 text-primary" />
              Projects ({resume.projects.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {resume.projects.map((proj, pIdx) => (
              <div key={pIdx} className="space-y-2.5 p-3 rounded-lg border border-border bg-card/60">
                {/* Title & Visibility */}
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={proj.name}
                    onChange={(e) => updateProject(pIdx, 'name', e.target.value)}
                    placeholder="Project Name (e.g. College Buzz)"
                    className="text-xs font-semibold h-7"
                  />
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => updateProject(pIdx, 'visible', !proj.visible)}
                      className="h-7 w-7"
                      title={proj.visible ? 'Hide from resume' : 'Show on resume'}
                    >
                      {proj.visible ? <Eye className="h-3.5 w-3.5 text-primary" /> : <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProject(pIdx)}
                      className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="space-y-1">
                  <Label className="text-[11px] text-muted-foreground">Technologies & Frameworks</Label>
                  <Input
                    value={proj.tech.join(', ')}
                    onChange={(e) =>
                      updateProject(
                        pIdx,
                        'tech',
                        e.target.value.split(',').map((t) => t.trim()).filter(Boolean)
                      )
                    }
                    placeholder="e.g. React.js, Node.js, Express.js, SQL"
                    className="text-xs h-7"
                  />
                </div>

                {/* Project Links (Live Demo & GitHub Repo) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Globe className="h-3 w-3 text-primary" /> Live Demo / Deployed Link
                    </Label>
                    <Input
                      value={proj.link || ''}
                      onChange={(e) => updateProject(pIdx, 'link', e.target.value)}
                      placeholder="https://myproject.vercel.app"
                      className="text-xs h-7"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[11px] text-muted-foreground flex items-center gap-1">
                      <Github className="h-3 w-3" /> GitHub Repo Link
                    </Label>
                    <Input
                      value={proj.github || ''}
                      onChange={(e) => updateProject(pIdx, 'github', e.target.value)}
                      placeholder="https://github.com/username/project"
                      className="text-xs h-7"
                    />
                  </div>
                </div>

                {/* Bullets & AI Generation */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <Label className="text-[11px] text-muted-foreground font-semibold">Bullet Points (STAR Format)</Label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateProjectBullets(pIdx)}
                      disabled={generatingProjectBulletsIdx === pIdx}
                      className="h-5 text-[10px] gap-1 text-primary hover:bg-primary/10 px-1.5"
                    >
                      {generatingProjectBulletsIdx === pIdx ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <Wand2 className="h-3 w-3" />
                      )}
                      AI Generate 3 Bullets
                    </Button>
                  </div>

                  {proj.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <Textarea
                        value={bullet}
                        onChange={(e) => {
                          const updatedBullets = [...proj.bullets];
                          updatedBullets[bIdx] = e.target.value;
                          updateProject(pIdx, 'bullets', updatedBullets);
                        }}
                        className="text-xs min-h-[48px] resize-y flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleEnhanceBullet(
                              bullet,
                              (enhanced) => {
                                const updatedBullets = [...proj.bullets];
                                updatedBullets[bIdx] = enhanced;
                                updateProject(pIdx, 'bullets', updatedBullets);
                              },
                              `p-${pIdx}-${bIdx}`,
                              proj.name
                            )
                          }
                          disabled={enhancingBulletIdx === `p-${pIdx}-${bIdx}`}
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          title="Enhance with AI (STAR Method & Metrics)"
                        >
                          {enhancingBulletIdx === `p-${pIdx}-${bIdx}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedBullets = proj.bullets.filter((_, i) => i !== bIdx);
                            updateProject(pIdx, 'bullets', updatedBullets);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updateProject(pIdx, 'bullets', [
                        ...proj.bullets,
                        'Accomplished [X] by implementing [Y] with [Z].',
                      ]);
                    }}
                    className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" /> Add Bullet
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addProject} className="w-full h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Project
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 5. Experience & Positions of Responsibility */}
        <AccordionItem value="positions" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Briefcase className="h-4 w-4 text-primary" />
              Experience & Positions ({resume.positions.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4 pt-2">
            {resume.positions.map((pos, pIdx) => (
              <div key={pIdx} className="space-y-2.5 p-3 rounded-lg border border-border bg-card/60">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={pos.title}
                    onChange={(e) => updatePosition(pIdx, 'title', e.target.value)}
                    placeholder="Role Title (e.g. Conference Coordinator & Creative Head)"
                    className="text-xs font-semibold h-7"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePosition(pIdx)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={pos.organization || ''}
                    onChange={(e) => updatePosition(pIdx, 'organization', e.target.value)}
                    placeholder="Organization / Department"
                    className="text-xs h-7"
                  />
                  <Input
                    value={pos.dates || ''}
                    onChange={(e) => updatePosition(pIdx, 'dates', e.target.value)}
                    placeholder="Dates (e.g. 2024 – 2025)"
                    className="text-xs h-7"
                  />
                </div>

                {/* Bullets */}
                <div className="space-y-1.5">
                  <Label className="text-[11px] text-muted-foreground">Bullet Points</Label>
                  {pos.bullets.map((bullet, bIdx) => (
                    <div key={bIdx} className="flex items-start gap-1.5">
                      <Textarea
                        value={bullet}
                        onChange={(e) => {
                          const updatedBullets = [...pos.bullets];
                          updatedBullets[bIdx] = e.target.value;
                          updatePosition(pIdx, 'bullets', updatedBullets);
                        }}
                        className="text-xs min-h-[48px] resize-y flex-1"
                      />
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() =>
                            handleEnhanceBullet(
                              bullet,
                              (enhanced) => {
                                const updatedBullets = [...pos.bullets];
                                updatedBullets[bIdx] = enhanced;
                                updatePosition(pIdx, 'bullets', updatedBullets);
                              },
                              `pos-${pIdx}-${bIdx}`,
                              pos.title
                            )
                          }
                          disabled={enhancingBulletIdx === `pos-${pIdx}-${bIdx}`}
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          title="Enhance with AI"
                        >
                          {enhancingBulletIdx === `pos-${pIdx}-${bIdx}` ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Sparkles className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const updatedBullets = pos.bullets.filter((_, i) => i !== bIdx);
                            updatePosition(pIdx, 'bullets', updatedBullets);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      updatePosition(pIdx, 'bullets', [
                        ...pos.bullets,
                        'Spearheaded initiatives resulting in measurable improvements.',
                      ]);
                    }}
                    className="h-6 text-[11px] gap-1 text-muted-foreground hover:text-foreground"
                  >
                    <Plus className="h-3 w-3" /> Add Bullet
                  </Button>
                </div>
              </div>
            ))}

            <Button variant="outline" size="sm" onClick={addPosition} className="w-full h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Experience / Role
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 6. Education */}
        <AccordionItem value="education" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <GraduationCap className="h-4 w-4 text-primary" />
              Education ({resume.education.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            {resume.education.map((edu, i) => (
              <div key={i} className="space-y-2 p-2.5 rounded-md border border-border bg-card/60">
                <div className="flex items-center justify-between gap-2">
                  <Input
                    value={edu.degree}
                    onChange={(e) => updateEducation(i, 'degree', e.target.value)}
                    placeholder="Degree (e.g. Bachelor of Engineering in Computer Engineering)"
                    className="text-xs font-semibold h-7"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeEducation(i)}
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={edu.institution}
                    onChange={(e) => updateEducation(i, 'institution', e.target.value)}
                    placeholder="University / College"
                    className="text-xs h-7"
                  />
                  <Input
                    value={edu.dates}
                    onChange={(e) => updateEducation(i, 'dates', e.target.value)}
                    placeholder="Duration (e.g. 2023 – 2027)"
                    className="text-xs h-7"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    value={edu.location || ''}
                    onChange={(e) => updateEducation(i, 'location', e.target.value)}
                    placeholder="Location (e.g. Mumbai, India)"
                    className="text-xs h-7"
                  />
                  <Input
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(i, 'gpa', e.target.value)}
                    placeholder="GPA (e.g. 3.8 / 4.0)"
                    className="text-xs h-7"
                  />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addEducation} className="w-full h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Education
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 7. Certifications */}
        <AccordionItem value="certifications" className="rounded-lg border border-border bg-card/40 px-3">
          <AccordionTrigger className="hover:no-underline py-3">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Award className="h-4 w-4 text-primary" />
              Certifications ({resume.certifications.length})
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-3 pt-2">
            {resume.certifications.map((cert, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-md border border-border bg-card/60">
                <Input
                  value={cert.title}
                  onChange={(e) => updateCertification(i, 'title', e.target.value)}
                  placeholder="Certification Title"
                  className="text-xs h-7 flex-1 font-semibold"
                />
                <Input
                  value={cert.issuer}
                  onChange={(e) => updateCertification(i, 'issuer', e.target.value)}
                  placeholder="Issuer"
                  className="text-xs h-7 w-28"
                />
                <Input
                  value={cert.year}
                  onChange={(e) => updateCertification(i, 'year', e.target.value)}
                  placeholder="Year"
                  className="text-xs h-7 w-16 text-center"
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeCertification(i)}
                  className="h-7 w-7 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addCertification} className="w-full h-8 text-xs gap-1">
              <Plus className="h-3.5 w-3.5" /> Add Certification
            </Button>
          </AccordionContent>
        </AccordionItem>

        {/* 8. Custom User-Created Sections */}
        {resume.customSections?.map((customSec) => (
          <AccordionItem
            key={customSec.id}
            value={customSec.id}
            className="rounded-lg border border-primary/40 bg-primary/5 px-3"
          >
            <AccordionTrigger className="hover:no-underline py-3">
              <div className="flex items-center justify-between w-full pr-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                  <BookmarkPlus className="h-4 w-4" />
                  {customSec.sectionTitle} ({customSec.items.length})
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="space-y-3 pt-2">
              <div className="flex items-center justify-between gap-2">
                <Input
                  value={customSec.sectionTitle}
                  onChange={(e) => {
                    const custom = (resume.customSections || []).map((cs) =>
                      cs.id === customSec.id ? { ...cs, sectionTitle: e.target.value } : cs
                    );
                    onChange({ ...resume, customSections: custom });
                  }}
                  placeholder="Section Title"
                  className="text-xs h-7 font-bold text-primary"
                />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCustomSection(customSec.id)}
                  className="h-7 text-xs text-rose-400 hover:text-rose-500 gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete Section
                </Button>
              </div>

              {customSec.items.map((item, itemIdx) => (
                <div key={item.id || itemIdx} className="space-y-2 p-2.5 rounded-md border border-border bg-card/60">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={item.title}
                      onChange={(e) => updateCustomSectionItem(customSec.id, itemIdx, 'title', e.target.value)}
                      placeholder="Title / Project / Publication"
                      className="text-xs font-semibold h-7"
                    />
                    <Input
                      value={item.date || ''}
                      onChange={(e) => updateCustomSectionItem(customSec.id, itemIdx, 'date', e.target.value)}
                      placeholder="Year / Date"
                      className="text-xs h-7"
                    />
                  </div>
                  <Input
                    value={item.subtitle || ''}
                    onChange={(e) => updateCustomSectionItem(customSec.id, itemIdx, 'subtitle', e.target.value)}
                    placeholder="Subtitle / Organization / Conference"
                    className="text-xs h-7"
                  />
                  {/* Bullets */}
                  <div className="space-y-1">
                    {item.bullets.map((b, bIdx) => (
                      <div key={bIdx} className="flex items-center gap-1.5">
                        <Input
                          value={b}
                          onChange={(e) => {
                            const newBullets = [...item.bullets];
                            newBullets[bIdx] = e.target.value;
                            updateCustomSectionItem(customSec.id, itemIdx, 'bullets', newBullets);
                          }}
                          className="text-xs h-7 flex-1"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const newBullets = item.bullets.filter((_, i) => i !== bIdx);
                            updateCustomSectionItem(customSec.id, itemIdx, 'bullets', newBullets);
                          }}
                          className="h-7 w-7 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        updateCustomSectionItem(customSec.id, itemIdx, 'bullets', [...item.bullets, 'New bullet point.']);
                      }}
                      className="h-6 text-[10px] gap-1 text-muted-foreground"
                    >
                      <Plus className="h-3 w-3" /> Add Bullet
                    </Button>
                  </div>
                </div>
              ))}

              <Button
                variant="outline"
                size="sm"
                onClick={() => addCustomSectionItem(customSec.id)}
                className="w-full h-8 text-xs gap-1"
              >
                <Plus className="h-3.5 w-3.5" /> Add Item to {customSec.sectionTitle}
              </Button>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
