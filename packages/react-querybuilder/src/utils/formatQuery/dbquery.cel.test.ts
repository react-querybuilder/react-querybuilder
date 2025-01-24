import { verifyCELEvaluator } from '../../../../../utils/cel-evaluator/verifyCELEvaluator';
import { transformQuery } from '../transformQuery';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const celEvaluator = await verifyCELEvaluator();

const typemap = {
  firstName: 'string',
  lastName: 'string',
  enhanced: 'boolean',
  madeUpName: 'string',
  powerUpAge: 'number',
};

if (celEvaluator) {
  describe('CEL', () => {
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
}
