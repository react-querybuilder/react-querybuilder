/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import jsonata from 'jsonata';
import { fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorJSONata } from '../index';

// Evaluate each expression-bearing query against the shared `products` fixture using JSONata's
// predicate filter, then compare the matched id set. String-match ops now emit native
// `$contains`/`$substring` for expression operands, so the full case set (including
// like-operators) runs here.

// JSONata's `$exists` treats a JSON `null` value as present, unlike SQL where NULL is absent.
// Omit null `rating` keys so `null`/`notNull` match SQL semantics.
const jsonataProducts = products.map(p => {
  if (p.rating !== null) return p;
  const { rating: _rating, ...rest } = p;
  return rest;
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  test(testCaseName, async () => {
    const predicate = formatQuery(query, {
      format: 'jsonata',
      parseNumbers: true,
      fields,
      ruleProcessor: expressionRuleProcessorJSONata,
    });
    const expression = jsonata(`products[${predicate}]`);
    const result = (await expression.evaluate({ products: jsonataProducts })) ?? [];
    const matched = Array.isArray(result) ? result : [result];
    expect(matched.map(p => p.id)).toEqual(expectedIds);
  });
}
