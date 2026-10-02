// Dynamically load PDF.js script & configure worker from CDN client-side
let pdfjsPromise: Promise<any> | null = null;

export function loadPdfJs(): Promise<any> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Cannot load PDF.js in SSR environment'));
  }

  // @ts-expect-error window injection
  if (window.pdfjsLib) {
    // @ts-expect-error window injection
    return Promise.resolve(window.pdfjsLib);
  }

  if (pdfjsPromise) {
    return pdfjsPromise;
  }

  pdfjsPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.onload = () => {
      // @ts-expect-error window injection
      const pdfjs = window.pdfjsLib;
      if (pdfjs) {
        pdfjs.GlobalWorkerOptions.workerSrc =
          'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
        resolve(pdfjs);
      } else {
        reject(new Error('PDF.js failed to initialize'));
      }
    };
    script.onerror = () => {
      pdfjsPromise = null;
      reject(new Error('Failed to load PDF.js script from CDN'));
    };
    document.head.appendChild(script);
  });

  return pdfjsPromise;
}
