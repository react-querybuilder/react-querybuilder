import { PGlite } from '@electric-sql/pglite';

// Shared PGlite instance. `bun test` runs all files in one process with a shared
// module registry, so this WASM instance spins up exactly once for every postgres
// test file. Isolation is achieved via distinct, schema-qualified namespaces (see
// `reserveSchema`) rather than session state, so it is safe regardless of test order.
// NOTE: intentionally NOT re-exported from index.ts to keep React/DOM deps out of
// node-environment dbquery tests.

declare global {
  // Set when (and only when) an instance exists. Lets the `bun test` preload decide
  // whether teardown is needed without importing this module. See bunTestSetup.ts.
  var __rqbPGliteActive: boolean | undefined;
}

let dbPromise: Promise<PGlite> | undefined;

export const getSharedPGlite = (): Promise<PGlite> =>
  (dbPromise ??= (async () => {
    globalThis.__rqbPGliteActive = true;
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

// Shut down the shared instance. Required, not merely polite: PGlite's Emscripten
// runtime sets `process.exitCode = 99` while booting (initdb's `callMain` exits
// normally, routing through `quit_`), and only `close()` restores the prior value.
// Leaving it open makes the whole `bun test` run exit 99 despite zero failures.
// See https://github.com/electric-sql/pglite/issues/975. NOTE: pglite is pinned to
// 0.5.4 because 0.5.5 no longer restores `exitCode` on close.
// No-op if no instance was ever created.
export const closeSharedPGlite = async (): Promise<void> => {
  if (!dbPromise) return;
  const db = await dbPromise;
  dbPromise = undefined;
  globalThis.__rqbPGliteActive = undefined;
  await db.close();
};
