/**
 * Converts a JSONata string expression into a {@link index!DefaultRuleGroupType DefaultRuleGroupType}
 * or {@link index!DefaultRuleGroupTypeIC DefaultRuleGroupTypeIC}.
 *
 * @module parseJSONata
 */

export * from './parseJSONata';
export * from './types';
export {
  getFieldFromPath,
  getValidValue,
  isJSONataBoolean,
  isJSONataExpressionOperand,
  isJSONataIdentifier,
  isJSONataList,
  isJSONataNull,
  isJSONataNumber,
  isJSONataString,
} from './utils';
