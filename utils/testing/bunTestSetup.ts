// Preloaded by `bun test` (see bunfig.toml). Root-level hooks registered here run once for the
// entire run, which the shared DB harnesses need: they're process-wide, so no single test file
// can own their teardown.
import { afterAll } from 'bun:test';
import path from 'node:path';

// `@react-querybuilder/mcp` imports its (gitignored) generated docs index; build it if missing
const mcpDocsIndex = path.join(
  import.meta.dirname,
  '../../packages/mcp/src/generated/docs-index.json'
);
if (!(await Bun.file(mcpDocsIndex).exists())) {
  const { writeDocsIndex } = await import('../build-mcp-docs-index');
  await writeDocsIndex();
}

afterAll(async () => {
  // Flag checks first: set only once a harness boots, so runs that never touch a DB skip
  // resolving the (heavy) harness modules entirely. All attempted even if one fails.
  const results = await Promise.allSettled([
    globalThis.__rqbPGliteActive &&
      import('./dbpool/pglite').then(({ closeSharedPGlite }) => closeSharedPGlite()),
    globalThis.__rqbMSSQLActive &&
      import('./dbpool/mssql').then(({ closeSharedMSSQL }) => closeSharedMSSQL()),
    globalThis.__rqbOracleActive &&
      import('./dbpool/oracle').then(({ closeSharedOracle }) => closeSharedOracle()),
    globalThis.__rqbMySQLActive &&
      import('./dbpool/mysql').then(({ closeSharedMySQL }) => closeSharedMySQL()),
    globalThis.__rqbMariaDBActive &&
      import('./dbpool/mysql').then(({ closeSharedMariaDB }) => closeSharedMariaDB()),
    globalThis.__rqbQdrantActive &&
      import('./dbpool/qdrant').then(({ closeSharedQdrant }) => closeSharedQdrant()),
    globalThis.__rqbMongoActive &&
      import('./mongo').then(({ closeSharedMongo }) => closeSharedMongo()),
  ]);
  const errors = results.flatMap(r => (r.status === 'rejected' ? [r.reason] : []));
  if (errors.length > 0) throw new AggregateError(errors, 'DB harness teardown failed');
});
