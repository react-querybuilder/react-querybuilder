import { formatQuery } from '@react-querybuilder/core';
import { spel2jsEvaluator } from '../../../../utils/spel-evaluator/spel2jsEvaluator';
import { fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorSpEL } from '../index';

// spel2js (Phase 1 backend) is a partial JS port of SpEL and cannot evaluate two families of
// output the expr SpEL serializer produces. These are excluded here; Phase 2 (real Spring/Java)
// will cover them:
//   - `T(java.lang.Math).abs/min/max(...)` Java type references (abs, min, max, between, notBetween)
//   - null-property access (`rating == null`), which spel2js throws on (isNull, isNotNull)
// Field references are plain identifiers (resolved against the record root by spel2js). Emitting
// indexer syntax for expr output would require a bespoke serializer option (see plan doc).
const unsupportedBySpel2js = new Set([
  'abs',
  'min',
  'max',
  'between',
  'notBetween',
  'isNull',
  'isNotNull',
]);

describe('SpEL (spel2js)', () => {
  for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
    if (unsupportedBySpel2js.has(testCaseName)) continue;
    test(testCaseName, async () => {
      const spel = formatQuery(query, {
        format: 'spel',
        fields,
        ruleProcessor: expressionRuleProcessorSpEL,
      });
      const matched = (await spel2jsEvaluator({
        data: products,
        spel,
        typemap: {},
      })) as (typeof products)[number][];
      expect(matched.map(p => p.id)).toEqual(expectedIds);
    });
  }
});
