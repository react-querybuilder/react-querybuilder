import type {
  ParseSpELExpressionContext,
  SpELExpressionOperand,
} from '@react-querybuilder/core/parseSpEL';
import { defaultSpELInverse, mergeSpELInverse } from '../functions/spel';
import type { SpELInverse } from '../functions/spel';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseSpELExpression } from '../utils/parseSpELExpression';

/** Collects the set of `fn` keys reachable through a {@link SpELInverse}. */
const inverseKnownSet = (inverse: SpELInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse.operators)) known[fn] = true;
  for (const fn of Object.values(inverse.functions)) known[fn] = true;
  for (const fn of Object.values(inverse.methods)) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseSpEL!parseSpEL}. */
export type SpELExpressionParser = (
  node: SpELExpressionOperand,
  ctx: ParseSpELExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for {@link @react-querybuilder/core/parseSpEL!parseSpEL}.
 * Pass `customInverse` to add arithmetic operators, functions, or methods (or override built-ins;
 * merged over {@link defaultSpELInverse}), and `customMeta` to supply arity metadata. The returned
 * handler builds an {@link ExpressionNode} from a SpEL operand subtree and auto-validates it,
 * returning `null` (rule dropped) for unknown operators or arity mismatches — the import-side
 * mirror of {@link getExpressionRuleProcessorSpEL}.
 *
 * Note: `min`/`max` serialize as nested binary calls, so a re-imported `min`/`max` of three or more
 * arguments comes back as a nested pair of two-argument calls rather than a single variadic call.
 */
export const getExpressionParserSpEL = (
  customInverse?: Partial<SpELInverse>,
  customMeta?: ExpressionFunctionMetaRegistry
): SpELExpressionParser => {
  const inverse = mergeSpELInverse(defaultSpELInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseSpELExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use SpEL expression parser bound to {@link defaultSpELInverse}. */
export const expressionParserSpEL: SpELExpressionParser = getExpressionParserSpEL();
