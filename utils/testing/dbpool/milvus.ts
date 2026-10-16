import { teardown } from './memo';

// Milvus REST v2 harness (CI-only; needs a live standalone server). `fetch` only, no SDK. One
// collection per suite (name from `reserveSchema`). Explicit scalar schema + dummy 2-dim
// vector w/ AUTOINDEX (auto-loaded); `Strong` consistency so reads see prior inserts.
// Env:
//   RQB_MILVUS_URL=http://localhost:19530

declare global {
  // Set on first request; lets the preload skip teardown when never used.
  var __rqbMilvusActive: boolean | undefined;
}

export const milvusEnabled: boolean = !!process.env.RQB_MILVUS_URL;

export interface MilvusField {
  name: string;
  dataType: 'VarChar' | 'Int64' | 'Double' | 'Bool';
  nullable?: boolean;
}

const collections = new Map<string, MilvusField[]>();

const milvusFetch = async <T = unknown>(path: string, body: unknown): Promise<T> => {
  globalThis.__rqbMilvusActive = true;
  const url = process.env.RQB_MILVUS_URL;
  if (!url) throw new Error('RQB_MILVUS_URL is not set');
  const res = await fetch(`${url.replace(/\/$/, '')}/v2/vectordb${path}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: 'Bearer root:Milvus' },
    body: JSON.stringify(body),
  });
  const json = (await res.json().catch(() => ({}))) as {
    code?: number;
    message?: string;
    data?: T;
  };
  // Errors are reported in-body w/ HTTP 200
  if (!res.ok || (json.code ?? 0) !== 0) {
    throw new Error(`Milvus ${path} → ${res.status}/${json.code}: ${json.message}`);
  }
  return json.data as T;
};

export const createMilvusCollection = async (
  name: string,
  fields: MilvusField[]
): Promise<void> => {
  await dropMilvusCollection(name).catch(() => {});
  await milvusFetch('/collections/create', {
    collectionName: name,
    schema: {
      autoId: false,
      enableDynamicField: false,
      fields: [
        { fieldName: 'id', dataType: 'Int64', isPrimary: true },
        { fieldName: 'vec', dataType: 'FloatVector', elementTypeParams: { dim: 2 } },
        ...fields.map(f => ({
          fieldName: f.name,
          dataType: f.dataType,
          ...(f.nullable ? { nullable: true } : null),
          ...(f.dataType === 'VarChar' ? { elementTypeParams: { max_length: 256 } } : null),
        })),
      ],
    },
    indexParams: [{ fieldName: 'vec', metricType: 'L2', indexName: 'vec', indexType: 'AUTOINDEX' }],
    params: { consistencyLevel: 'Strong' },
  });
  collections.set(name, fields);
};

export const dropMilvusCollection = async (name: string): Promise<void> => {
  await milvusFetch('/collections/drop', { collectionName: name });
  collections.delete(name);
};

/** Inserts rows w/ sequential int ids and identical dummy vectors; only schema fields kept. */
export const milvusInsert = async (
  name: string,
  rows: Record<string, unknown>[]
): Promise<void> => {
  const fields = collections.get(name) ?? [];
  await milvusFetch('/entities/insert', {
    collectionName: name,
    data: rows.map((r, i) => ({
      id: i + 1,
      vec: [1, 1],
      ...Object.fromEntries(fields.map(f => [f.name, r[f.name] ?? null])),
    })),
  });
};

/** Returns rows matching `filter` (`""` → all rows). Unordered. */
export const milvusFilter = async <T = Record<string, unknown>>(
  name: string,
  filter: string
): Promise<T[]> =>
  milvusFetch<T[]>('/entities/query', {
    collectionName: name,
    filter,
    outputFields: (collections.get(name) ?? []).map(f => f.name),
    limit: 10_000,
    consistencyLevel: 'Strong',
  });

/** Drops any collections left behind by suites. */
export const closeSharedMilvus = (): Promise<void> =>
  teardown('Milvus', [
    ...[...collections.keys()].map(name => () => dropMilvusCollection(name)),
    async () => {
      globalThis.__rqbMilvusActive = undefined;
    },
  ]);
