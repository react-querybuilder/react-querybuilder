import type {
  CELExpressionOperand,
  ParseCELExpressionContext,
} from '@react-querybuilder/core/parseCEL';
import { celTemplateFns, defaultCELInverse, mergeCELInverse } from '../functions/cel';
import type { CELInverse } from '../functions/cel';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseCELExpression } from '../utils/parseCELExpression';

/** Collects the set of `fn` keys reachable through a {@link CELInverse} (plus templates). */
const inverseKnownSet = (inverse: CELInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse.operators)) known[fn] = true;
  for (const fn of Object.values(inverse.functions)) known[fn] = true;
  for (const fn of celTemplateFns) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseCEL!parseCEL}. */
export type CELExpressionParser = (
  node: CELExpressionOperand,
  ctx: ParseCELExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for {@link @react-querybuilder/core/parseCEL!parseCEL}.
 * Pass `customInverse` to add arithmetic operators / function-call names or override built-ins
 * (merged over {@link defaultCELInverse}), and `customMeta` to supply arity metadata for custom
 * functions. The returned handler builds an {@link ExpressionNode} from a CEL operand subtree and
 * auto-validates it, returning `null` (rule dropped) for unknown operators/functions or arity
 * mismatches — the import-side mirror of {@link getExpressionRuleProcessorCEL}.
 *
 * Note: `abs`/`upper`/`lower` are not invertible — the CEL grammar cannot parse the constructs
 * their exporters emit.
 */
export const getExpressionParserCEL = (
  customInverse?: Partial<CELInverse>,
  customMeta?: ExpressionFunctionMetaRegistry
): CELExpressionParser => {
  const inverse = mergeCELInverse(defaultCELInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseCELExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use CEL expression parser bound to {@link defaultCELInverse}. */
export const expressionParserCEL: CELExpressionParser = getExpressionParserCEL();
