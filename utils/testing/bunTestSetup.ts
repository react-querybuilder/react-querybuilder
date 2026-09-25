// Preloaded by `bun test` (see bunfig.toml). Root-level hooks registered here run once for the
// entire run, which the shared DB harnesses need: they're process-wide, so no single test file
// can own their teardown.
import { afterAll } from 'bun:test';

afterAll(async () => {
  // Flag checks first: set only once a harness boots, so runs that never touch a DB skip
  // resolving the (heavy) harness modules entirely. Both attempted even if one fails.
  const results = await Promise.allSettled([
    globalThis.__rqbPGliteActive &&
      import('./pglite').then(({ closeSharedPGlite }) => closeSharedPGlite()),
    globalThis.__rqbMongoActive &&
      import('./mongo').then(({ closeSharedMongo }) => closeSharedMongo()),
  ]);
  const errors = results.flatMap(r => (r.status === 'rejected' ? [r.reason] : []));
  if (errors.length > 0) throw new AggregateError(errors, 'DB harness teardown failed');
});
