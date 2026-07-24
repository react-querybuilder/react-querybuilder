export type MongoDbSupportedOperators =
  | '$and'
  | '$or'
  | '$not'
  | '$eq'
  | '$gt'
  | '$gte'
  | '$in'
  | '$lt'
  | '$lte'
  | '$ne'
  | '$nin'
  | '$regex'
  | '$expr';

/**
 * A MongoDB aggregation-expression operand that {@link parseMongoDB!ParseMongoDbOptions.getExpression}
 * may receive — an aggregation-operator object (`{ $add: [...] }`, `{ $abs: x }`, etc.), a
 * `"$field"` path reference, or a literal.
 */
export type MongoDBExpressionOperand = unknown;

/** Context passed to {@link parseMongoDB!ParseMongoDbOptions.getExpression}. */
export interface ParseMongoDBExpressionContext {
  /** Returns `true` if the field is configured (or if no `fields` were supplied). */
  fieldExists: (fieldName: string) => boolean;
}
