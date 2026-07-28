/**
 * Typed client for the Vessel FastAPI backend.
 *
 * The base URL comes from EXPO_PUBLIC_API_URL (see .env.example). It defaults to
 * localhost, which is correct for web and the iOS simulator.
 */

export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export type Bible = {
  id: string;
  name: string;
  abbreviation?: string;
  description?: string;
  language?: { name?: string };
};

export type VerseHit = {
  id: string;
  reference: string;
  text: string;
};

export type Journal = {
  id: number;
  title: string;
  entry_date: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type JournalInput = {
  title?: string;
  entry_date?: string;
  content?: string;
};

export type Tag = { tag: string; count: number };

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`${res.status} ${res.statusText}: ${body}`);
  }
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export const api = {
  getConfig: () => request<{ default_bible_id: string }>('/api/config'),

  listBibles: () => request<Bible[]>('/api/bibles'),

  searchVerses: (bibleId: string, query: string, limit = 8) =>
    request<VerseHit[]>(
      `/api/bibles/${bibleId}/search?query=${encodeURIComponent(query)}&limit=${limit}`,
    ),

  getVerse: (bibleId: string, verseId: string) =>
    request<{ reference: string; content: string }>(
      `/api/bibles/${bibleId}/verses/${verseId}`,
    ),

  listJournals: () => request<Journal[]>('/api/journals'),

  getJournal: (id: number) => request<Journal>(`/api/journals/${id}`),

  createJournal: (data: JournalInput) =>
    request<Journal>('/api/journals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateJournal: (id: number, data: JournalInput) =>
    request<Journal>(`/api/journals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteJournal: (id: number) =>
    request<void>(`/api/journals/${id}`, { method: 'DELETE' }),

  listTags: () => request<Tag[]>('/api/journals/tags'),
};
