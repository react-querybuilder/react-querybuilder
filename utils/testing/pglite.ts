import { SQL } from 'bun';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';
import type { PrismaPGlite } from 'pglite-prisma-adapter';

// Shared PGlite instance. `bun test` runs all files in one process w/ shared module registry,
// so the WASM instance boots once for every postgres test file. Isolation via distinct
// schema-qualified namespaces (see `reserveSchema`), not session state, so order-independent.
// NOTE: intentionally NOT re-exported from index.ts (keeps React/DOM deps out of dbquery tests).

declare global {
  // Set once boot starts. Lets the `bun test` preload skip teardown (and skip importing this
  // module) when postgres was never used. See bunTestSetup.ts.
  var __rqbPGliteActive: boolean | undefined;
}

// Memoize async init, but forget rejections so later callers retry instead of inheriting a
// stale failure (e.g. transient port error) for the rest of the run.
const memo = <T>(init: () => Promise<T>) => {
  let p: Promise<T> | undefined;
  return {
    get: (): Promise<T> =>
      (p ??= init().catch(e => {
        p = undefined;
        throw e;
      })),
    // Settled value (if any) for teardown; clears cache. Never throws.
    take: async (): Promise<T | undefined> => {
      const cur = p;
      p = undefined;
      return cur?.catch(() => undefined);
    },
  };
};

const pglite = memo(async () => {
  globalThis.__rqbPGliteActive = true;
  const db = new PGlite();
  await db.query('SELECT 1'); // force WASM init/ready
  return db;
});

const server = memo(async () => {
  // port 0 -> ephemeral; read back via getServerConn() after start()
  const s = new PGLiteSocketServer({ db: await pglite.get(), host: '127.0.0.1', port: 0 });
  await s.start();
  return s;
});

const sqlClient = memo(async () => {
  const conn = (await server.get()).getServerConn(); // "host:port"
  // max:1 required, not tuning: socket server multiplexes all connections onto one PGlite
  // backend session, so a larger pool collides on prepared statement names.
  return new SQL({ adapter: 'postgres', url: `postgres://postgres@${conn}/postgres`, max: 1 });
});

/**
 * Shared `Bun.SQL` handle for the shared PGlite instance, exposed over a loopback socket.
 * This is the API postgres dbquery tests should use — it mirrors the sqlite tests' client.
 */
export const getSharedSQL = (): Promise<SQL> => sqlClient.get();

/** @internal
 *  Native PGlite handle. Only for adapters that require it (Drizzle, Prisma).
 *  All other callers should use `getSharedSQL`.
 */
export const getSharedPGlite = (): Promise<PGlite> => pglite.get();

/**
 * Prisma driver adapter bound to the shared PGlite, w/ all generated SQL qualified by `schema`.
 * `PrismaPGlite` (the factory) doesn't forward `{ schema }` to the adapter it creates, so
 * Prisma would hardcode `"public"`; inject it on the connected adapter instead.
 */
export const getSharedPrismaAdapter = async (schema: string): Promise<PrismaPGlite> => {
  const { PrismaPGlite } = await import('pglite-prisma-adapter');
  const factory = new PrismaPGlite(await pglite.get());
  const connect = factory.connect.bind(factory);
  factory.connect = async () => Object.assign(await connect(), { options: { schema } });
  return factory;
};

const labelRE = /^[a-z0-9_]+$/;
let schemaCounter = 0;

// Reserve a globally-unique schema name (does not create it). Module-scope calls guarantee
// uniqueness across files independent of execution order. Label restricted -> safe to quote.
export const reserveSchema = (label: string = 'ctx'): string => {
  if (!labelRE.test(label)) throw new Error(`Invalid schema label: ${label}`);
  return `rqb_${label}_${++schemaCounter}`;
};

export const createSchema = async (schema: string): Promise<PGlite> => {
  const db = await pglite.get();
  await db.exec(`DROP SCHEMA IF EXISTS "${schema}" CASCADE; CREATE SCHEMA "${schema}";`);
  return db;
};

export const dropSchema = async (schema: string): Promise<void> => {
  const db = await pglite.get();
  await db.exec(`DROP SCHEMA IF EXISTS "${schema}" CASCADE;`);
};

// Shut down client -> socket server -> PGlite. Every stage attempted even if an earlier one
// fails; errors aggregated so a teardown failure can't mask the others. No-op if never booted.
export const closeSharedPGlite = async (): Promise<void> => {
  const errors: unknown[] = [];
  const attempt = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      errors.push(e);
    }
  };
  await attempt(async () => (await sqlClient.take())?.close());
  await attempt(async () => (await server.take())?.stop());
  await attempt(async () => (await pglite.take())?.close());
  globalThis.__rqbPGliteActive = undefined;
  // Regression guard: some pglite versions (e.g. 0.5.5) left `process.exitCode = 99` after boot (Emscripten
  // initdb exit), failing the run despite zero test failures. See electric-sql/pglite#975.
  if (process.exitCode === 99) {
    errors.push(new Error('PGlite left process.exitCode = 99 (electric-sql/pglite#975)'));
  }
  if (errors.length > 0) throw new AggregateError(errors, 'PGlite teardown failed');
};
