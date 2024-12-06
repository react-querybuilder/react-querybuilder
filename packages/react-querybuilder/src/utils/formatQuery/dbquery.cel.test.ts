import { $ } from 'bun';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { transformQuery } from '../transformQuery';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const skipGoCompiledTestsEnvVar = 'RQB_SKIP_GO_COMPILED_TESTS';

const repoRootDir = path.join(import.meta.dir, '../../../../..');
const celEvaluatorDir = `${repoRootDir}/utils/cel-evaluator`;
$.nothrow();
$.cwd(repoRootDir);

if (process.env[skipGoCompiledTestsEnvVar]) {
  // Bail out if we don't even want to try to run Go compiled tests
  test.skip(`CEL dbquery tests skipped - ${skipGoCompiledTestsEnvVar} env var set`);
} else {
  // Check if we need to rebuild the CEL evaluator
  const srcModifiedCheck =
    await $`git diff --name-only --cached ${celEvaluatorDir}/cel-evaluator.go && git ls-files -m ${celEvaluatorDir}/cel-evaluator.go`.text();
  const srcModified = !!srcModifiedCheck.trim();
  const srcLatestCommit =
    await $`git log -1 --format=%cd --date=unix ${celEvaluatorDir}/cel-evaluator.go`.text();
  const srcLatestCommitMs = Number(srcLatestCommit) * 1000;
  const { mtimeMs: srcLastModified } = await stat(`${celEvaluatorDir}/cel-evaluator.go`);
  const { mtimeMs: binLastModified } = await stat(
    `${celEvaluatorDir}/cel-evaluator${process.platform === 'win32' ? '.exe' : ''}`
  ).catch(() => ({ mtimeMs: 0 }));

  let buildInvalid = binLastModified === 0;
  let buildOutdated =
    buildInvalid ||
    // Re: next two lines, `srcLastModified` may be later then `binLastModified`,
    // but if the source file isn't modified from the last commit then the build
    // is only outdated if the binary is older than the commit.
    (srcLastModified > binLastModified && srcModified) ||
    srcLatestCommitMs > binLastModified;

  if (buildInvalid || buildOutdated) {
    // We need to rebuild the CEL evaluator, so check if Go is installed
    const { exitCode: goVersionExitCode } = await $`go version`.quiet();
    if (goVersionExitCode > 0) {
      // Bail out if Go is not installed
      test.skip('CEL dbquery tests skipped - Go not installed');
      buildInvalid = true;
    } else {
      // Build CEL evaluator package with Go
      const { exitCode: goBuildExitCode } = await $`go build cel-evaluator.go`.cwd(
        `${celEvaluatorDir}`
      );
      buildInvalid = goBuildExitCode > 0;
      buildOutdated = buildOutdated && buildInvalid;
    }
  }

  if (buildInvalid && buildOutdated) {
    // CEL evaluator was outdated but rebuild failed
    test.skip('CEL dbquery tests skipped - CEL evaluator outdated; Go build failed');
  } else if (buildInvalid) {
    // Bail out if Go build failed
    test.skip('CEL dbquery tests skipped - Go build failed');
  } else {
    // Run tests
    const superUsersCEL = superUsers('cel');
    for (const [name, { query: originalQuery, expectedResult, fqOptions }] of Object.entries(
      dbTests(superUsersCEL)
    )) {
      describe(name, () => {
        const query = transformQuery(originalQuery, {
          ruleProcessor: r => ({ ...r, field: `item.${r.field}` }),
        });
        test('cel', async () => {
          const queryAsCEL = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
            ...fqOptions,
          });
          const result =
            await $`./utils/cel-evaluator/cel-evaluator ${JSON.stringify(superUsersCEL)} ${queryAsCEL}`.text();
          expect(JSON.parse(result)).toEqual(expectedResult);
        });
      });
    }
  }
}
