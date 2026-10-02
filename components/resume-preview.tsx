'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  Download,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize,
  Check,
  FileSignature,
  FileCode,
  FileJson,
  ShieldCheck,
  FileText,
  Sparkles,
  FileCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { ResumeDocument } from './resume-document';
import { PdfViewer } from './pdf-viewer';
import { resumeToPlainText, resumeToMarkdown } from '@/lib/tailor';
import type { ResumeData, OriginalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ResumePreviewProps {
  resume: ResumeData;
  sectionOrder: string[];
  originalDoc?: OriginalDocument | null;
  originalBlob?: Blob | null;
  previewMode?: 'original' | 'editable';
  onTogglePreviewMode?: (mode: 'original' | 'editable') => void;
  onOpenCoverLetter: () => void;
}

export function ResumePreview({
  resume,
  sectionOrder,
  originalDoc,
  originalBlob,
  previewMode = 'editable',
  onTogglePreviewMode,
  onOpenCoverLetter,
}: ResumePreviewProps) {
  const [zoom, setZoom] = useState(0.85);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const isOriginalMode = previewMode === 'original' && Boolean(originalDoc && originalBlob);

  // Auto-adjust zoom on initial load for optimal viewport fit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 768) {
        setZoom(0.55);
      } else if (window.innerWidth < 1200) {
        setZoom(0.75);
      } else {
        setZoom(0.85);
      }
    }
  }, []);

  const zoomIn = () => setZoom((z) => Math.min(Number((z + 0.1).toFixed(2)), 1.5));
  const zoomOut = () => setZoom((z) => Math.max(Number((z - 0.1).toFixed(2)), 0.45));
  const setExactZoom = (val: number) => setZoom(val);

  // Download exact unmodified original binary file (byte-identical)
  const handleDownloadOriginal = useCallback(() => {
    if (!originalBlob || !originalDoc) return;
    const url = URL.createObjectURL(originalBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = originalDoc.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast({
      title: 'Downloaded Original PDF',
      description: `Exact original "${originalDoc.fileName}" downloaded (byte-identical).`,
    });
  }, [originalBlob, originalDoc, toast]);

  // Download / Print edited version
  const handleDownloadPdf = useCallback(() => {
    if (isOriginalMode && originalBlob && originalDoc) {
      handleDownloadOriginal();
      return;
    }

    const originalTitle = document.title;
    const candidateName = (resume.contact.name || 'Resume').replace(/[^a-zA-Z0-9_-]/g, '_');
    const versionLabel = (resume.versionLabel || 'Edited').replace(/[^a-zA-Z0-9_-]/g, '_');
    document.title = `${candidateName}_${versionLabel}`;

    window.print();

    // Restore title after print dialog
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  }, [isOriginalMode, originalBlob, originalDoc, handleDownloadOriginal, resume]);

  const handleCopyText = useCallback(async () => {
    const text = resumeToPlainText(resume);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Copied to Clipboard', description: 'Plain-text resume ready for job portal applications.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Could not access clipboard.', variant: 'destructive' });
    }
  }, [resume, toast]);

  const handleCopyMarkdown = useCallback(async () => {
    const md = resumeToMarkdown(resume);
    try {
      await navigator.clipboard.writeText(md);
      toast({ title: 'Copied Markdown', description: 'Markdown resume copied to clipboard.' });
    } catch {
      toast({ title: 'Copy failed', description: 'Could not access clipboard.', variant: 'destructive' });
    }
  }, [resume, toast]);

  const handleDownloadJson = useCallback(() => {
    const jsonStr = JSON.stringify(resume, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(resume.contact.name || 'resume').toLowerCase().replace(/\s+/g, '_')}_backup.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: 'Backup Downloaded', description: 'Your JSON resume backup was saved.' });
  }, [resume, toast]);

  return (
    <div className="flex h-full flex-col bg-slate-950/90 relative select-none">
      {/* Top Preview Studio Toolbar */}
      <div className="no-print flex items-center justify-between gap-2 border-b border-border/80 bg-card/85 px-4 py-2 backdrop-blur z-10 flex-wrap sm:flex-nowrap">
        {/* Left Actions */}
        <div className="flex items-center gap-2">
          {isOriginalMode ? (
            <Button
              onClick={handleDownloadOriginal}
              size="sm"
              className="gap-1.5 h-8 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm shadow-emerald-600/20"
            >
              <Download className="h-3.5 w-3.5" />
              Download Original
            </Button>
          ) : (
            <Button
              onClick={handleDownloadPdf}
              size="sm"
              className="gap-1.5 h-8 text-xs font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm shadow-primary/20"
            >
              <Download className="h-3.5 w-3.5" />
              Download PDF
            </Button>
          )}

          <Button
            onClick={onOpenCoverLetter}
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs bg-secondary/30 hover:bg-secondary/60"
          >
            <FileSignature className="h-3.5 w-3.5 text-primary" />
            Cover Letter
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5 h-8 text-xs bg-secondary/30 hover:bg-secondary/60">
                <Copy className="h-3.5 w-3.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56 bg-card border-border">
              <DropdownMenuLabel className="text-xs">Export & Backup</DropdownMenuLabel>
              {originalDoc && (
                <>
                  <DropdownMenuItem onClick={handleDownloadOriginal} className="text-xs gap-2 cursor-pointer font-medium text-emerald-400">
                    <Download className="h-3.5 w-3.5 text-emerald-400" />
                    Download Original PDF ({originalDoc.fileName})
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem onClick={handleCopyText} className="text-xs gap-2 cursor-pointer">
                {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
                Copy Plain Text (ATS)
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCopyMarkdown} className="text-xs gap-2 cursor-pointer">
                <FileCode className="h-3.5 w-3.5 text-primary" />
                Copy as Markdown
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDownloadJson} className="text-xs gap-2 cursor-pointer">
                <FileJson className="h-3.5 w-3.5 text-amber-500" />
                Download JSON Backup
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Center: View Switcher (Original PDF vs Editable Version) & Status */}
        <div className="flex items-center gap-2">
          {originalDoc && onTogglePreviewMode && (
            <div className="flex items-center rounded-lg border border-border bg-card/60 p-0.5 shadow-inner">
              <Button
                variant={isOriginalMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTogglePreviewMode('original')}
                className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                  isOriginalMode
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <FileCheck className="h-3.5 w-3.5" />
                <span>Original PDF</span>
              </Button>
              <Button
                variant={!isOriginalMode ? 'default' : 'ghost'}
                size="sm"
                onClick={() => onTogglePreviewMode('editable')}
                className={`h-7 px-2.5 text-xs gap-1.5 transition-all ${
                  !isOriginalMode
                    ? 'bg-primary hover:bg-primary/90 text-primary-foreground font-semibold'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Editable Version</span>
                {resume.isDirty && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-pulse" />
                )}
              </Button>
            </div>
          )}

          {/* Verification Badge */}
          {!originalDoc && (
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground bg-primary/10 border border-primary/20 px-2.5 py-1 rounded-full">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              <span className="font-semibold text-primary text-[11px]">ATS Verified</span>
              <span className="text-[10px] text-muted-foreground">• 1-Page A4 Calibrated</span>
            </div>
          )}
        </div>

        {/* Right Zoom Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 text-xs px-2 text-muted-foreground hover:text-foreground">
                {Math.round(zoom * 100)}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-32 bg-card border-border">
              <DropdownMenuItem onClick={() => setExactZoom(0.6)} className="text-xs cursor-pointer">60%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExactZoom(0.75)} className="text-xs cursor-pointer">75%</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExactZoom(0.85)} className="text-xs cursor-pointer">85% (Optimal)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExactZoom(1.0)} className="text-xs cursor-pointer">100% (Actual)</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setExactZoom(1.25)} className="text-xs cursor-pointer">125%</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center rounded-md border border-border bg-card/60 p-0.5">
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomOut}
              disabled={zoom <= 0.45}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Zoom out"
            >
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={zoomIn}
              disabled={zoom >= 1.5}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Zoom in"
            >
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setExactZoom(0.85)}
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              title="Fit standard view (85%)"
            >
              <Maximize className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Interactive A4 Document Workspace Canvas */}
      <div className="app-scroll flex-1 overflow-auto p-4 sm:p-8 flex justify-center items-start bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px]">
        {isOriginalMode ? (
          <div className="my-2">
            <PdfViewer
              blob={originalBlob ?? null}
              fileName={originalDoc?.fileName}
              zoom={zoom}
            />
          </div>
        ) : (
          <div
            className="print-area transition-transform duration-150 ease-out my-2"
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'top center',
            }}
          >
            <ResumeDocument resume={resume} sectionOrder={sectionOrder} />
          </div>
        )}
      </div>
    </div>
  );
}
