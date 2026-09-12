import { submitImport, submitListens } from './listenbrainz';
import type { Listen } from './listenbrainz';
import { nowEpoch, toErrorMessage } from './time';
import { t } from './i18n.svelte';

export const APP_SUBMISSION_CLIENT = 'brainzscrobble';

const AUTH_KEY = 'brainzscrobble.auth';
const QUEUE_KEY = 'brainzscrobble.queue';
const HISTORY_KEY = 'brainzscrobble.history';

const MAX_HISTORY = 50;

export interface TrackDraft {
  artist: string;
  track: string;
  album?: string;
}

export interface QueueItem {
  id: string;
  artist: string;
  track: string;
  album?: string;
  listenedAt: number;
  status: 'pending' | 'error';
  error?: string;
  createdAt: number;
}

export interface HistoryItem {
  id: string;
  artist: string;
  track: string;
  album?: string;
  listenedAt: number;
  submittedAt: number;
}

export interface AuthState {
  token: string;
  username: string;
}

interface StoreShape {
  token: string;
  username: string;
  queue: QueueItem[];
  history: HistoryItem[];
  batchBusy: boolean;
}

function load<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function save(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable; ignored
  }
}

function makeId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

const activeSubmissions = new Set<string>();

const savedAuth = load<AuthState>(AUTH_KEY, { token: '', username: '' });

export const store = $state<StoreShape>({
  token: savedAuth.token,
  username: savedAuth.username,
  queue: [],
  history: [],
  batchBusy: false,
});

store.queue = load<QueueItem[]>(QUEUE_KEY, []);
store.history = load<HistoryItem[]>(HISTORY_KEY, []);

function toListen(item: QueueItem): Listen {
  return {
    listened_at: item.listenedAt,
    track_metadata: {
      artist_name: item.artist,
      track_name: item.track,
      ...(item.album ? { release_name: item.album } : {}),
      additional_info: {
        submission_client: APP_SUBMISSION_CLIENT,
        media_player: APP_SUBMISSION_CLIENT,
      },
    },
  };
}

function persistQueue(): void {
  save(QUEUE_KEY, store.queue);
}

function persistHistory(): void {
  save(HISTORY_KEY, store.history);
}

function moveToHistory(items: QueueItem[]): void {
  const ids = new Set(items.map((i) => i.id));
  const submittedAt = nowEpoch();
  for (const item of items) {
    store.history.unshift({
      id: item.id,
      artist: item.artist,
      track: item.track,
      album: item.album,
      listenedAt: item.listenedAt,
      submittedAt,
    });
  }
  store.history = store.history.slice(0, MAX_HISTORY);
  store.queue = store.queue.filter((i) => !ids.has(i.id));
  persistQueue();
  persistHistory();
}

function markError(items: QueueItem[], message: string): void {
  for (const item of items) {
    item.status = 'error';
    item.error = message;
  }
  persistQueue();
}

export function isLoggedIn(): boolean {
  return store.token.trim().length > 0 && store.username.trim().length > 0;
}

export function connect(data: AuthState): void {
  store.token = data.token.trim();
  store.username = data.username.trim();
  save(AUTH_KEY, { token: store.token, username: store.username });
}

export function logout(): void {
  store.token = '';
  store.username = '';
  try {
    localStorage.removeItem(AUTH_KEY);
  } catch {
    // storage unavailable; ignored
  }
}

export function enqueue(draft: TrackDraft, at: number): QueueItem {
  const item: QueueItem = {
    id: makeId(),
    artist: draft.artist.trim(),
    track: draft.track.trim(),
    album: draft.album?.trim() || undefined,
    listenedAt: at,
    status: 'pending',
    createdAt: nowEpoch(),
  };
  store.queue.push(item);
  persistQueue();
  return item;
}

export async function submitSingle(id: string): Promise<boolean> {
  const item = store.queue.find((i) => i.id === id);
  if (!item) return false;
  if (activeSubmissions.has(id)) return false;
  if (!isLoggedIn()) {
    markError([item], t('errors.notConnected'));
    return false;
  }
  activeSubmissions.add(id);
  try {
    await submitListens(store.token, 'single', [toListen(item)]);
    moveToHistory([item]);
    return true;
  } catch (e) {
    markError([item], toErrorMessage(e));
    return false;
  } finally {
    activeSubmissions.delete(id);
  }
}

export function retryItem(id: string): Promise<boolean> {
  return submitSingle(id);
}

export function removeItem(id: string): void {
  store.queue = store.queue.filter((i) => i.id !== id);
  persistQueue();
}

export async function submitBatch(): Promise<{ ok: number; fail: number }> {
  const targets = store.queue.filter(
    (i) => i.status === 'pending' || i.status === 'error',
  );
  if (!targets.length || store.batchBusy) return { ok: 0, fail: 0 };
  if (!isLoggedIn()) {
    markError(targets, t('errors.notConnected'));
    return { ok: 0, fail: targets.length };
  }
  store.batchBusy = true;
  let ok = 0;
  let fail = 0;
  try {
    for (let i = 0; i < targets.length; i += 100) {
      const chunk = targets.slice(i, i + 100);
      try {
        await submitImport(store.token, chunk.map(toListen));
        moveToHistory(chunk);
        ok += chunk.length;
      } catch (e) {
        markError(chunk, toErrorMessage(e));
        fail += chunk.length;
        break;
      }
    }
  } finally {
    store.batchBusy = false;
  }
  return { ok, fail };
}

export function clearHistory(): void {
  store.history = [];
  persistHistory();
}