// IndexedDB home for everything offline. Two stores:
//
//   questions         the downloadable question bank (see cacheQuestions)
//   pending_attempts  the outbox: answers recorded offline that must reach
//                     the server through recordAttempt once the device is
//                     back online and a signed-in session exists
//
// Queue discipline (lib/offline-sync.ts drains it): an entry is enqueued
// with status "queued", claimed atomically (queued → syncing, one readwrite
// transaction, so two draining tabs can never both take the same entry),
// and only removed after the server confirmed the insert. A failed send
// releases the entry back to "queued"; an entry left "syncing" by a crashed
// tab is reclaimed after STALE_SYNCING_MS. Mutations dispatch a window
// "apex:offline-queue" event so the offline player can reflect the count.

// Retain the legacy DB name so downloaded questions and queued answers survive.
const DB_NAME = "cadet-prep-offline";
const DB_VERSION = 2;
const QUESTIONS_STORE = "questions";
const PENDING_STORE = "pending_attempts";
const STALE_SYNCING_MS = 60_000;

const QUEUE_EVENT = "apex:offline-queue";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        db.createObjectStore(QUESTIONS_STORE, { keyPath: "id" });
      }
      if (!db.objectStoreNames.contains(PENDING_STORE)) {
        db.createObjectStore(PENDING_STORE, { keyPath: "id" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function notifyQueueChanged() {
  if (typeof window !== "undefined") window.dispatchEvent(new Event(QUEUE_EVENT));
}

/** Subscribe to enqueue/remove/release changes. Returns an unsubscribe fn. */
export function subscribeQueueChange(cb: () => void): () => void {
  window.addEventListener(QUEUE_EVENT, cb);
  return () => window.removeEventListener(QUEUE_EVENT, cb);
}

export type OfflineQuestion = {
  id: string;
  subject: string;
  topic: string | null;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string | null;
  option_d: string | null;
  correct_answer: string;
  explanation: string | null;
};

export type PendingAttempt = {
  /** Client-unique id — the queue's idempotency guard. */
  id: string;
  /** Existing DB-backed questions use questionId; bundled questions use questionKey. */
  questionId?: string;
  questionKey?: string;
  /** Text is only a compatibility fallback if the DB key column is unavailable. */
  questionText?: string;
  selectedAnswer: string;
  /** Epoch ms, used to reclaim entries stranded in "syncing" by a crash. */
  createdAt: number;
  status: "queued" | "syncing";
  /** Last lease start, separate from original createdAt so old entries cannot be reclaimed immediately. */
  syncStartedAt?: number;
  /** Seconds spent on the question (timed surfaces, e.g. McqPlayer). */
  timeSpentSeconds?: number;
};

export function newId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `off-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// Question bank
// ---------------------------------------------------------------------------

export async function cacheQuestions(questions: OfflineQuestion[]): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    // Clear + put in ONE transaction: the stored set always equals the last
    // successful download, so the count the toggle reports is the truth (a
    // plain put-overwrite would leave stale rows when the bank shrinks, and an
    // aborted tx rolls back atomically so a failed download keeps the old set).
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    const store = tx.objectStore(QUESTIONS_STORE);
    store.clear();
    for (const q of questions) store.put(q);
    tx.oncomplete = () => resolve(questions.length);
    tx.onerror = () => reject(tx.error);
  });
}

export async function getCachedQuestions(): Promise<OfflineQuestion[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readonly");
    const req = tx.objectStore(QUESTIONS_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getCachedCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readonly");
    const req = tx.objectStore(QUESTIONS_STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function clearCachedQuestions(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    tx.objectStore(QUESTIONS_STORE).clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// ---------------------------------------------------------------------------
// Pending-attempt outbox
// ---------------------------------------------------------------------------

export async function enqueuePendingAttempt(
  questionId: string,
  selectedAnswer: string,
  timeSpentSeconds?: number,
  id: string = newId()
): Promise<PendingAttempt> {
  const entry: PendingAttempt = {
    id,
    questionId,
    selectedAnswer,
    createdAt: Date.now(),
    status: "queued",
    ...(typeof timeSpentSeconds === "number" ? { timeSpentSeconds } : {}),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    tx.objectStore(PENDING_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyQueueChanged();
  return entry;
}

/** Queue an answer for a bundled question that has a stable key but no DB UUID in the client. */
export async function enqueuePendingQuestionAttempt(
  questionKey: string,
  questionText: string,
  selectedAnswer: string,
  timeSpentSeconds?: number,
  id: string = newId()
): Promise<PendingAttempt> {
  const entry: PendingAttempt = {
    id,
    questionKey,
    questionText,
    selectedAnswer,
    createdAt: Date.now(),
    status: "queued",
    ...(typeof timeSpentSeconds === "number" ? { timeSpentSeconds } : {}),
  };
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    tx.objectStore(PENDING_STORE).put(entry);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyQueueChanged();
  return entry;
}

export async function countPendingAttempts(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readonly");
    const req = tx.objectStore(PENDING_STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Atomically take every sendable entry: "queued" ones now, plus "syncing"
 * ones stranded by a crashed drain older than STALE_SYNCING_MS. Readwrite
 * transactions on a store serialize, so a second tab draining concurrently
 * sees the flipped statuses and claims nothing — one entry, one send.
 */
export async function claimPendingAttempts(): Promise<PendingAttempt[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    const store = tx.objectStore(PENDING_STORE);
    const req = store.getAll();
    const claimed: PendingAttempt[] = [];
    req.onsuccess = () => {
      const now = Date.now();
      const cutoff = now - STALE_SYNCING_MS;
      for (const a of req.result as PendingAttempt[]) {
        const lastClaim = a.syncStartedAt ?? a.createdAt;
        if (a.status === "queued" || (a.status === "syncing" && lastClaim < cutoff)) {
          a.status = "syncing";
          a.syncStartedAt = now;
          store.put(a);
          claimed.push(a);
        }
      }
    };
    tx.oncomplete = () => resolve(claimed);
    tx.onerror = () => reject(tx.error);
  });
}

/** Send failed (transient / signed out) — put the entry back in the queue. */
export async function releasePendingAttempts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    const store = tx.objectStore(PENDING_STORE);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    for (const id of ids) {
      const get = store.get(id);
      get.onsuccess = () => {
        const a = get.result as PendingAttempt | undefined;
        if (a) {
          a.status = "queued";
          delete a.syncStartedAt;
          store.put(a);
        }
      };
    }
  });
  notifyQueueChanged();
}

/** Server confirmed the insert — drop the entry. */
export async function removePendingAttempts(ids: string[]): Promise<void> {
  if (ids.length === 0) return;
  const db = await openDB();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(PENDING_STORE, "readwrite");
    const store = tx.objectStore(PENDING_STORE);
    for (const id of ids) store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  notifyQueueChanged();
}

export async function isOnline(): Promise<boolean> {
  return navigator.onLine;
}
