import { teardown } from './memo';

// Qdrant REST harness (CI-only; needs a live server). `fetch` only, no SDK. One collection per
// suite (name from `reserveSchema`). Dummy 2-dim vectors; queries are filter-only (`scroll`).
// Env:
//   RQB_QDRANT_URL=http://localhost:6333

declare global {
  // Set on first request; lets the preload skip teardown when never used.
  var __rqbQdrantActive: boolean | undefined;
}

export const qdrantEnabled: boolean = !!process.env.RQB_QDRANT_URL;

const created = new Set<string>();

const qdrantFetch = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  globalThis.__rqbQdrantActive = true;
  const base = process.env.RQB_QDRANT_URL;
  if (!base) throw new Error('RQB_QDRANT_URL is not set');
  const res = await fetch(`${base.replace(/\/$/, '')}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as { result?: T; status?: unknown };
  if (!res.ok) {
    throw new Error(`Qdrant ${method} ${path} → ${res.status}: ${JSON.stringify(json.status)}`);
  }
  return json.result as T;
};

const enc = encodeURIComponent;

export const createQdrantCollection = async (name: string): Promise<void> => {
  // 404 if missing; rethrow anything else
  await dropQdrantCollection(name).catch((e: unknown) => {
    if (!(e instanceof Error && e.message.includes('→ 404'))) throw e;
  });
  await qdrantFetch('PUT', `/collections/${enc(name)}`, {
    vectors: { size: 2, distance: 'Dot' },
  });
  created.add(name);
};

export const dropQdrantCollection = async (name: string): Promise<void> => {
  await qdrantFetch('DELETE', `/collections/${enc(name)}`);
  created.delete(name);
};

/** Upserts payloads as points w/ sequential integer ids and identical dummy vectors. */
export const qdrantInsert = async (
  name: string,
  payloads: Record<string, unknown>[]
): Promise<void> => {
  await qdrantFetch('PUT', `/collections/${enc(name)}/points?wait=true`, {
    points: payloads.map((payload, i) => ({ id: i + 1, vector: [1, 1], payload })),
  });
};

/** Returns payloads matching `filter` (`{}` → filter param omitted). Unordered. */
export const qdrantFilter = async <T = Record<string, unknown>>(
  name: string,
  filter: Record<string, unknown>
): Promise<T[]> => {
  const { points } = await qdrantFetch<{ points: { payload: T }[] }>(
    'POST',
    `/collections/${enc(name)}/points/scroll`,
    {
      ...(Object.keys(filter).length > 0 ? { filter } : null),
      limit: 10_000,
      with_payload: true,
      with_vector: false,
    }
  );
  return points.map(p => p.payload);
};

/** Drops any collections left behind by suites. */
export const closeSharedQdrant = (): Promise<void> =>
  teardown('Qdrant', [
    ...[...created].map(name => () => dropQdrantCollection(name)),
    async () => {
      globalThis.__rqbQdrantActive = undefined;
    },
  ]);
