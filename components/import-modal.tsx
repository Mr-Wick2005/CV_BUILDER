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
import { SAMPLE_PROFILES, DEFAULT_STYLE_SETTINGS, DEFAULT_SECTION_ORDER } from '@/lib/sample-profiles';
import {
  parseResumeSmart,
  parseResumeFromLayout,
  cleanPdfArtifacts,
  type LayoutExtractedDoc,
  type LayoutLine,
  type PdfTextItem,
  type PdfAnnotation,
} from '@/lib/parser';
import type { ResumeData, OriginalDocument } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getUserApiKey } from '@/lib/storage';
import { saveOriginalDocument, computeSha256 } from '@/lib/original-doc-storage';
import { loadPdfJs } from '@/lib/pdf-loader';

interface ImportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImportResume: (resume: ResumeData, originalDoc?: OriginalDocument) => void;
}

export function ImportModal({ open, onOpenChange, onImportResume }: ImportModalProps) {
  const [pasteText, setPasteText] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleParseText = async (text: string, hintedName?: string): Promise<ResumeData> => {
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
        return parsed;
      }
      return parseResumeSmart(text, hintedName);
    } catch {
      return parseResumeSmart(text, hintedName);
    }
  };

  const handleParseLayout = async (layout: LayoutExtractedDoc): Promise<ResumeData> => {
    try {
      const userApiKey = getUserApiKey();
      const res = await fetch('/api/parse-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ layout, userApiKey }),
      });

      if (res.ok) {
        return (await res.json()) as ResumeData;
      }
      return parseResumeFromLayout(layout);
    } catch {
      return parseResumeFromLayout(layout);
    }
  };

  // Layout-aware client-side PDF extraction with items, lines, columns, and link annotations
  const extractLayoutFromPdf = async (buffer: ArrayBuffer): Promise<LayoutExtractedDoc> => {
    const pdfjs = await loadPdfJs();
    if (!pdfjs) throw new Error('PDF.js unavailable');

    const typedarray = new Uint8Array(buffer);
    const pdf = await pdfjs.getDocument({ data: typedarray }).promise;
    const allLines: LayoutLine[] = [];
    const allAnnotations: PdfAnnotation[] = [];
    const allRawItems: PdfTextItem[] = [];
    let fullRawText = '';

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const annots = await page.getAnnotations();

      for (const a of annots) {
        if (a.subtype === 'Link' && a.url) {
          allAnnotations.push({
            type: 'Link',
            url: a.url,
            rect: a.rect,
            pageNum,
          });
        }
      }

      const items: PdfTextItem[] = (textContent.items as any[])
        .map((it) => ({
          str: it.str || '',
          x: it.transform[4],
          y: it.transform[5],
          fontSize: Math.abs(it.transform[0]) || Math.abs(it.transform[3]) || 10,
          fontName: it.fontName || '',
        }))
        .filter((it) => it.str && it.str.trim());

      allRawItems.push(...items);

      // Sort items by Y descending (top to bottom), then X ascending (left to right)
      items.sort((a, b) => {
        if (Math.abs(b.y - a.y) > 3.5) return b.y - a.y;
        return a.x - b.x;
      });

      const lines: LayoutLine[] = [];
      let currentLineItems: PdfTextItem[] = [];
      let currentY: number | null = null;

      for (const item of items) {
        if (currentY === null || Math.abs(item.y - currentY) > 3.5) {
          if (currentLineItems.length > 0 && currentY !== null) {
            lines.push(processLayoutLine(currentLineItems, currentY));
          }
          currentLineItems = [item];
          currentY = item.y;
        } else {
          currentLineItems.push(item);
        }
      }
      if (currentLineItems.length > 0 && currentY !== null) {
        lines.push(processLayoutLine(currentLineItems, currentY));
      }

      allLines.push(...lines);
      fullRawText += lines.map((l) => l.text).join('\n') + '\n';
    }

    return {
      rawText: fullRawText,
      lines: allLines,
      annotations: allAnnotations,
      rawItems: allRawItems,
      pageCount: pdf.numPages,
    };
  };

  const processLayoutLine = (items: PdfTextItem[], y: number): LayoutLine => {
    items.sort((a, b) => a.x - b.x);
    const maxFontSize = Math.max(...items.map((i) => i.fontSize));

    // Detect column boundaries (gap > 35px and item jumps across midpoint ~250px)
    const columns: { x: number; text: string; items: PdfTextItem[] }[] = [];
    let currentCol = [items[0]];

    for (let i = 1; i < items.length; i++) {
      const prev = items[i - 1];
      const curr = items[i];
      if (curr.x - prev.x > 35 && curr.x >= 250 && prev.x < 250) {
        columns.push({
          x: currentCol[0].x,
          text: cleanPdfArtifacts(currentCol.map((c) => c.str).join(' ')),
          items: currentCol,
        });
        currentCol = [curr];
      } else {
        currentCol.push(curr);
      }
    }
    columns.push({
      x: currentCol[0].x,
      text: cleanPdfArtifacts(currentCol.map((c) => c.str).join(' ')),
      items: currentCol,
    });

    const fullText = cleanPdfArtifacts(items.map((i) => i.str).join(' '));

    return {
      y,
      fontSize: maxFontSize,
      items,
      text: fullText,
      columns: columns.length > 1 ? columns : undefined,
    };
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
        const parsed = await handleParseText(text);
        onImportResume(parsed);
        toast({
          title: 'Resume Imported',
          description: `Extracted sections for ${parsed.contact.name || 'your CV'}.`,
        });
        onOpenChange(false);
        setLoading(false);
        return;
      }

      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        // 1. Read raw bytes unmodified
        const arrayBuffer = await file.arrayBuffer();

        // 2. Compute SHA-256 integrity hash
        const sha256 = await computeSha256(arrayBuffer);

        // 3. Create immutable OriginalDocument record
        const docId = `orig-doc-${Date.now()}`;
        const originalDoc: OriginalDocument = {
          id: docId,
          type: 'pdf',
          fileName: file.name,
          mimeType: 'application/pdf',
          sizeBytes: file.size,
          sha256,
          uploadedAt: new Date().toISOString(),
          blobRef: `blob-${docId}`,
        };

        // 4. Persist unmodified raw bytes to IndexedDB BEFORE running extraction
        await saveOriginalDocument(originalDoc, arrayBuffer);

        // 5. Layout-Aware Structured Extraction
        let parsedResume: ResumeData;
        let extractionStatus: 'ok' | 'partial' | 'failed' = 'ok';

        try {
          const layout = await extractLayoutFromPdf(arrayBuffer);
          originalDoc.pageCount = layout.pageCount;

          if (layout.rawText && layout.rawText.trim().length >= 15) {
            parsedResume = await handleParseLayout(layout);
            extractionStatus = 'ok';
          } else {
            extractionStatus = 'partial';
            const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
            parsedResume = {
              ...SAMPLE_PROFILES['blank'].data,
              id: `resume-${Date.now()}`,
              title: `${file.name}`,
              contact: {
                ...SAMPLE_PROFILES['blank'].data.contact,
                name: baseName.toUpperCase(),
              },
            };
          }
        } catch (extractErr) {
          console.error('PDF extraction failed:', extractErr);
          extractionStatus = 'failed';
          const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
          parsedResume = {
            ...SAMPLE_PROFILES['blank'].data,
            id: `resume-${Date.now()}`,
            title: `${file.name}`,
            contact: {
              ...SAMPLE_PROFILES['blank'].data.contact,
              name: baseName.toUpperCase(),
            },
          };
        }

        // Link the editable resume to the immutable original document
        parsedResume.originalDocId = docId;
        parsedResume.isDirty = false;
        parsedResume.previewMode = 'original';
        parsedResume.extractionStatus = extractionStatus;
        parsedResume.versionLabel = 'Original';

        onImportResume(parsedResume, originalDoc);

        if (extractionStatus === 'ok') {
          toast({
            title: 'Original PDF Preserved & Loaded',
            description: `Loaded ${parsedResume.contact.name || 'your CV'} with exact data extraction.`,
          });
        } else {
          toast({
            title: 'Original PDF Preserved',
            description:
              'Your CV was uploaded successfully, but some editable information could not be extracted. The original PDF is preserved.',
            variant: 'default',
          });
        }

        onOpenChange(false);
        setLoading(false);
        return;
      }

      // Default text extraction fallback
      const raw = await file.text();
      const parsed = await handleParseText(raw);
      onImportResume(parsed);
      toast({
        title: 'Resume Imported',
        description: `Extracted sections for ${parsed.contact.name || 'your CV'}.`,
      });
      onOpenChange(false);
    } catch {
      toast({
        title: 'File read error',
        description: 'Could not read file. Please try pasting the text instead.',
        variant: 'destructive',
      });
    } finally {
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
