import { toGraphQLLiteral } from '../../../packages/core/src/utils/formatQuery/toGraphQLLiteral';
import { teardown } from './memo';

// Weaviate harness (CI-only; needs a live server w/ anonymous access, no vectorizer). `fetch`
// only, no SDK. One class per suite (name from `reserveSchema` via `weaviateClassName`). Queries
// go through GraphQL `Get` (filters serialized w/ core's internal `toGraphQLLiteral`).
// Env:
//   RQB_WEAVIATE_URL=http://localhost:8080

declare global {
  // Set on first request; lets the preload skip teardown when never used.
  var __rqbWeaviateActive: boolean | undefined;
}

export const weaviateEnabled: boolean = !!process.env.RQB_WEAVIATE_URL;

export interface WeaviateProperty {
  name: string;
  dataType: 'text' | 'text[]' | 'int' | 'number' | 'boolean' | 'date';
}

const classes = new Map<string, WeaviateProperty[]>();

const weaviateFetch = async <T = unknown>(
  method: string,
  path: string,
  body?: unknown
): Promise<T> => {
  globalThis.__rqbWeaviateActive = true;
  const url = process.env.RQB_WEAVIATE_URL;
  if (!url) throw new Error('RQB_WEAVIATE_URL is not set');
  const res = await fetch(`${url.replace(/\/$/, '')}${path}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Weaviate ${method} ${path} → ${res.status}: ${text}`);
  return (text ? JSON.parse(text) : undefined) as T;
};

/** Class names must start w/ a capital letter (`rqb_x_1` → `Rqb_x_1`). */
export const weaviateClassName = (schema: string): string =>
  schema[0].toUpperCase() + schema.slice(1);

/** Creates a class w/ `indexNullState` (for `IsNull`) and `field` tokenization for text. */
export const createWeaviateClass = async (
  name: string,
  properties: WeaviateProperty[]
): Promise<void> => {
  await dropWeaviateClass(name).catch(() => {});
  await weaviateFetch('POST', '/v1/schema', {
    class: name,
    vectorizer: 'none',
    invertedIndexConfig: { indexNullState: true },
    properties: properties.map(p => ({
      name: p.name,
      dataType: [p.dataType],
      ...(p.dataType.startsWith('text') ? { tokenization: 'field' } : null),
    })),
  });
  classes.set(name, properties);
};

export const dropWeaviateClass = async (name: string): Promise<void> => {
  await weaviateFetch('DELETE', `/v1/schema/${encodeURIComponent(name)}`);
  classes.delete(name);
};

/** Batch-inserts objects w/ identical dummy vectors. Only declared properties are kept. */
export const weaviateInsert = async (
  name: string,
  objects: Record<string, unknown>[]
): Promise<void> => {
  const props = classes.get(name) ?? [];
  const results = await weaviateFetch<{ result?: { errors?: unknown } }[]>(
    'POST',
    '/v1/batch/objects',
    {
      objects: objects.map(o => ({
        class: name,
        vector: [1, 1],
        properties: Object.fromEntries(
          props.flatMap(p =>
            o[p.name] === null || o[p.name] === undefined ? [] : [[p.name, o[p.name]]]
          )
        ),
      })),
    }
  );
  const errors = results.filter(r => r.result?.errors);
  if (errors.length > 0) throw new Error(`Weaviate batch errors: ${JSON.stringify(errors)}`);
};

/** Returns objects matching `where` via GraphQL `Get` (`{}` → `where` omitted). Unordered. */
export const weaviateFilter = async <T = Record<string, unknown>>(
  name: string,
  where: Record<string, unknown>
): Promise<T[]> => {
  const props = (classes.get(name) ?? []).map(p => p.name).join(' ');
  const args = [
    'limit: 10000',
    ...(Object.keys(where).length > 0
      ? [`where: ${toGraphQLLiteral(where, { enumKeys: ['operator'] })}`]
      : []),
  ].join(', ');
  const query = `{ Get { ${name}(${args}) { ${props} } } }`;
  const { data, errors } = await weaviateFetch<{
    data?: { Get: Record<string, T[]> };
    errors?: unknown;
  }>('POST', '/v1/graphql', { query });
  if (errors) throw new Error(`Weaviate GraphQL errors: ${JSON.stringify(errors)}\n${query}`);
  return data!.Get[name];
};

/** Drops any classes left behind by suites. */
export const closeSharedWeaviate = (): Promise<void> =>
  teardown('Weaviate', [
    ...[...classes.keys()].map(name => () => dropWeaviateClass(name)),
    async () => {
      globalThis.__rqbWeaviateActive = undefined;
    },
  ]);
