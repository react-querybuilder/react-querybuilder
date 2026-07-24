import type {
  MongoDBExpressionOperand,
  ParseMongoDBExpressionContext,
} from '@react-querybuilder/core/parseMongoDB';
import { defaultMongoDBInverse, mergeMongoDBInverse } from '../functions/mongodb';
import type { MongoDBInverse } from '../functions/mongodb';
import { mergeFunctionMeta } from '../registry';
import type { ExpressionFunctionMetaRegistry, ExpressionNode } from '../types';
import { parseMongoDBExpression } from '../utils/parseMongoDBExpression';

/** Collects the set of `fn` keys reachable through a {@link MongoDBInverse} (the known set). */
const inverseKnownSet = (inverse: MongoDBInverse): Record<string, true> => {
  const known: Record<string, true> = {};
  for (const fn of Object.values(inverse)) known[fn] = true;
  return known;
};

/** A `getExpression` handler for {@link @react-querybuilder/core/parseMongoDB!parseMongoDB}. */
export type MongoDBExpressionParser = (
  node: MongoDBExpressionOperand,
  ctx: ParseMongoDBExpressionContext
) => ExpressionNode | null;

/**
 * Generates a `getExpression` handler for
 * {@link @react-querybuilder/core/parseMongoDB!parseMongoDB}. Pass `customInverse` to add
 * operators or override built-ins (merged over {@link defaultMongoDBInverse}), and `customMeta`
 * to supply arity metadata for custom functions. The returned handler builds an
 * {@link ExpressionNode} from a MongoDB aggregation-expression operand and auto-validates it,
 * returning `null` (rule dropped) for unknown operators or arity mismatches — the import-side
 * mirror of {@link getExpressionRuleProcessorMongoDBQuery}.
 */
export const getExpressionParserMongoDB = (
  customInverse?: MongoDBInverse,
  customMeta?: ExpressionFunctionMetaRegistry
): MongoDBExpressionParser => {
  const inverse = mergeMongoDBInverse(defaultMongoDBInverse, customInverse);
  const meta = mergeFunctionMeta(customMeta);
  return parseMongoDBExpression(inverse, { functions: inverseKnownSet(inverse), meta });
};

/** Ready-to-use MongoDB expression parser bound to {@link defaultMongoDBInverse}. */
export const expressionParserMongoDB: MongoDBExpressionParser = getExpressionParserMongoDB();
