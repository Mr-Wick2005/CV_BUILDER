import type { OriginalDocument } from './types';

const DB_NAME = 'cvadapt_pdf_db';
const DB_VERSION = 1;
const STORE_DOCS = 'original_documents';
const STORE_BLOBS = 'original_blobs';

// Open / initialize IndexedDB
function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_DOCS)) {
        db.createObjectStore(STORE_DOCS, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(STORE_BLOBS)) {
        db.createObjectStore(STORE_BLOBS, { keyPath: 'id' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Failed to open IndexedDB'));
  });
}

// Compute SHA-256 hex string from an ArrayBuffer
export async function computeSha256(buffer: ArrayBuffer): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(digest));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
  // Simple fallback hash if crypto.subtle is unavailable
  return `hash-${Date.now()}-${buffer.byteLength}`;
}

export interface StoredDocumentPayload {
  meta: OriginalDocument;
  blob: Blob;
}

// Save original PDF document and its exact raw bytes
export async function saveOriginalDocument(
  meta: OriginalDocument,
  blobOrBuffer: Blob | ArrayBuffer
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_BLOBS], 'readwrite');
    const docsStore = tx.objectStore(STORE_DOCS);
    const blobsStore = tx.objectStore(STORE_BLOBS);

    const blob = blobOrBuffer instanceof Blob ? blobOrBuffer : new Blob([blobOrBuffer], { type: 'application/pdf' });

    // Store metadata (immutable record)
    docsStore.put(meta);

    // Store binary blob under blobRef key
    blobsStore.put({ id: meta.blobRef, blob });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error || new Error('Failed to save document to IndexedDB'));
  });
}

// Retrieve original document metadata and raw Blob
export async function getOriginalDocument(id: string): Promise<StoredDocumentPayload | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_BLOBS], 'readonly');
    const docsStore = tx.objectStore(STORE_DOCS);
    const blobsStore = tx.objectStore(STORE_BLOBS);

    const docReq = docsStore.get(id);

    docReq.onsuccess = () => {
      const meta = docReq.result as OriginalDocument | undefined;
      if (!meta) {
        resolve(null);
        return;
      }

      const blobReq = blobsStore.get(meta.blobRef);
      blobReq.onsuccess = () => {
        const blobRecord = blobReq.result as { id: string; blob: Blob } | undefined;
        if (!blobRecord || !blobRecord.blob) {
          resolve(null);
          return;
        }
        resolve({ meta, blob: blobRecord.blob });
      };
      blobReq.onerror = () => reject(blobReq.error);
    };

    docReq.onerror = () => reject(docReq.error);
  });
}

// Retrieve just the metadata for an original document
export async function getOriginalDocumentMeta(id: string): Promise<OriginalDocument | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_DOCS, 'readonly');
    const docsStore = tx.objectStore(STORE_DOCS);
    const docReq = docsStore.get(id);

    docReq.onsuccess = () => resolve((docReq.result as OriginalDocument) || null);
    docReq.onerror = () => reject(docReq.error);
  });
}

// Delete original document and associated blob
export async function deleteOriginalDocument(id: string): Promise<void> {
  const db = await openDb();
  const meta = await getOriginalDocumentMeta(id);
  if (!meta) return;

  return new Promise((resolve, reject) => {
    const tx = db.transaction([STORE_DOCS, STORE_BLOBS], 'readwrite');
    tx.objectStore(STORE_DOCS).delete(id);
    tx.objectStore(STORE_BLOBS).delete(meta.blobRef);

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}
