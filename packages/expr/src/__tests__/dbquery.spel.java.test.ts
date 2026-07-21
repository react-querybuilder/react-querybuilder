import { formatQuery } from '@react-querybuilder/core';
import { verifySpELEvaluator } from '../../../../utils/spel-evaluator/verifySpELEvaluator';
import { fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorSpEL } from '../index';

// Real Spring/Java SpEL backend. Runs alongside the spel2js suite. Real Spring supports the full
// expr surface: `T(java.lang.Math).abs/min/max(...)` type references, null access (`rating == null`),
// and anchored-regex `matches` string ops (see #1061 / the expr processor fix). Field references are
// bare identifiers, resolved against the record Map via the Java MapAccessor.

const spelEvaluator = await verifySpELEvaluator();

if (spelEvaluator) {
  describe('SpEL (Java)', () => {
    for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const spel = formatQuery(query, {
          format: 'spel',
          fields,
          ruleProcessor: expressionRuleProcessorSpEL,
        });
        const matched = (await spelEvaluator({
          data: products,
          spel,
          typemap: {},
        })) as (typeof products)[number][];
        expect(matched.map(p => p.id)).toEqual(expectedIds);
      });
    }
  });
}
