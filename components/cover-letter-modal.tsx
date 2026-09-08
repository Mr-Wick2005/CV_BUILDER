'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Download, Sparkles, Loader2, Check, FileSignature } from 'lucide-react';
import type { ResumeData } from '@/lib/types';
import { getUserApiKey } from '@/lib/storage';
import { useToast } from '@/hooks/use-toast';

interface CoverLetterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  resume: ResumeData;
  targetRole: string;
  jobDescription: string;
}

export function CoverLetterModal({
  open,
  onOpenChange,
  resume,
  targetRole,
  jobDescription,
}: CoverLetterModalProps) {
  const [company, setCompany] = useState('');
  const [coverLetterText, setCoverLetterText] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/generate-cover-letter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resume,
          role: targetRole || 'Software Engineer',
          company: company.trim() || 'Hiring Team',
          jobDescription,
          userApiKey,
        }),
      });

      if (!res.ok) throw new Error('Generation failed');

      const data = await res.json();
      setCoverLetterText(data.coverLetter);
      toast({
        title: 'Cover Letter Generated',
        description: `Tailored for ${targetRole} at ${company || 'your target company'}.`,
      });
    } catch {
      toast({
        title: 'Generation error',
        description: 'Could not generate cover letter. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(coverLetterText);
      setCopied(true);
      toast({ title: 'Copied to clipboard', description: 'Cover letter is ready to paste.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Copy failed', description: 'Could not access clipboard.', variant: 'destructive' });
    }
  };

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;
    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cover Letter - ${resume.contact.name}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              font-size: 11pt;
              line-height: 1.6;
              color: #111;
              max-width: 750px;
              margin: 40px auto;
              padding: 20px;
              white-space: pre-wrap;
            }
            @media print {
              body { margin: 0; padding: 20mm; }
            }
          </style>
        </head>
        <body>${coverLetterText}</body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    setTimeout(() => {
      printWin.print();
    }, 250);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border sm:max-h-[88vh] overflow-y-auto app-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileSignature className="h-5 w-5 text-primary" />
            AI Cover Letter Generator
          </DialogTitle>
          <DialogDescription>
            Instantly craft a personalized, ATS-aligned cover letter matching your tailored resume and the target role.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Target Role</Label>
              <Input
                value={targetRole || 'Software Engineer'}
                disabled
                className="text-xs bg-muted/40"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Company / Organization Name</Label>
              <Input
                placeholder="e.g. Google, Stripe, Tesla..."
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {!coverLetterText && (
            <Button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full gap-2 py-6 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Drafting Personalized Letter with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Generate Tailored Cover Letter
                </>
              )}
            </Button>
          )}

          {coverLetterText && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold">Editable Cover Letter</Label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="h-7 text-xs gap-1"
                  >
                    <Sparkles className="h-3 w-3" /> Regenerate
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 text-xs gap-1"
                  >
                    {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                  <Button size="sm" onClick={handlePrint} className="h-7 text-xs gap-1">
                    <Download className="h-3 w-3" /> Print / PDF
                  </Button>
                </div>
              </div>

              <Textarea
                value={coverLetterText}
                onChange={(e) => setCoverLetterText(e.target.value)}
                className="min-h-[320px] text-xs font-sans leading-relaxed resize-y"
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
