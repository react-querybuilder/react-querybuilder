/* @vitest-environment node */

import type { RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { verifyCELEvaluator } from '../../../../utils/cel-evaluator/verifyCELEvaluator';
import { fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorCEL } from '../index';
import type { ExpressionNode } from '../types';

// Execute each expression-bearing query against the shared `products` fixture using the Go
// cel-go evaluator, which binds every row as the `item` map. Field references are therefore
// prefixed with `item.` before formatting. Cases exercise the full expression surface,
// including string-match ops with an expression RHS/LHS (`contains`/`beginsWith`/… now emit
// native `.contains()`/`.startsWith()`/`.endsWith()`).

const celEvaluator = await verifyCELEvaluator();

// The `id` and every referenced field must be typed for the evaluator. `rating` is omitted
// so its `null` values are skipped rather than crashing the type coercion.
const typemap = {
  id: 'number',
  name: 'string',
  price: 'number',
  qty: 'number',
  discount: 'number',
};
const data = products.map(({ rating: _rating, ...rest }) => rest);

// Excluded from execution (still covered by the unit/snapshot tests):
//  - `mod`/`rhsExpression`: mix an integer literal into arithmetic with a `double` field, for
//    which strict cel-go has no overload (`double % int`, `double * int`).
//  - `isNull`/`isNotNull`: the evaluator doesn't type the nullable `rating` column (parity
//    with the core CEL dbquery suite, which also skips null tests).
const excluded = new Set(['mod', 'rhsExpression', 'isNull', 'isNotNull']);

// Prefixes every field reference in an expression tree with `item.`.
const prefixNode = (node: ExpressionNode): ExpressionNode =>
  node.kind === 'field'
    ? { ...node, field: `item.${node.field}` }
    : node.kind === 'func'
      ? { ...node, args: node.args.map(prefixNode) }
      : node;

// Prefixes a rule's `field`, expression operands, and field-sourced value with `item.`.
const prefixRule = (rule: RuleType): RuleType => {
  const result = { ...rule } as RuleType;
  if (result.field && result.field !== '(expression)') result.field = `item.${result.field}`;
  if (result.lhs) result.lhs = prefixNode(result.lhs);
  if (result.valueSource === 'expression') {
    result.value = Array.isArray(result.value)
      ? result.value.map(prefixNode)
      : prefixNode(result.value);
  } else if (result.valueSource === 'field') {
    result.value = `item.${result.value}`;
  }
  return result;
};

if (celEvaluator) {
  for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
    // Excluded cases are covered by the unit/snapshot tests (see `excluded` above).
    if (excluded.has(testCaseName)) continue;
    test(testCaseName, async () => {
      const prefixed = { ...query, rules: query.rules.map(r => prefixRule(r as RuleType)) };
      const cel = formatQuery(prefixed, {
        format: 'cel',
        parseNumbers: true,
        fields,
        ruleProcessor: expressionRuleProcessorCEL,
      });
      const result = (await celEvaluator({ data, cel, typemap })) ?? [];
      const matched = (result as { id: number }[]).map(p => p.id).toSorted((a, b) => a - b);
      expect(matched).toEqual(expectedIds);
    });
  }
}
