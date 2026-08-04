/**
 * Drift check for the committed conformance fixtures.
 *
 * Regenerates the fixture set into a temp directory and compares it byte-for-byte with what is
 * committed under `utils/conformance/fixtures`. A mismatch means the rendered class surface,
 * the accessible descriptions, or the mutation results changed — which may be perfectly
 * intentional, but must show up as a reviewable diff rather than silently.
 *
 * This is also the regression guard for Phase 0.3: the generator imports the core substrate
 * exports (`createQueryActions`, `QueryManager`, the query tools) by name, so dropping one from
 * `index.ts` breaks generation here rather than at a port's build months later.
 */

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import * as path from 'node:path';
import { generate } from './generate';

const committedDir = path.join(import.meta.dirname, 'fixtures');

const run = async (): Promise<number> => {
  const tempDir = await mkdtemp(path.join(tmpdir(), 'rqb-conformance-'));

  try {
    const files = await generate(tempDir);

    const results = await Promise.all(
      files.map(async file => {
        const committed = Bun.file(path.join(committedDir, file));

        if (!(await committed.exists())) return `${file} (missing — never generated)`;

        const [a, b] = await Promise.all([
          committed.text(),
          Bun.file(path.join(tempDir, file)).text(),
        ]);

        return a === b ? null : file;
      })
    );

    const stale = results.filter(r => r !== null);

    if (stale.length > 0) {
      console.error('Conformance fixtures are out of date:');
      for (const file of stale) console.error(`  - ${file}`);
      console.error('\nRun `bun conformance:generate` and commit the result.');
      return 1;
    }

    console.log(`Conformance fixtures up to date (${files.length} files).`);
    return 0;
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
};

process.exit(await run());
