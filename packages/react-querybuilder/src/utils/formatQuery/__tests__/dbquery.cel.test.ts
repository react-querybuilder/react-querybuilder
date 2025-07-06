import { verifyCELEvaluator } from '../../../../../../utils/cel-evaluator/verifyCELEvaluator';
import { transformQuery } from '../../transformQuery';
import {
  augmentedSuperUsers,
  dbTests,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const celEvaluator = await verifyCELEvaluator();

const typemap = {
  firstName: 'string',
  lastName: 'string',
  enhanced: 'boolean',
  madeUpName: 'string',
  nickname: 'string',
  powerUpAge: 'number',
};
const augmentedTypemap = {
  ...typemap,
  nicknames: 'list',
  // earlyPencilers: 'list',
};

if (celEvaluator) {
  describe('CEL', () => {
    describe('common', () => {
      const data = superUsers('cel');
      for (const [name, { query: originalQuery, expectedResult, fqOptions }] of Object.entries(
        dbTests(data)
        // CEL evaluator doesn't play well with nulls yet
      ).filter(([name]) => name !== 'null/notNull')) {
        const query = transformQuery(originalQuery, {
          ruleProcessor: r => ({ ...r, field: `item.${r.field}` }),
        });
        test(name, async () => {
          const cel = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
            ...fqOptions,
          });
          const result = await celEvaluator({ data, cel, typemap });
          expect(result).toEqual(expectedResult.length > 0 ? expectedResult : null);
        });
      }
    });

    describe('match modes', () => {
      const data = augmentedSuperUsers('cel').map(u =>
        Object.fromEntries(Object.entries(u).filter(([k]) => !k.startsWith('early')))
      );
      for (const [name, mm, fn] of matchModeTests.strings) {
        const query = transformQuery(genStringsMatchQuery(mm), {
          ruleProcessor: r => ({ ...r, field: `item.${r.field}` }),
        });
        test(name, async () => {
          const cel = formatQuery(query, {
            format: 'cel',
            parseNumbers: true,
          });
          const result = await celEvaluator({ data, cel, typemap: augmentedTypemap });
          // oxlint-disable-next-line typescript/no-explicit-any
          const expectedResult = data.filter((d: any) => fn(d));
          expect(result).toEqual(expectedResult.length > 0 ? expectedResult : null);
        });
      }
    });
  });
}
