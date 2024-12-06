import { $ } from 'bun';
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
  test.skip('CEL dbquery tests skipped - Go is not installed');
} else {
  const { exitCode: goBuildExitCode } = await $`go build cel-evaluator.go`.cwd(
    `${repoRootDir}/utils/cel-evaluator`
  );

  if (goBuildExitCode > 0) {
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
