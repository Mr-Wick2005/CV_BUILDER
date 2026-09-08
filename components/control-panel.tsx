'use client';

import { useState } from 'react';
import {
  Target,
  Sparkles,
  Loader2,
  Eraser,
  Eye,
  EyeOff,
  ArrowUp,
  ArrowDown,
  Wand2,
  FileEdit,
  BarChart3,
  Palette,
  Check,
  Type,
  Bold,
  List,
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { TARGET_ROLES, JD_PRESETS } from '@/lib/master-data';
import type {
  ResumeData,
  TargetRole,
  TemplateId,
  FontFamily,
  AccentColor,
  SpacingDensity,
  BulletStyle,
  FontSizeScale,
} from '@/lib/types';
import { ResumeEditor } from '@/components/editor/resume-editor';
import { ATSScoreCard } from '@/components/ats-score-card';

interface ControlPanelProps {
  role: string;
  setRole: (r: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onTailor: () => void;
  loading: boolean;
  resume: ResumeData;
  onResumeChange: (updated: ResumeData) => void;
  onToggleProject: (index: number) => void;
  onMoveSection: (id: string, dir: 'up' | 'down') => void;
  onAddSectionToOrder?: (sectionId: string) => void;
  sectionOrder: string[];
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  education: 'Education',
  skills: 'Technical Skills',
  positions: 'Positions of Responsibility',
  projects: 'Projects',
  certifications: 'Certifications',
};

const TEMPLATE_OPTIONS: { id: TemplateId; label: string; desc: string }[] = [
  { id: 'harvard-ats', label: 'Harvard ATS Standard', desc: 'Maximum ATS parseability & clean dividers' },
  { id: 'modern-tech', label: 'Modern Tech Minimalist', desc: 'Sleek accent borders & tech badges' },
  { id: 'executive-slate', label: 'Executive Slate', desc: 'Two-tone headers & corporate elegance' },
  { id: 'compact-grid', label: 'Compact Single-Page', desc: 'High density single page fit' },
];

const FONT_OPTIONS: { id: FontFamily; label: string }[] = [
  { id: 'inter', label: 'Inter (Clean Modern Sans)' },
  { id: 'merriweather', label: 'Merriweather (Ivy League Serif)' },
  { id: 'outfit', label: 'Outfit (Geometric Clean)' },
  { id: 'roboto', label: 'Roboto (Classic Sans)' },
  { id: 'jetbrains', label: 'JetBrains Mono (Developer)' },
];

const COLOR_OPTIONS: { id: AccentColor; label: string; bg: string; hex: string }[] = [
  { id: 'slate', label: 'Slate Navy', bg: 'bg-slate-800', hex: '#0f172a' },
  { id: 'sapphire', label: 'Sapphire Blue', bg: 'bg-blue-700', hex: '#1e3a8a' },
  { id: 'emerald', label: 'Emerald Green', bg: 'bg-emerald-700', hex: '#064e3b' },
  { id: 'crimson', label: 'Crimson Red', bg: 'bg-rose-700', hex: '#881337' },
  { id: 'royal', label: 'Royal Violet', bg: 'bg-purple-800', hex: '#4c1d95' },
  { id: 'charcoal', label: 'Charcoal Black', bg: 'bg-zinc-900', hex: '#111827' },
];

const PRESET_ROLES = TARGET_ROLES.filter((r) => r !== 'Custom');

export function ControlPanel({
  role,
  setRole,
  jobDescription,
  setJobDescription,
  onTailor,
  loading,
  resume,
  onResumeChange,
  onToggleProject,
  onMoveSection,
  onAddSectionToOrder,
  sectionOrder,
}: ControlPanelProps) {
  const [activeTab, setActiveTab] = useState<'editor' | 'tailor' | 'ats' | 'design'>('editor');
  const [customRole, setCustomRole] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const isCustom = isCustomMode || (role !== '' && !PRESET_ROLES.includes(role as TargetRole));
  const currentSelectValue = isCustom ? 'Custom' : (role || undefined);

  const handleRoleChange = (value: string) => {
    if (value === 'Custom') {
      setIsCustomMode(true);
      setRole(customRole || 'Custom Role');
    } else {
      setIsCustomMode(false);
      setRole(value);
    }
  };

  const applyPreset = (presetKey: string) => {
    const preset = JD_PRESETS[presetKey];
    if (preset) {
      setJobDescription(preset.jd);
      setIsCustomMode(false);
      setRole(preset.role);
    }
  };

  const handleAddSkillFromATS = (skillName: string) => {
    const updated = [...resume.skills];
    if (updated.length > 0) {
      if (!updated[0].skills.includes(skillName)) {
        updated[0] = { ...updated[0], skills: [...updated[0].skills, skillName] };
      }
    } else {
      updated.push({ category: 'Key Skills', skills: [skillName] });
    }
    onResumeChange({ ...resume, skills: updated });
  };

  const updateStyle = (key: string, value: any) => {
    const currentStyle = resume.style || {
      template: 'harvard-ats',
      fontFamily: 'inter',
      accentColor: 'slate',
      density: 'standard',
      showIcons: true,
      highlightKeywords: false,
      boldKeywords: false,
      bulletStyle: 'disc',
      fontSizeScale: 'base',
    };
    onResumeChange({
      ...resume,
      style: {
        ...currentStyle,
        [key]: value,
      },
    });
  };

  const getSectionLabel = (id: string) => {
    if (SECTION_LABELS[id]) return SECTION_LABELS[id];
    if (id.startsWith('custom-')) {
      const customSec = resume.customSections?.find((cs) => cs.id === id);
      return customSec ? customSec.sectionTitle : 'Custom Section';
    }
    return id;
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Studio Tabs Navigation */}
      <div className="border-b border-border bg-card/70 px-4 pt-3 backdrop-blur">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="grid grid-cols-4 w-full h-9 bg-secondary/40">
            <TabsTrigger value="editor" className="text-xs gap-1.5 px-1 sm:px-2">
              <FileEdit className="h-3.5 w-3.5" />
              <span>Editor</span>
            </TabsTrigger>
            <TabsTrigger value="tailor" className="text-xs gap-1.5 px-1 sm:px-2">
              <Target className="h-3.5 w-3.5" />
              <span>AI Tailor</span>
            </TabsTrigger>
            <TabsTrigger value="ats" className="text-xs gap-1.5 px-1 sm:px-2">
              <BarChart3 className="h-3.5 w-3.5" />
              <span>ATS Score</span>
            </TabsTrigger>
            <TabsTrigger value="design" className="text-xs gap-1.5 px-1 sm:px-2">
              <Palette className="h-3.5 w-3.5" />
              <span>Design</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Main Tab Content Panels */}
      <div className="flex-1 overflow-y-auto app-scroll p-4 sm:p-5">
        {/* Tab 1: Interactive Resume Editor */}
        {activeTab === 'editor' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold tracking-tight">Interactive Resume Editor</h3>
                <p className="text-xs text-muted-foreground">Complete section-by-section editing & AI assist</p>
              </div>
            </div>
            <ResumeEditor
              resume={resume}
              onChange={onResumeChange}
              targetRole={role}
              onAddSectionToOrder={onAddSectionToOrder}
            />
          </div>
        )}

        {/* Tab 2: AI Role Tailor & JD Optimizer */}
        {activeTab === 'tailor' && (
          <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
                <Target className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-semibold tracking-tight">AI Role Adaptation</h2>
                <p className="text-xs text-muted-foreground">Tailor your resume for any job description</p>
              </div>
            </div>

            <Separator />

            {/* Target Role Dropdown */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Target Position</Label>
              <Select value={currentSelectValue} onValueChange={handleRoleChange}>
                <SelectTrigger className="w-full h-9 text-xs">
                  <SelectValue placeholder="Select target role" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_ROLES.map((r) => (
                    <SelectItem key={r} value={r} className="text-xs">
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {isCustom && (
                <Input
                  placeholder="Type custom role (e.g. Data Engineer, DevOps)..."
                  value={customRole}
                  onChange={(e) => {
                    setCustomRole(e.target.value);
                    setRole(e.target.value);
                  }}
                  className="text-xs h-8"
                />
              )}
            </div>

            {/* JD Quick Preset Buttons */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground">Quick Role Presets</Label>
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(JD_PRESETS).map((presetKey) => (
                  <Button
                    key={presetKey}
                    variant="outline"
                    size="sm"
                    onClick={() => applyPreset(presetKey)}
                    className="h-7 gap-1 text-[11px] px-2.5 hover:border-primary"
                  >
                    <Wand2 className="h-3 w-3 text-primary" />
                    {presetKey}
                  </Button>
                ))}
              </div>
            </div>

            {/* JD Text Area */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Job Description</Label>
                {jobDescription && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setJobDescription('')}
                    className="h-6 gap-1 text-[11px] text-muted-foreground hover:text-foreground"
                  >
                    <Eraser className="h-3 w-3" />
                    Clear
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="Paste the target job description here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="min-h-[160px] resize-y text-xs font-sans leading-relaxed"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</span>
                {jobDescription.trim().length > 0 && (
                  <Badge variant="secondary" className="text-[10px] bg-primary/10 text-primary">
                    Ready to Optimize
                  </Badge>
                )}
              </div>
            </div>

            {/* Tailor Button */}
            <Button
              onClick={onTailor}
              disabled={loading || !role || !jobDescription.trim()}
              className="w-full gap-2 py-5 text-sm font-semibold shadow-md shadow-primary/20"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Tailoring with AI & Re-ranking...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Tailor Resume for this Role
                </>
              )}
            </Button>
          </div>
        )}

        {/* Tab 3: Real-Time ATS Score & Keyword Radar */}
        {activeTab === 'ats' && (
          <div className="space-y-4">
            <ATSScoreCard
              resume={resume}
              jobDescription={jobDescription}
              onAddSkill={handleAddSkillFromATS}
              onTailorClick={onTailor}
            />
          </div>
        )}

        {/* Tab 4: Design, Templates, Typography & Layout Studio */}
        {activeTab === 'design' && (
          <div className="space-y-5">
            {/* Template Selector */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold">ATS Resume Template</Label>
              <div className="grid grid-cols-1 gap-2">
                {TEMPLATE_OPTIONS.map((tmpl) => {
                  const isSelected = (resume.style?.template || 'harvard-ats') === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => updateStyle('template', tmpl.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                        isSelected
                          ? 'border-primary bg-primary/10 shadow-sm'
                          : 'border-border bg-card/60 hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <div className="font-semibold text-xs text-foreground flex items-center gap-1.5">
                          {tmpl.label}
                          {isSelected && <Check className="h-3.5 w-3.5 text-primary" />}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">{tmpl.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Typography Pairing */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <Type className="h-3.5 w-3.5 text-primary" /> Font Family
              </Label>
              <Select
                value={resume.style?.fontFamily || 'inter'}
                onValueChange={(val) => updateStyle('fontFamily', val as FontFamily)}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Select typography" />
                </SelectTrigger>
                <SelectContent>
                  {FONT_OPTIONS.map((f) => (
                    <SelectItem key={f.id} value={f.id} className="text-xs">
                      {f.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Size Scaling */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Font Size Scale</Label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'sm', label: 'Compact (8pt)' },
                  { id: 'base', label: 'Standard (8.5pt)' },
                  { id: 'lg', label: 'Large (9pt)' },
                ].map((s) => {
                  const isSelected = (resume.style?.fontSizeScale || 'base') === s.id;
                  return (
                    <Button
                      key={s.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStyle('fontSizeScale', s.id as FontSizeScale)}
                      className="h-7 text-xs"
                    >
                      {s.label}
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Bullet Style Picker */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold flex items-center gap-1.5">
                <List className="h-3.5 w-3.5 text-primary" /> Bullet Point Style
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'disc', symbol: '•', label: 'Disc' },
                  { id: 'dash', symbol: '–', label: 'Dash' },
                  { id: 'square', symbol: '▪', label: 'Square' },
                  { id: 'circle', symbol: '◦', label: 'Circle' },
                ].map((b) => {
                  const isSelected = (resume.style?.bulletStyle || 'disc') === b.id;
                  return (
                    <Button
                      key={b.id}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStyle('bulletStyle', b.id as BulletStyle)}
                      className="h-7 text-xs gap-1"
                    >
                      <span className="font-bold">{b.symbol}</span>
                      <span>{b.label}</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Auto-Bold Keywords & Metrics */}
            <div className="flex items-center justify-between rounded-lg border border-border bg-card/40 p-3">
              <div className="space-y-0.5">
                <Label className="text-xs font-semibold flex items-center gap-1.5">
                  <Bold className="h-3.5 w-3.5 text-primary" /> Auto-Bold Impact Metrics
                </Label>
                <p className="text-[11px] text-muted-foreground">
                  Bolds percentages, metrics, and technical quantities in bullet points
                </p>
              </div>
              <Switch
                checked={resume.style?.boldKeywords ?? false}
                onCheckedChange={(val) => updateStyle('boldKeywords', val)}
              />
            </div>

            <Separator />

            {/* Accent Color Palette & Custom Color Picker */}
            <div className="space-y-2.5">
              <Label className="text-xs font-semibold">Theme Accent Color</Label>
              <div className="flex items-center gap-2 flex-wrap">
                {COLOR_OPTIONS.map((c) => {
                  const isSelected = (resume.style?.accentColor || 'slate') === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        updateStyle('accentColor', c.id);
                        updateStyle('customColor', undefined);
                      }}
                      className={`h-7 w-7 rounded-full ${c.bg} transition-transform flex items-center justify-center ${
                        isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110' : 'hover:scale-105'
                      }`}
                      title={c.label}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5 text-white" />}
                    </button>
                  );
                })}

                {/* Custom Color Input */}
                <div className="flex items-center gap-1.5 ml-1">
                  <input
                    type="color"
                    value={resume.style?.customColor || '#0f172a'}
                    onChange={(e) => {
                      updateStyle('customColor', e.target.value);
                    }}
                    className="h-7 w-7 rounded cursor-pointer border border-border bg-transparent p-0"
                    title="Custom Hex Color"
                  />
                  <span className="text-[10px] text-muted-foreground">Custom</span>
                </div>
              </div>
            </div>

            {/* Spacing Density */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Page Margin & Spacing Density</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['compact', 'standard', 'relaxed'] as SpacingDensity[]).map((d) => {
                  const isSelected = (resume.style?.density || 'standard') === d;
                  return (
                    <Button
                      key={d}
                      variant={isSelected ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateStyle('density', d)}
                      className="h-7 text-xs capitalize"
                    >
                      {d}
                    </Button>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Section Reordering (Including Custom Sections) */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Section Order on Document</Label>
              <div className="space-y-1.5">
                {sectionOrder.map((id, index) => (
                  <div
                    key={id}
                    className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-1.5"
                  >
                    <span className="text-xs font-medium truncate">{getSectionLabel(id)}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === 0}
                        onClick={() => onMoveSection(id, 'up')}
                      >
                        <ArrowUp className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        disabled={index === sectionOrder.length - 1}
                        onClick={() => onMoveSection(id, 'down')}
                      >
                        <ArrowDown className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Visibility */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold">Project Visibility</Label>
              <div className="space-y-1.5">
                {resume.projects.map((p, i) => (
                  <div
                    key={p.name + i}
                    className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-1.5"
                  >
                    <div className="flex items-center gap-2 truncate max-w-[200px]">
                      {p.visible !== false ? (
                        <Eye className="h-3.5 w-3.5 text-primary shrink-0" />
                      ) : (
                        <EyeOff className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                      )}
                      <span className="text-xs truncate">{p.name}</span>
                    </div>
                    <Switch checked={p.visible !== false} onCheckedChange={() => onToggleProject(i)} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
