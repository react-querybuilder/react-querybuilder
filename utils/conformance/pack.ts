/**
 * Packs the committed conformance fixtures into a release asset.
 *
 * Produces `rqb-conformance-fixtures.tar.gz` (plus a sibling `.sha256`) in the repo root. The
 * release workflow uploads both to the GitHub release so ports can vendor a pinned, verifiable
 * copy of the fixture set:
 *
 *   https://github.com/react-querybuilder/react-querybuilder/releases/download/<tag>/rqb-conformance-fixtures.tar.gz
 *
 * The compatibility signal is `index.json.schemaVersion`, not the tag.
 *
 * Run `bun conformance:check` first — this script packs whatever is committed and does not
 * regenerate anything.
 */

import * as path from 'node:path';

const fixturesDir = path.join(import.meta.dirname, 'fixtures');
const repoRoot = path.join(import.meta.dirname, '..', '..');
const archiveName = 'rqb-conformance-fixtures.tar.gz';
const archivePath = path.join(repoRoot, archiveName);
const checksumPath = `${archivePath}.sha256`;

const pack = async (): Promise<number> => {
  const index = await Bun.file(path.join(fixturesDir, 'index.json')).json();

  const files = ['index.json', ...index.files].toSorted() as string[];

  const missing = (
    await Promise.all(
      files.map(async file =>
        (await Bun.file(path.join(fixturesDir, file)).exists()) ? null : file
      )
    )
  ).filter(file => file !== null);

  if (missing.length > 0) {
    console.error('Missing fixture files:');
    for (const file of missing) console.error(`  - ${file}`);
    console.error('\nRun `bun conformance:generate` and commit the result.');
    return 1;
  }

  // `--sort=name`/`--mtime`/`--owner`/`--group`/`--numeric-owner` would make the tarball
  // reproducible, but BSD tar (macOS) does not support them. Determinism is not required here:
  // the `.sha256` is generated from the archive that actually ships.
  const tar = Bun.spawnSync(['tar', '-czf', archivePath, '-C', fixturesDir, ...files], {
    stdout: 'inherit',
    stderr: 'inherit',
  });

  if (tar.exitCode !== 0) {
    console.error(`tar exited with code ${tar.exitCode}`);
    return tar.exitCode ?? 1;
  }

  const hash = new Bun.CryptoHasher('sha256')
    .update(await Bun.file(archivePath).bytes())
    .digest('hex');

  await Bun.write(checksumPath, `${hash}  ${archiveName}\n`);

  console.log(`Packed ${files.length} fixture files (schemaVersion ${index.schemaVersion}):`);
  for (const file of files) console.log(`  - ${file}`);
  console.log(`\n${archiveName}\n${hash}`);

  return 0;
};

process.exit(await pack());
