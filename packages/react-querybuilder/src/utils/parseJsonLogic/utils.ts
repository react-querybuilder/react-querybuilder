import type {
  JsonLogicAnd,
  JsonLogicDoubleNegation,
  JsonLogicEqual,
  JsonLogicGreaterThan,
  JsonLogicGreaterThanOrEqual,
  JsonLogicInArray,
  JsonLogicInString,
  JsonLogicLessThan,
  JsonLogicLessThanOrEqual,
  JsonLogicNegation,
  JsonLogicNotEqual,
  JsonLogicOr,
  JsonLogicStrictEqual,
  JsonLogicStrictNotEqual,
  JsonLogicVar,
} from 'json-logic-js';
import type {
  RQBJsonLogic,
  RQBJsonLogicEndsWith,
  RQBJsonLogicStartsWith,
  RQBJsonLogicVar,
} from '../../types/index.noReact';

// Standard JsonLogic operations
export const isJsonLogicVar = (
  logic: RQBJsonLogic
): logic is JsonLogicVar<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && 'var' in logic;
export const isRQBJsonLogicVar = (logic: RQBJsonLogic): logic is RQBJsonLogicVar =>
  isJsonLogicVar(logic) && typeof logic.var === 'string';
export const isJsonLogicEqual = (logic: RQBJsonLogic): logic is JsonLogicEqual =>
  typeof logic === 'object' && '==' in logic;
export const isJsonLogicStrictEqual = (logic: RQBJsonLogic): logic is JsonLogicStrictEqual =>
  typeof logic === 'object' && '===' in logic;
export const isJsonLogicNotEqual = (logic: RQBJsonLogic): logic is JsonLogicNotEqual =>
  typeof logic === 'object' && '!=' in logic;
export const isJsonLogicStrictNotEqual = (logic: RQBJsonLogic): logic is JsonLogicStrictNotEqual =>
  typeof logic === 'object' && '!==' in logic;
export const isJsonLogicNegation = (logic: RQBJsonLogic): logic is JsonLogicNegation =>
  typeof logic === 'object' && '!' in logic;
export const isJsonLogicDoubleNegation = (logic: RQBJsonLogic): logic is JsonLogicDoubleNegation =>
  typeof logic === 'object' && '!!' in logic;
export const isJsonLogicOr = (
  logic: RQBJsonLogic
): logic is JsonLogicOr<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && 'or' in logic;
export const isJsonLogicAnd = (
  logic: RQBJsonLogic
): logic is JsonLogicAnd<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && 'and' in logic;
export const isJsonLogicGreaterThan = (
  logic: RQBJsonLogic
): logic is JsonLogicGreaterThan<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && '>' in logic;
export const isJsonLogicGreaterThanOrEqual = (
  logic: RQBJsonLogic
): logic is JsonLogicGreaterThanOrEqual<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && '>=' in logic;
export const isJsonLogicLessThan = (
  logic: RQBJsonLogic
): logic is JsonLogicLessThan<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && '<' in logic;
export const isJsonLogicLessThanOrEqual = (
  logic: RQBJsonLogic
): logic is JsonLogicLessThanOrEqual<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && '<=' in logic;
export const isJsonLogicInArray = (
  logic: RQBJsonLogic
): logic is JsonLogicInArray<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && 'in' in logic && Array.isArray(logic.in[1]);
export const isJsonLogicInString = (
  logic: RQBJsonLogic
): logic is JsonLogicInString<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  typeof logic === 'object' && 'in' in logic && !Array.isArray(logic.in[1]);

// RQB extensions
export const isRQBJsonLogicStartsWith = (logic: RQBJsonLogic): logic is RQBJsonLogicStartsWith =>
  typeof logic == 'object' && 'startsWith' in logic;
export const isRQBJsonLogicEndsWith = (logic: RQBJsonLogic): logic is RQBJsonLogicEndsWith =>
  typeof logic == 'object' && 'endsWith' in logic;

// Type guards for unused JsonLogic operations

// import type {
//   JsonLogicAll,
//   JsonLogicCat,
//   JsonLogicDifference,
//   JsonLogicFilter,
//   JsonLogicIf,
//   JsonLogicLog,
//   JsonLogicMap,
//   JsonLogicMax,
//   JsonLogicMerge,
//   JsonLogicMin,
//   JsonLogicMissing,
//   JsonLogicMissingSome,
//   JsonLogicNone,
//   JsonLogicProduct,
//   JsonLogicQuotient,
//   JsonLogicReduce,
//   JsonLogicRemainder,
//   JsonLogicSome,
//   JsonLogicSubstr,
//   JsonLogicSum,
// } from 'json-logic-js';
//
// export const isJsonLogicMissing = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMissing<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'missing' in logic;
// export const isJsonLogicMissingSome = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMissingSome<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'missing_some' in logic;
// export const isJsonLogicIf = (logic: RQBJsonLogic): logic is JsonLogicIf =>
//   typeof logic === 'object' && 'if' in logic;
// export const isJsonLogicMax = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMax<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'max' in logic;
// export const isJsonLogicMin = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMin<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'min' in logic;
// export const isJsonLogicSum = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSum<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && '+' in logic;
// export const isJsonLogicDifference = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicDifference<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && '-' in logic;
// export const isJsonLogicProduct = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicProduct<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && '*' in logic;
// export const isJsonLogicQuotient = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicQuotient<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && '/' in logic;
// export const isJsonLogicRemainder = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicRemainder<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && '%' in logic;
// export const isJsonLogicMap = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMap<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'map' in logic;
// export const isJsonLogicFilter = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicFilter<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'filter' in logic;
// export const isJsonLogicReduce = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicReduce<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'reduce' in logic;
// export const isJsonLogicAll = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicAll<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'all' in logic;
// export const isJsonLogicNone = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicNone<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'none' in logic;
// export const isJsonLogicSome = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSome<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'some' in logic;
// export const isJsonLogicMerge = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMerge<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'merge' in logic;
// export const isJsonLogicCat = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicCat<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'cat' in logic;
// export const isJsonLogicSubstr = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSubstr<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'substr' in logic;
// export const isJsonLogicLog = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicLog<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   typeof logic === 'object' && 'log' in logic;
