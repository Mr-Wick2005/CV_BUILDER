'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, AlertCircle, ExternalLink } from 'lucide-react';
import { loadPdfJs } from '@/lib/pdf-loader';

interface PdfViewerProps {
  blob: Blob | null;
  fileName?: string;
  zoom?: number;
}

interface PageAnnotation {
  url: string;
  left: number;
  top: number;
  width: number;
  height: number;
}

interface RenderedPageData {
  pageNumber: number;
  width: number;
  height: number;
  annotations: PageAnnotation[];
}

export function PdfViewer({ blob, fileName, zoom = 0.85 }: PdfViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<RenderedPageData[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());
  const activeRenderTasks = useRef<any[]>([]);

  useEffect(() => {
    if (!blob) {
      setLoading(false);
      setError('No PDF document loaded');
      return;
    }

    let isMounted = true;
    setLoading(true);
    setError(null);

    // Cancel any previous in-flight render tasks
    activeRenderTasks.current.forEach((task) => {
      try {
        task.cancel();
      } catch {
        // ignore
      }
    });
    activeRenderTasks.current = [];

    const renderPdf = async () => {
      try {
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await blob.arrayBuffer();

        if (!isMounted) return;

        const loadingTask = pdfjs.getDocument({ data: new Uint8Array(arrayBuffer) });
        const pdf = await loadingTask.promise;

        if (!isMounted) return;

        const pagesData: RenderedPageData[] = [];

        // Pre-calculate page dimensions and annotations
        // Standard A4 width in px at 96 DPI is ~794px (210mm x 297mm)
        const TARGET_A4_WIDTH = 794;

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const unscaledViewport = page.getViewport({ scale: 1.0 });
          const scale = TARGET_A4_WIDTH / unscaledViewport.width;
          const viewport = page.getViewport({ scale });

          // Extract annotations for clickable links
          const annotations = await page.getAnnotations();
          const linkAnnotations: PageAnnotation[] = [];

          for (const annot of annotations) {
            if (annot.subtype === 'Link' && annot.url) {
              const rect = viewport.convertToViewportRectangle(annot.rect);
              const left = Math.min(rect[0], rect[2]);
              const top = Math.min(rect[1], rect[3]);
              const width = Math.abs(rect[2] - rect[0]);
              const height = Math.abs(rect[3] - rect[1]);

              linkAnnotations.push({
                url: annot.url,
                left,
                top,
                width,
                height,
              });
            }
          }

          pagesData.push({
            pageNumber: i,
            width: viewport.width,
            height: viewport.height,
            annotations: linkAnnotations,
          });
        }

        if (!isMounted) return;
        setPages(pagesData);
        setLoading(false);

        // Wait for React to mount canvas elements into DOM, then render
        setTimeout(async () => {
          if (!isMounted) return;
          const dpr = window.devicePixelRatio || 1.5;

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const unscaledViewport = page.getViewport({ scale: 1.0 });
            const scale = TARGET_A4_WIDTH / unscaledViewport.width;
            const viewport = page.getViewport({ scale });
            const canvas = canvasRefs.current.get(i);

            if (canvas && isMounted) {
              const context = canvas.getContext('2d', { alpha: false });
              if (context) {
                // High-DPI scale for crisp rendering
                canvas.width = Math.floor(viewport.width * dpr);
                canvas.height = Math.floor(viewport.height * dpr);
                canvas.style.width = `${viewport.width}px`;
                canvas.style.height = `${viewport.height}px`;

                const transform = dpr !== 1 ? [dpr, 0, 0, dpr, 0, 0] : undefined;

                const renderContext = {
                  canvasContext: context,
                  transform,
                  viewport,
                };

                const renderTask = page.render(renderContext);
                activeRenderTasks.current.push(renderTask);
                try {
                  await renderTask.promise;
                } catch (renderErr: any) {
                  if (renderErr?.name !== 'RenderingCancelledException') {
                    console.error('PDF page render error:', renderErr);
                  }
                }
              }
            }
          }
        }, 50);
      } catch (err: any) {
        if (isMounted) {
          console.error('Failed to load/render PDF:', err);
          setError(err?.message || 'Failed to render PDF document');
          setLoading(false);
        }
      }
    };

    renderPdf();

    return () => {
      isMounted = false;
      activeRenderTasks.current.forEach((task) => {
        try {
          task.cancel();
        } catch {
          // ignore
        }
      });
      activeRenderTasks.current = [];
    };
  }, [blob]);

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-card rounded-xl border border-border shadow-md max-w-md my-8">
        <AlertCircle className="h-10 w-10 text-rose-500 mb-3" />
        <h4 className="text-sm font-semibold text-foreground">Unable to preview original PDF</h4>
        <p className="text-xs text-muted-foreground mt-1 mb-4">{error}</p>
        <p className="text-xs text-muted-foreground">
          You can still download the original file or switch to the editable version.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="pdf-document-container flex flex-col items-center gap-6"
      style={{
        transform: `scale(${zoom})`,
        transformOrigin: 'top center',
        transition: 'transform 150ms ease-out',
      }}
    >
      {loading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-lg shadow-xl border border-slate-200 min-w-[794px] min-h-[1123px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
          <p className="text-sm font-medium text-slate-700">Rendering high-fidelity original PDF...</p>
          {fileName && <p className="text-xs text-slate-500 mt-1">{fileName}</p>}
        </div>
      )}

      {pages.map((p) => (
        <div
          key={p.pageNumber}
          className="relative bg-white shadow-2xl rounded-sm overflow-hidden"
          style={{
            width: `${p.width}px`,
            height: `${p.height}px`,
          }}
        >
          {/* PDF Page Canvas */}
          <canvas
            ref={(el) => {
              if (el) canvasRefs.current.set(p.pageNumber, el);
              else canvasRefs.current.delete(p.pageNumber);
            }}
            className="block"
          />

          {/* Interactive Clickable Link Layer */}
          <div className="absolute inset-0 pointer-events-none">
            {p.annotations.map((annot, aIdx) => (
              <a
                key={aIdx}
                href={annot.url}
                target="_blank"
                rel="noreferrer"
                title={`Open link: ${annot.url}`}
                className="absolute pointer-events-auto cursor-pointer hover:bg-blue-500/15 border border-transparent hover:border-blue-400/40 rounded transition-colors"
                style={{
                  left: `${annot.left}px`,
                  top: `${annot.top}px`,
                  width: `${annot.width}px`,
                  height: `${annot.height}px`,
                }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
