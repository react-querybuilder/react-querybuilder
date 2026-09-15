import { MongoMemoryServer } from 'mongodb-memory-server-core';
import type { Connection } from 'mongoose';
import { createConnection } from 'mongoose';

// Shared in-memory MongoDB. `bun test` runs all files in one process with a shared
// module registry, so the (slow) MongoMemoryServer boots exactly once for every mongodb
// test file. Isolation relies on each file registering models under globally-unique
// names/collections, so it is safe regardless of test order. A dedicated connection
// (not global `mongoose.connect`) keeps model registration off the global mongoose
// singleton. The server is never stopped; process exit reclaims it.
// NOTE: intentionally NOT re-exported from index.ts to keep it out of DOM test bundles.

let connPromise: Promise<Connection> | undefined;

export const getSharedMongo = (): Promise<Connection> =>
  (connPromise ??= (async () => {
    const server = await MongoMemoryServer.create();
    return createConnection(server.getUri()).asPromise();
  })());
