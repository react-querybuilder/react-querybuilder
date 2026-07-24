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
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseSpEL!parseSpEL}. */
export type SpELExpressionParser = (
  node: SpELExpressionOperand,
  ctx: ParseSpELExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for {@link @react-querybuilder/core/parseSpEL!parseSpEL}.
 * Pass `customInverse` to add arithmetic operators or override built-ins (merged over
 * {@link defaultSpELInverse}), and `customMeta` to supply arity metadata. The returned handler
 * builds an {@link ExpressionNode} from a SpEL operand subtree and auto-validates it, returning
 * `null` (rule dropped) for unknown operators or arity mismatches — the import-side mirror of
 * {@link getExpressionRuleProcessorSpEL}.
 *
 * Note: only arithmetic infix operands are supported; `abs`/`min`/`max`/`upper`/`lower` and custom
 * functions are not invertible (core's SpEL processing discards those nodes).
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
