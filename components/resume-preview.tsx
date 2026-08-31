'use client';

import { useState, useCallback } from 'react';
import {
  Download,
  Copy,
  ZoomIn,
  ZoomOut,
  Maximize,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResumeDocument } from './resume-document';
import { resumeToPlainText } from '@/lib/tailor';
import type { ResumeData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

interface ResumePreviewProps {
  resume: ResumeData;
  sectionOrder: string[];
}

export function ResumePreview({ resume, sectionOrder }: ResumePreviewProps) {
  const [zoom, setZoom] = useState(0.75);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const zoomIn = () => setZoom((z) => Math.min(z + 0.1, 1.5));
  const zoomOut = () => setZoom((z) => Math.max(z - 0.1, 0.4));
  const resetZoom = () => setZoom(0.75);

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  const handleCopy = useCallback(async () => {
    const text = resumeToPlainText(resume);
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Copied to clipboard', description: 'Plain-text resume ready to paste.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Could not access clipboard.', variant: 'destructive' });
    }
  }, [resume, toast]);

  return (
    <div className="flex h-full flex-col bg-secondary/30">
      {/* Toolbar */}
      <div className="no-print flex items-center justify-between gap-2 border-b border-border bg-card/80 px-4 py-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button onClick={handleDownload} size="sm" className="gap-1.5">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
          <Button onClick={handleCopy} variant="outline" size="sm" className="gap-1.5">
            {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied' : 'Copy Plain Text'}
          </Button>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={zoomOut} disabled={zoom <= 0.4} className="h-8 w-8">
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="w-12 text-center text-xs font-medium text-muted-foreground">
            {Math.round(zoom * 100)}%
          </span>
          <Button variant="ghost" size="icon" onClick={zoomIn} disabled={zoom >= 1.5} className="h-8 w-8">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={resetZoom} className="h-8 w-8" title="Reset zoom">
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="app-scroll flex-1 overflow-auto p-8 flex justify-center">
        <div
          className="print-area shadow-2xl"
          style={{
            transform: `scale(${zoom})`,
            transformOrigin: 'top center',
            transition: 'transform 0.2s ease-out',
          }}
        >
          <ResumeDocument resume={resume} sectionOrder={sectionOrder} />
        </div>
      </div>
    </div>
  );
}
