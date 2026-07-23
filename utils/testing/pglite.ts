import { PGlite } from '@electric-sql/pglite';

// Shared PGlite instance. `bun test` runs all files in one process with a shared
// module registry, so this WASM instance spins up exactly once for every postgres
// test file. Isolation is achieved via distinct, schema-qualified namespaces (see
// `reserveSchema`) rather than session state, so it is safe regardless of test order.
// NOTE: intentionally NOT re-exported from index.ts to keep React/DOM deps out of
// node-environment dbquery tests.

let dbPromise: Promise<PGlite> | undefined;

export const getSharedPGlite = (): Promise<PGlite> =>
  (dbPromise ??= (async () => {
    const db = new PGlite();
    await db.query('SELECT 1'); // force WASM init/ready
    return db;
  })());

let schemaCounter = 0;

// Reserve a globally-unique schema name (does not create it). Module-scope calls
// guarantee uniqueness across files independent of execution order.
export const reserveSchema = (label: string = 'ctx'): string => `rqb_${label}_${++schemaCounter}`;

export const createSchema = async (schema: string): Promise<PGlite> => {
  const db = await getSharedPGlite();
  await db.exec(`DROP SCHEMA IF EXISTS "${schema}" CASCADE; CREATE SCHEMA "${schema}";`);
  return db;
};

export const dropSchema = async (schema: string): Promise<void> => {
  const db = await getSharedPGlite();
  await db.exec(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
};
