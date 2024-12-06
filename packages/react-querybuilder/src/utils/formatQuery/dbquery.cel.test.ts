import { $ } from 'bun';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { transformQuery } from '../transformQuery';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const repoRootDir = path.join(import.meta.dir, '../../../../..');
$.nothrow();
$.cwd(repoRootDir);

const { exitCode: whichGoExitCode } = await $`go version`.quiet();

if (whichGoExitCode > 0) {
  // Bail out if Go is not installed
  test.skip('CEL dbquery tests skipped - Go not installed');
} else {
  const { mtimeMs: srcLastModified } = await stat(
    `${repoRootDir}/utils/cel-evaluator/cel-evaluator.go`
  );
  const { mtimeMs: binLastModified } = await stat(
    `${repoRootDir}/utils/cel-evaluator/cel-evaluator${process.platform === 'win32' ? '.exe' : ''}`
  ).catch(() => ({ mtimeMs: 0 }));

  let buildInvalid = binLastModified === 0;
  const buildOutdated = srcLastModified > binLastModified;

  if (buildInvalid || buildOutdated) {
    const { exitCode: goBuildExitCode } = await $`go build cel-evaluator.go`.cwd(
      `${repoRootDir}/utils/cel-evaluator`
    );
    buildInvalid = goBuildExitCode > 0;
  }

  if (buildInvalid) {
    // Bail out if Go build fails
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
