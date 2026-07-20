/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import {
  add,
  and,
  createCollection,
  divide,
  eq,
  gt,
  gte,
  isNull,
  localOnlyCollectionOptions,
  lower,
  lt,
  lte,
  multiply,
  not,
  or,
  queryOnce,
  subtract,
  upper,
} from '@tanstack/db';
import { fields, numericTestCases, products } from '../dbqueryTestUtils';
import { expressionRuleProcessorTanStackDB } from '../index';

// TanStack DB has no scalar `abs`/`mod` and treats `min`/`max` as aggregates, so those
// functions (and the `between` cases whose bounds use them) are unsupported. Restrict to the
// arithmetic/`upper`/`lower`/null cases. String-match cases are already excluded via
// `numericTestCases`.
const unsupported = new Set(['abs', 'mod', 'min', 'max', 'between', 'notBetween']);

const tanStackDbOperators = {
  add,
  and,
  divide,
  eq,
  gt,
  gte,
  isNull,
  lower,
  lt,
  lte,
  multiply,
  not,
  or,
  subtract,
  upper,
};

const collection = createCollection(
  localOnlyCollectionOptions({ getKey: ({ id }) => id, initialData: products })
);

for (const [testCaseName, [query, expectedIds]] of Object.entries(numericTestCases)) {
  if (unsupported.has(testCaseName)) continue;
  test(testCaseName, async () => {
    const where = formatQuery(query, {
      format: 'tanstack_db',
      fields,
      ruleProcessor: expressionRuleProcessorTanStackDB,
      context: { tanStackDbOperators },
    });
    const result = await queryOnce(q =>
      q
        .from({ p: collection })
        .where(where)
        .orderBy(({ p }) => p.id)
    );
    expect(result.map(p => p.id)).toEqual(expectedIds);
  });
}
