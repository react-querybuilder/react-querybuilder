import { $ } from 'bun';
import path from 'node:path';
import { verifyCELEvaluator } from '../../../../../utils/cel-evaluator/verifyCELEvaluator';
import { transformQuery } from '../transformQuery';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const repoRootDir = path.join(import.meta.dir, '../../../../..');
const celEvaluatorDir = `${repoRootDir}/utils/cel-evaluator`;
$.nothrow();
$.cwd(repoRootDir);

if (await verifyCELEvaluator()) {
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
          await $`${celEvaluatorDir}/cel-evaluator ${JSON.stringify(superUsersCEL)} ${queryAsCEL}`.text();
        expect(JSON.parse(result)).toEqual(expectedResult);
      });
    });
  }
}
