'use client';

import { useMemo } from 'react';
import { analyzeResumeATS } from '@/lib/ats-scorer';
import type { ResumeData } from '@/lib/types';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  CheckCircle2,
  XCircle,
  Zap,
  Target,
  BarChart3,
  Lightbulb,
  Plus,
  Sparkles,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ATSScoreCardProps {
  resume: ResumeData;
  jobDescription: string;
  onAddSkill: (skill: string) => void;
  onTailorClick: () => void;
}

export function ATSScoreCard({
  resume,
  jobDescription,
  onAddSkill,
  onTailorClick,
}: ATSScoreCardProps) {
  const { toast } = useToast();
  const analysis = useMemo(
    () => analyzeResumeATS(resume, jobDescription),
    [resume, jobDescription]
  );

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-500';
    if (score >= 70) return 'text-primary';
    if (score >= 50) return 'text-amber-500';
    return 'text-rose-500';
  };

  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-primary';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="space-y-4">
      {/* Score Header Card */}
      <div className="rounded-xl border border-border bg-card/80 p-4 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight">
                  <span className={getScoreColor(analysis.score)}>{analysis.score}</span>
                  <span className="text-muted-foreground text-sm font-normal"> / 100</span>
                </span>
                <Badge
                  variant={analysis.score >= 75 ? 'default' : 'secondary'}
                  className="text-xs font-bold"
                >
                  Grade {analysis.grade}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">ATS Job Description Compatibility</p>
            </div>
          </div>

          <Button size="sm" onClick={onTailorClick} className="gap-1.5 text-xs">
            <Sparkles className="h-3.5 w-3.5" />
            Boost Score
          </Button>
        </div>

        <div className="mt-4 space-y-1.5">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Overall Alignment</span>
            <span className="font-medium text-foreground">{analysis.score}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className={`h-full transition-all duration-500 ${getProgressColor(analysis.score)}`}
              style={{ width: `${analysis.score}%` }}
            />
          </div>
        </div>

        {/* Quick stat chips */}
        <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
          <div>
            <div className="text-sm font-bold text-foreground">{analysis.matchedKeywords.length}</div>
            <div className="text-[10px] text-muted-foreground">Keywords Matched</div>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{analysis.actionVerbCount}</div>
            <div className="text-[10px] text-muted-foreground">Action Verbs</div>
          </div>
          <div>
            <div className="text-sm font-bold text-foreground">{analysis.metricCount}</div>
            <div className="text-[10px] text-muted-foreground">Impact Metrics</div>
          </div>
        </div>
      </div>

      {/* Missing Keywords Cloud with 1-Click Add */}
      {analysis.missingKeywords.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <XCircle className="h-4 w-4 text-rose-500" />
              Missing Keywords Found in Job Description
            </div>
            <span className="text-[10px] text-muted-foreground">Click to add to skills</span>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.missingKeywords.slice(0, 12).map((kw) => (
              <Badge
                key={kw}
                variant="outline"
                onClick={() => {
                  onAddSkill(kw);
                  toast({ title: 'Skill Added', description: `Added "${kw}" to Technical Skills.` });
                }}
                className="cursor-pointer hover:border-primary hover:bg-primary/10 gap-1 text-[11px] py-0.5 transition-colors group"
              >
                <Plus className="h-2.5 w-2.5 text-muted-foreground group-hover:text-primary" />
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Matched Keywords */}
      {analysis.matchedKeywords.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2.5">
          <div className="flex items-center gap-1.5 text-xs font-semibold">
            <CheckCircle2 className="h-4 w-4 text-green-500" />
            Matched Keywords
          </div>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {analysis.matchedKeywords.slice(0, 15).map((kw) => (
              <Badge
                key={kw}
                variant="secondary"
                className="text-[11px] py-0.5 bg-green-500/10 text-green-400 border-green-500/20"
              >
                {kw}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Actionable Suggestions */}
      {analysis.suggestions.length > 0 && (
        <div className="rounded-xl border border-border bg-card/50 p-4 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
            <Lightbulb className="h-4 w-4 text-amber-400" />
            ATS Recommendations
          </div>
          <ul className="space-y-1.5 text-xs text-muted-foreground">
            {analysis.suggestions.map((sug, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-primary font-bold">•</span>
                <span>{sug}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
