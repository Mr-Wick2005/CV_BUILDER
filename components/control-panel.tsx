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
} from 'lucide-react';
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
import type { ResumeData, TargetRole } from '@/lib/types';

interface ControlPanelProps {
  role: string;
  setRole: (r: string) => void;
  jobDescription: string;
  setJobDescription: (jd: string) => void;
  onTailor: () => void;
  loading: boolean;
  resume: ResumeData;
  onToggleProject: (index: number) => void;
  onMoveSection: (id: string, dir: 'up' | 'down') => void;
  sectionOrder: string[];
}

const SECTION_LABELS: Record<string, string> = {
  summary: 'Summary',
  skills: 'Technical Skills',
  projects: 'Projects',
  positions: 'Positions of Responsibility',
  certifications: 'Certifications',
};

const PRESET_ROLES = TARGET_ROLES.filter((r) => r !== 'Custom');

export function ControlPanel({
  role,
  setRole,
  jobDescription,
  setJobDescription,
  onTailor,
  loading,
  resume,
  onToggleProject,
  onMoveSection,
  sectionOrder,
}: ControlPanelProps) {
  const [customRole, setCustomRole] = useState('');
  const [isCustomMode, setIsCustomMode] = useState(false);

  const isCustom = isCustomMode || (role !== '' && !PRESET_ROLES.includes(role as TargetRole));
  const currentSelectValue = isCustom ? 'Custom' : (role || undefined);

  const handleRoleChange = (value: string) => {
    if (value === 'Custom') {
      setIsCustomMode(true);
      setRole(customRole);
    } else {
      setIsCustomMode(false);
      setRole(value);
    }
  };

  const applyPreset = (presetRole: string) => {
    const jd = JD_PRESETS[presetRole];
    if (jd) {
      setJobDescription(jd);
      setIsCustomMode(false);
      if (presetRole === 'Project Manager') {
        setRole('Project / Product Manager');
      } else if (presetRole === 'Software Tester') {
        setRole('Software Tester / QA');
      } else {
        setRole(presetRole);
      }
    }
  };

  return (
    <div className="flex h-full flex-col gap-5 overflow-y-auto app-scroll p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/15 text-primary">
          <Target className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Target Role Adaptation</h2>
          <p className="text-sm text-muted-foreground">Tailor your resume for any job</p>
        </div>
      </div>

      <Separator />

      {/* Target Role Dropdown */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Target Role</Label>
        <Select value={currentSelectValue} onValueChange={handleRoleChange}>
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Select a target role" />
          </SelectTrigger>
          <SelectContent>
            {TARGET_ROLES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {isCustom && (
          <Input
            placeholder="Type your custom role (e.g. DevOps Engineer)..."
            value={customRole}
            onChange={(e) => {
              setCustomRole(e.target.value);
              setRole(e.target.value);
            }}
          />
        )}
      </div>

      {/* JD Preset Buttons */}
      <div className="space-y-2">
        <Label className="text-sm font-medium">Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {Object.keys(JD_PRESETS).map((preset) => (
            <Button
              key={preset}
              variant="outline"
              size="sm"
              onClick={() => applyPreset(preset)}
              className="h-8 gap-1.5 text-xs"
            >
              <Wand2 className="h-3 w-3" />
              {preset}
            </Button>
          ))}
        </div>
      </div>

      {/* JD Text Area */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Target Job Description</Label>
          {jobDescription && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setJobDescription('')}
              className="h-7 gap-1.5 text-xs text-muted-foreground"
            >
              <Eraser className="h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
        <Textarea
          placeholder="Paste the job description here, or use a quick preset above..."
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          className="min-h-[160px] resize-y text-sm leading-relaxed"
        />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{jobDescription.trim().split(/\s+/).filter(Boolean).length} words</span>
          {jobDescription.trim().length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Ready to tailor
            </Badge>
          )}
        </div>
      </div>

      {/* Tailor Button */}
      <Button
        onClick={onTailor}
        disabled={loading || !role || !jobDescription.trim()}
        className="w-full gap-2"
        size="lg"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Tailoring with AI...
          </>
        ) : (
          <>
            <Sparkles className="h-4 w-4" />
            Tailor Resume with AI
          </>
        )}
      </Button>

      <Separator />

      {/* Quick Toggles */}
      <div className="space-y-3">
        <Label className="text-sm font-medium">Quick Toggles</Label>

        {/* Section reordering */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Reorder sections</p>
          {sectionOrder.map((id, index) => (
            <div
              key={id}
              className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2"
            >
              <span className="text-sm">{SECTION_LABELS[id] || id}</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === 0}
                  onClick={() => onMoveSection(id, 'up')}
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  disabled={index === sectionOrder.length - 1}
                  onClick={() => onMoveSection(id, 'down')}
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Project visibility */}
        <div className="space-y-1.5">
          <p className="text-xs text-muted-foreground">Toggle project visibility</p>
          {resume.projects.map((p, i) => (
            <div
              key={p.name}
              className="flex items-center justify-between rounded-md border border-border bg-card/50 px-3 py-2"
            >
              <div className="flex items-center gap-2">
                {p.visible ? (
                  <Eye className="h-3.5 w-3.5 text-primary" />
                ) : (
                  <EyeOff className="h-3.5 w-3.5 text-muted-foreground" />
                )}
                <span className="text-sm">{p.name}</span>
              </div>
              <Switch checked={p.visible} onCheckedChange={() => onToggleProject(i)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
