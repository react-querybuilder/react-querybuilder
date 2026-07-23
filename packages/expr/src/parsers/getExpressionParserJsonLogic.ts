import type {
  JsonLogicExpressionOperand,
  ParseJsonLogicExpressionContext,
} from '@react-querybuilder/core/parseJsonLogic';
import { defaultJsonLogicInverse, mergeJsonLogicInverse } from '../functions/jsonLogic';
import type { JsonLogicInverse } from '../functions/jsonLogic';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseJsonLogicExpression } from '../utils/parseJsonLogicExpression';

/** Collects the set of `fn` keys reachable through a {@link JsonLogicInverse} (the known set). */
const inverseKnownSet = (inverse: JsonLogicInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse)) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseJsonLogic!parseJsonLogic}. */
export type JsonLogicExpressionParser = (
  node: JsonLogicExpressionOperand,
  ctx: ParseJsonLogicExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for
 * {@link @react-querybuilder/core/parseJsonLogic!parseJsonLogic}. Pass `customInverse` to add
 * operations or override built-ins (merged over {@link defaultJsonLogicInverse}), and
 * `customMeta` to supply arity metadata for custom functions. The returned handler builds an
 * {@link ExpressionNode} from a JsonLogic operand subtree and auto-validates it, returning
 * `null` (rule dropped) for unknown operations or arity mismatches — the import-side mirror of
 * {@link getExpressionRuleProcessorJsonLogic}.
 */
export const getExpressionParserJsonLogic = (
  customInverse?: JsonLogicInverse,
  customMeta?: ExpressionFunctionMetaRegistry
): JsonLogicExpressionParser => {
  const inverse = mergeJsonLogicInverse(defaultJsonLogicInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseJsonLogicExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use JsonLogic expression parser bound to {@link defaultJsonLogicInverse}. */
export const expressionParserJsonLogic: JsonLogicExpressionParser = getExpressionParserJsonLogic();
