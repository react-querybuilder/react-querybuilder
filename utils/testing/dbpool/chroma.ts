import { teardown } from './memo';

// Chroma REST v2 harness (CI-only; needs a live server). `fetch` only, no SDK. One collection
// per suite (name from `reserveSchema`). Own dummy 2-dim embeddings (no embedding fn).
// Env:
//   RQB_CHROMA_URL=http://localhost:8000

declare global {
  // Set on first request; lets the preload skip teardown when never used.
  var __rqbChromaActive: boolean | undefined;
}

export const chromaEnabled: boolean = !!process.env.RQB_CHROMA_URL;

const base = '/api/v2/tenants/default_tenant/databases/default_database/collections';
const ids = new Map<string, string>();

const chromaFetch = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  globalThis.__rqbChromaActive = true;
  const url = process.env.RQB_CHROMA_URL;
  if (!url) throw new Error('RQB_CHROMA_URL is not set');
  const res = await fetch(`${url.replace(/\/$/, '')}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Chroma ${method} ${path} → ${res.status}: ${text}`);
  return (text ? JSON.parse(text) : undefined) as T;
};

const enc = encodeURIComponent;

export const createChromaCollection = async (name: string): Promise<void> => {
  await dropChromaCollection(name).catch(() => {});
  const { id } = await chromaFetch<{ id: string }>('POST', base, { name });
  ids.set(name, id);
};

export const dropChromaCollection = async (name: string): Promise<void> => {
  // DELETE binds the path segment as the collection *name*
  await chromaFetch('DELETE', `${base}/${enc(name)}`);
  ids.delete(name);
};

const idOf = (name: string) => {
  const id = ids.get(name);
  if (!id) throw new Error(`Unknown Chroma collection: ${name}`);
  return id;
};

/**
 * Adds records w/ sequential string ids and identical dummy embeddings. Chroma metadata
 * can't hold `null`/objects/arrays of objects, so those keys are omitted.
 */
export const chromaInsert = async (
  name: string,
  metadatas: Record<string, unknown>[]
): Promise<void> => {
  await chromaFetch('POST', `${base}/${idOf(name)}/add`, {
    ids: metadatas.map((_, i) => `${i + 1}`),
    embeddings: metadatas.map(() => [1, 1]),
    metadatas: metadatas.map(m =>
      Object.fromEntries(
        Object.entries(m).filter(
          ([, v]) =>
            v !== null &&
            v !== undefined &&
            (typeof v !== 'object' ||
              (Array.isArray(v) && v.length > 0 && v.every(x => typeof x !== 'object')))
        )
      )
    ),
  });
};

/** Returns metadatas matching `where` (`{}` → `where` omitted). Unordered. */
export const chromaFilter = async <T = Record<string, unknown>>(
  name: string,
  where: Record<string, unknown>
): Promise<T[]> => {
  const { metadatas } = await chromaFetch<{ metadatas: T[] }>('POST', `${base}/${idOf(name)}/get`, {
    ...(Object.keys(where).length > 0 ? { where } : null),
    include: ['metadatas'],
  });
  return metadatas;
};

/** Drops any collections left behind by suites. */
export const closeSharedChroma = (): Promise<void> =>
  teardown('Chroma', [
    ...[...ids.keys()].map(name => () => dropChromaCollection(name)),
    async () => {
      globalThis.__rqbChromaActive = undefined;
    },
  ]);
