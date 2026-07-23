import type {
  JSONataExpressionOperand,
  ParseJSONataExpressionContext,
} from '@react-querybuilder/core/parseJSONata';
import { defaultJSONataInverse, mergeJSONataInverse } from '../functions/jsonata';
import type { JSONataInverse } from '../functions/jsonata';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseJSONataExpression } from '../utils/parseJSONataExpression';

/** Collects the set of `fn` keys reachable through a {@link JSONataInverse} (the known set). */
const inverseKnownSet = (inverse: JSONataInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse.operators)) known[fn] = true;
  for (const fn of Object.values(inverse.functions)) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseJSONata!parseJSONata}. */
export type JSONataExpressionParser = (
  node: JSONataExpressionOperand,
  ctx: ParseJSONataExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for
 * {@link @react-querybuilder/core/parseJSONata!parseJSONata}. Pass `customInverse` to add
 * functions/operators or override built-ins (merged over {@link defaultJSONataInverse}), and
 * `customMeta` to supply arity metadata for custom functions. The returned handler builds an
 * {@link ExpressionNode} from a JSONata operand subtree and auto-validates it, returning `null`
 * (rule dropped) for unknown functions/operators or arity mismatches — the import-side mirror of
 * {@link getExpressionRuleProcessorJSONata}.
 */
export const getExpressionParserJSONata = (
  customInverse?: Partial<JSONataInverse>,
  customMeta?: ExpressionFunctionMetaRegistry
): JSONataExpressionParser => {
  const inverse = mergeJSONataInverse(defaultJSONataInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseJSONataExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use JSONata expression parser bound to {@link defaultJSONataInverse}. */
export const expressionParserJSONata: JSONataExpressionParser = getExpressionParserJSONata();
