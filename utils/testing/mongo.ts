import { MongoMemoryServer } from 'mongodb-memory-server-core';
import type { Connection, Model, Schema } from 'mongoose';
import { createConnection } from 'mongoose';

// Shared in-memory MongoDB. `bun test` runs all files in one process w/ shared module registry,
// so the (slow) MongoMemoryServer boots once for every mongodb test file. Isolation via
// `reserveModel` (globally-unique model + collection names). Dedicated connection (not global
// `mongoose.connect`) keeps models off the global mongoose singleton. Stopped by the `bun test`
// preload (see bunTestSetup.ts) so no orphaned mongod survives the run.
// NOTE: intentionally NOT re-exported from index.ts to keep it out of DOM test bundles.

if (typeof Bun === 'undefined') {
  throw new Error('@rqb-dbmongo is bun-test-only (vitest excludes dbquery.* files)');
}

declare global {
  // Set once boot starts; lets the preload skip teardown when mongo was never used.
  var __rqbMongoActive: boolean | undefined;
}

// Pinned so upgrades of mongodb-memory-server don't silently change server semantics or force
// a fresh binary download. Override w/ MONGOMS_VERSION env var if needed.
const MONGOD_VERSION = '8.2.6';

interface Handle {
  server: MongoMemoryServer;
  conn: Connection;
}

let handlePromise: Promise<Handle> | undefined;

const boot = async (): Promise<Handle> => {
  globalThis.__rqbMongoActive = true;
  const server = await MongoMemoryServer.create({
    binary: { version: process.env.MONGOMS_VERSION ?? MONGOD_VERSION },
  });
  try {
    // autoIndex off: background index builds would race first queries. Callers needing
    // indexes must `await model.syncIndexes()` (see `reserveModel`).
    const conn = await createConnection(server.getUri(), { autoIndex: false }).asPromise();
    return { server, conn };
  } catch (e) {
    await server.stop();
    throw e;
  }
};

const getHandle = (): Promise<Handle> =>
  // Forget rejections so later files retry rather than inherit a stale boot failure.
  (handlePromise ??= boot().catch(e => {
    handlePromise = undefined;
    throw e;
  }));

export const getSharedMongo = async (): Promise<Connection> => (await getHandle()).conn;

const labelRE = /^[a-z0-9_]+$/;
let modelCounter = 0;

/**
 * Register a model under a globally-unique name/collection on the shared connection, w/ indexes
 * built before returning. Returns the model and a `drop` fn for `afterAll`.
 */
export const reserveModel = async <T>(
  label: string,
  schema: Schema<T>
): Promise<{ model: Model<T>; drop: () => Promise<void> }> => {
  if (!labelRE.test(label)) throw new Error(`Invalid model label: ${label}`);
  const name = `rqb_${label}_${++modelCounter}`;
  const conn = await getSharedMongo();
  const model = conn.model<T>(name, schema, name);
  await model.syncIndexes();
  return {
    model,
    drop: async () => {
      await model.collection.drop().catch(() => {}); // already gone -> fine
      conn.deleteModel(name);
    },
  };
};

// Close connection, then stop mongod (always attempted). No-op if never booted.
export const closeSharedMongo = async (): Promise<void> => {
  const cur = handlePromise;
  handlePromise = undefined;
  globalThis.__rqbMongoActive = undefined;
  const handle = await cur?.catch(() => undefined);
  if (!handle) return;
  try {
    await handle.conn.close();
  } finally {
    await handle.server.stop();
  }
};
