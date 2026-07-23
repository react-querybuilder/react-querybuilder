import type {
  ParseSQLExpressionContext,
  SQLExpressionOperand,
} from '@react-querybuilder/core/parseSQL';
import { defaultSQLInverse, mergeSQLInverse } from '../functions/sql';
import type { SQLInverse } from '../functions/sql';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseSQLExpression } from '../utils/parseSQLExpression';

/** Collects the set of `fn` keys reachable through an {@link SQLInverse} (the known set). */
const inverseKnownSet = (inverse: SQLInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse.operators)) known[fn] = true;
  for (const fn of Object.values(inverse.functions)) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseSQL!parseSQL}. */
export type SQLExpressionParser = (
  node: SQLExpressionOperand,
  ctx: ParseSQLExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for {@link @react-querybuilder/core/parseSQL!parseSQL}.
 * Pass `customInverse` to add functions/operators or override built-ins (merged over
 * {@link defaultSQLInverse}), and `customMeta` to supply arity metadata for custom functions.
 * The returned handler builds an {@link ExpressionNode} from a SQL operand subtree and
 * auto-validates it, returning `null` (rule dropped) for unknown functions/operators or
 * arity mismatches — the import-side mirror of {@link getExpressionRuleProcessorSQL}.
 */
export const getExpressionParserSQL = (
  customInverse?: Partial<SQLInverse>,
  customMeta?: ExpressionFunctionMetaRegistry
): SQLExpressionParser => {
  const inverse = mergeSQLInverse(defaultSQLInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseSQLExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use SQL expression parser bound to {@link defaultSQLInverse}. */
export const expressionParserSQL: SQLExpressionParser = getExpressionParserSQL();
