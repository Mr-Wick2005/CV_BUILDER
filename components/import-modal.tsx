'use client';

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  UploadCloud,
  FileText,
  Sparkles,
  Loader2,
  Layers,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { SAMPLE_PROFILES } from '@/lib/sample-profiles';
import { parseResumeSmart } from '@/lib/parser';
import type { ResumeData } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getUserApiKey } from '@/lib/storage';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportResume: (resume: ResumeData) => void;
}

export function ImportModal({ open, onOpenChange, onImportResume }: ImportModalProps) {
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleParseText = async (text: string, hintedName?: string) => {
    if (!text || text.trim().length < 15) {
      toast({
        title: 'Insufficient text',
        description: 'Please provide at least 15 characters of resume content.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, userApiKey }),
      });

      if (res.ok) {
        const parsed = (await res.json()) as ResumeData;
        if (hintedName && (!parsed.contact.name || parsed.contact.name === 'YOUR NAME' || parsed.contact.name.includes('UNIVERSITY'))) {
          parsed.contact.name = hintedName;
          parsed.title = `${hintedName}'s Resume`;
        }
        onImportResume(parsed);
        toast({
          title: 'Resume Imported Successfully',
          description: `Loaded ${parsed.contact.name || 'your CV'} ready for optimization.`,
        });
        onOpenChange(false);
      } else {
        const local = parseResumeSmart(text, hintedName);
        onImportResume(local);
        toast({
          title: 'Resume Imported',
          description: `Extracted sections for ${local.contact.name}.`,
        });
        onOpenChange(false);
      }
    } catch {
      const local = parseResumeSmart(text, hintedName);
      onImportResume(local);
      toast({
        title: 'Resume Imported',
        description: `Extracted sections for ${local.contact.name}.`,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  // Robust line-by-line client-side PDF text extraction with largest-font title/name detection
  const extractTextFromPdf = async (file: File): Promise<{ fullText: string; hintedName: string }> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          if (typeof window !== 'undefined') {
            // @ts-expect-error dynamic window injection
            let pdfjs = window.pdfjsLib;
            if (!pdfjs) {
              const script = document.createElement('script');
              script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
              document.head.appendChild(script);
              await new Promise((resScript) => {
                script.onload = resScript;
              });
              // @ts-expect-error dynamic window injection
              pdfjs = window.pdfjsLib;
              if (pdfjs) {
                pdfjs.GlobalWorkerOptions.workerSrc =
                  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
              }
            }

            if (pdfjs) {
              const typedarray = new Uint8Array(reader.result as ArrayBuffer);
              const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
              let fullText = '';
              let maxFontSize = 0;
              let hintedName = '';

              for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const items = textContent.items as Array<{ str: string; transform: number[]; hasEOL?: boolean }>;

                // Check for largest font item on page 1 (candidate name)
                if (i === 1) {
                  for (const it of items) {
                    const fontSize = Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 0;
                    const str = it.str.trim();
                    if (
                      fontSize > maxFontSize &&
                      str.length >= 3 &&
                      str.length <= 35 &&
                      !str.includes('@') &&
                      !str.includes('http') &&
                      !str.toLowerCase().includes('university') &&
                      !str.toLowerCase().includes('college')
                    ) {
                      maxFontSize = fontSize;
                      hintedName = str.toUpperCase();
                    }
                  }
                }

                // Sort items by Y (top to bottom) then X (left to right)
                items.sort((a, b) => {
                  const yDiff = b.transform[5] - a.transform[5];
                  if (Math.abs(yDiff) > 4) return yDiff;
                  return a.transform[4] - b.transform[4];
                });

                let lastY: number | null = null;
                const pageLines: string[] = [];
                let currentLine = '';

                for (const item of items) {
                  if (!item.str || !item.str.trim()) continue;
                  const currentY = item.transform[5];

                  if (lastY !== null && Math.abs(currentY - lastY) > 4) {
                    if (currentLine.trim()) pageLines.push(currentLine.trim());
                    currentLine = item.str.trim();
                  } else {
                    currentLine += (currentLine ? ' ' : '') + item.str.trim();
                  }
                  lastY = currentY;
                }

                if (currentLine.trim()) pageLines.push(currentLine.trim());
                fullText += pageLines.join('\n') + '\n';
              }
              resolve({ fullText, hintedName });
              return;
            }
          }
          resolve({ fullText: '', hintedName: '' });
        } catch {
          resolve({ fullText: '', hintedName: '' });
        }
      };
      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileUpload = async (file: File) => {
    setFileName(file.name);
    setLoading(true);

    try {
      if (file.name.endsWith('.json')) {
        const text = await file.text();
        const json = JSON.parse(text) as ResumeData;
        if (json.contact && json.skills) {
          onImportResume(json);
          toast({ title: 'JSON Resume Imported', description: 'Your saved resume backup was restored.' });
          onOpenChange(false);
          setLoading(false);
          return;
        }
      }

      if (file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
        const text = await file.text();
        await handleParseText(text);
        return;
      }

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        const { fullText, hintedName } = await extractTextFromPdf(file);
        if (fullText && fullText.trim().length > 20) {
          await handleParseText(fullText, hintedName);
        } else {
          toast({
            title: 'Scanned PDF detected',
            description: 'Could not extract text from this PDF. Please paste resume text directly in the Paste tab.',
            variant: 'destructive',
          });
          setLoading(false);
        }
        return;
      }

      // Default text extraction
      const raw = await file.text();
      await handleParseText(raw);
    } catch {
      toast({
        title: 'File read error',
        description: 'Could not read file. Please try pasting the text instead.',
        variant: 'destructive',
      });
      setLoading(false);
    }
  };

  const handleSelectSample = (key: string) => {
    const profile = SAMPLE_PROFILES[key];
    if (profile) {
      onImportResume(profile.data);
      toast({
        title: 'Template Loaded',
        description: `Loaded ${profile.label} template.`,
      });
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-card border-border sm:max-h-[85vh] overflow-y-auto app-scroll">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <UploadCloud className="h-5 w-5 text-primary" />
            Import / Start Resume
          </DialogTitle>
          <DialogDescription>
            Upload your existing CV (PDF / Word / TXT / JSON), paste text, or select a pre-built starter profile.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="upload" className="w-full mt-2">
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="upload" className="gap-1.5 text-xs sm:text-sm">
              <UploadCloud className="h-4 w-4" /> Upload File
            </TabsTrigger>
            <TabsTrigger value="paste" className="gap-1.5 text-xs sm:text-sm">
              <FileText className="h-4 w-4" /> Paste Text
            </TabsTrigger>
            <TabsTrigger value="templates" className="gap-1.5 text-xs sm:text-sm">
              <Layers className="h-4 w-4" /> Starter Profiles
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-4 pt-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={(e) => {
                e.preventDefault();
                setDragActive(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileUpload(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors flex flex-col items-center justify-center gap-3 ${
                dragActive
                  ? 'border-primary bg-primary/10'
                  : 'border-border hover:border-primary/50 hover:bg-card/60'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.txt,.json,.md,.docx"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileUpload(e.target.files[0]);
                  }
                }}
              />

              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                {loading ? (
                  <Loader2 className="h-7 w-7 animate-spin" />
                ) : (
                  <UploadCloud className="h-7 w-7" />
                )}
              </div>

              <div>
                <p className="text-sm font-semibold">
                  {loading ? 'Extracting & Structuring Sections with AI...' : 'Drag & drop your resume file here'}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Supports <span className="text-foreground font-medium">PDF, TXT, JSON, MD</span>
                </p>
              </div>

              {fileName && !loading && (
                <Badge variant="secondary" className="gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  {fileName}
                </Badge>
              )}

              <Button variant="outline" size="sm" type="button" disabled={loading} className="mt-2">
                Browse File on Computer
              </Button>
            </div>

            <div className="rounded-lg border border-border bg-secondary/20 p-3 text-xs text-muted-foreground flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-primary shrink-0 mt-0.5" />
              <span>
                <strong>100% Privacy Sandbox:</strong> All files are extracted directly in your browser. Your resume is never retained on any server.
              </span>
            </div>
          </TabsContent>

          {/* Paste Raw Text Tab */}
          <TabsContent value="paste" className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Paste Resume Content</label>
              <Textarea
                placeholder="Paste the raw text from your Word doc, LinkedIn profile, or Google Docs..."
                value={pasteText}
                onChange={(e) => setPasteText(e.target.value)}
                className="min-h-[220px] text-xs font-mono resize-y"
              />
            </div>

            <Button
              onClick={() => handleParseText(pasteText)}
              disabled={loading || pasteText.trim().length < 15}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Structuring with AI...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Parse & Load Resume
                </>
              )}
            </Button>
          </TabsContent>

          {/* Starter Profiles Tab */}
          <TabsContent value="templates" className="space-y-3 pt-4">
            <p className="text-xs text-muted-foreground">
              Choose a professionally curated ATS student profile to kickstart your CV:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(SAMPLE_PROFILES).map(([key, profile]) => (
                <div
                  key={key}
                  onClick={() => handleSelectSample(key)}
                  className="flex flex-col justify-between p-3.5 rounded-lg border border-border bg-card/60 hover:border-primary hover:bg-card cursor-pointer transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm group-hover:text-primary transition-colors">
                        {profile.label}
                      </span>
                      {key === 'full-stack' && (
                        <Badge variant="default" className="text-[10px] h-4">
                          Popular
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {profile.description}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm" className="mt-2 h-7 text-xs justify-start px-0 text-primary">
                    Use this profile →
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
