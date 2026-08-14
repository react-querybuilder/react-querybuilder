// Preloaded by `bun test` (see bunfig.toml). Root-level hooks registered here run
// once for the entire run, which is what the shared PGlite instance needs: it is
// process-wide, so no single test file can own its teardown.
import { afterAll } from 'bun:test';

afterAll(async () => {
  // Flag check first: it's set only once an instance exists, so runs that never
  // touch Postgres skip resolving the (heavy) pglite module entirely.
  if (!globalThis.__rqbPGliteActive) return;
  const { closeSharedPGlite } = await import('./pglite');
  await closeSharedPGlite();
});
