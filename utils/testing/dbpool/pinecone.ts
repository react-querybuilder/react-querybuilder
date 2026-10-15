import { teardown } from './memo';

// Pinecone REST harness (opt-in; real account, not run in CI since Pinecone Local is EOL).
// `fetch` only, no SDK. Uses an existing serverless index w/ dimension 2 (metric any); one
// namespace per suite (name from `reserveSchema`, `_` → `-`).
// Env:
//   RQB_PINECONE_URL=https://<index-host>   (data plane host of a dimension-2 index)
//   RQB_PINECONE_API_KEY=<key>

declare global {
  // Set on first request; lets the preload skip teardown when never used.
  var __rqbPineconeActive: boolean | undefined;
}

export const pineconeEnabled: boolean =
  !!process.env.RQB_PINECONE_URL && !!process.env.RQB_PINECONE_API_KEY;

const apiVersion = '2025-04';
const namespaces = new Set<string>();

const pineconeFetch = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  globalThis.__rqbPineconeActive = true;
  const url = process.env.RQB_PINECONE_URL;
  const key = process.env.RQB_PINECONE_API_KEY;
  if (!url || !key) throw new Error('RQB_PINECONE_URL/RQB_PINECONE_API_KEY not set');
  const res = await fetch(`${url.replace(/\/$/, '')}${path}`, {
    method,
    headers: {
      'content-type': 'application/json',
      'Api-Key': key,
      'X-Pinecone-API-Version': apiVersion,
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Pinecone ${method} ${path} → ${res.status}: ${text}`);
  return (text ? JSON.parse(text) : undefined) as T;
};

export const pineconeNamespace = (schema: string): string => schema.replaceAll('_', '-');

export const createPineconeNamespace = async (ns: string): Promise<void> => {
  await dropPineconeNamespace(ns).catch(() => {});
  namespaces.add(ns);
};

export const dropPineconeNamespace = async (ns: string): Promise<void> => {
  await pineconeFetch('POST', '/vectors/delete', { deleteAll: true, namespace: ns });
  namespaces.delete(ns);
};

/**
 * Upserts metadata w/ sequential string ids and identical dummy vectors, then waits until
 * the namespace reports all vectors (writes are eventually consistent). Pinecone metadata
 * can't hold `null`/objects, so those keys are omitted.
 */
export const pineconeInsert = async (
  ns: string,
  metadatas: Record<string, unknown>[]
): Promise<void> => {
  await pineconeFetch('POST', '/vectors/upsert', {
    namespace: ns,
    vectors: metadatas.map((m, i) => ({
      id: `${i + 1}`,
      values: [1, 1],
      metadata: Object.fromEntries(
        Object.entries(m).filter(
          ([, v]) =>
            v !== null &&
            v !== undefined &&
            (typeof v !== 'object' || (Array.isArray(v) && v.every(x => typeof x === 'string')))
        )
      ),
    })),
  });
  const deadline = Date.now() + 60_000;
  while (Date.now() < deadline) {
    const { namespaces: stats } = await pineconeFetch<{
      namespaces: Record<string, { vectorCount: number }>;
    }>('POST', '/describe_index_stats', {});
    if ((stats[ns]?.vectorCount ?? 0) >= metadatas.length) return;
    await Bun.sleep(1000);
  }
  throw new Error(`Pinecone namespace ${ns} not ready`);
};

/** Returns metadata matching `filter` (`{}` → `filter` omitted). Unordered. */
export const pineconeFilter = async <T = Record<string, unknown>>(
  ns: string,
  filter: Record<string, unknown>
): Promise<T[]> => {
  const { matches } = await pineconeFetch<{ matches: { metadata: T }[] }>('POST', '/query', {
    namespace: ns,
    vector: [1, 1],
    topK: 1000,
    includeMetadata: true,
    ...(Object.keys(filter).length > 0 ? { filter } : null),
  });
  return matches.map(m => m.metadata);
};

/** Deletes any namespaces left behind by suites. */
export const closeSharedPinecone = (): Promise<void> =>
  teardown('Pinecone', [
    ...[...namespaces].map(ns => () => dropPineconeNamespace(ns)),
    async () => {
      globalThis.__rqbPineconeActive = undefined;
    },
  ]);
