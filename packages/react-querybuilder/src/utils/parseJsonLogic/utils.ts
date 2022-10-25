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
  RQBJsonLogic,
  RQBJsonLogicEndsWith,
  RQBJsonLogicStartsWith,
  RQBJsonLogicVar,
} from '@react-querybuilder/ts/src/index.noReact';
import { isPojo } from '../parserUtils';
import type { JsonLogicBetweenExclusive, JsonLogicBetweenInclusive } from './types';

// Standard JsonLogic operations
export const isJsonLogicVar = (
  logic: RQBJsonLogic
): logic is JsonLogicVar<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && 'var' in logic;
export const isRQBJsonLogicVar = (logic: RQBJsonLogic): logic is RQBJsonLogicVar =>
  isJsonLogicVar(logic) && typeof logic.var === 'string';
export const isJsonLogicEqual = (logic: RQBJsonLogic): logic is JsonLogicEqual =>
  isPojo(logic) && '==' in logic;
export const isJsonLogicStrictEqual = (logic: RQBJsonLogic): logic is JsonLogicStrictEqual =>
  isPojo(logic) && '===' in logic;
export const isJsonLogicNotEqual = (logic: RQBJsonLogic): logic is JsonLogicNotEqual =>
  isPojo(logic) && '!=' in logic;
export const isJsonLogicStrictNotEqual = (logic: RQBJsonLogic): logic is JsonLogicStrictNotEqual =>
  isPojo(logic) && '!==' in logic;
export const isJsonLogicNegation = (logic: RQBJsonLogic): logic is JsonLogicNegation =>
  isPojo(logic) && '!' in logic;
export const isJsonLogicDoubleNegation = (logic: RQBJsonLogic): logic is JsonLogicDoubleNegation =>
  isPojo(logic) && '!!' in logic;
export const isJsonLogicOr = (
  logic: RQBJsonLogic
): logic is JsonLogicOr<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && 'or' in logic;
export const isJsonLogicAnd = (
  logic: RQBJsonLogic
): logic is JsonLogicAnd<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && 'and' in logic;
export const isJsonLogicGreaterThan = (
  logic: RQBJsonLogic
): logic is JsonLogicGreaterThan<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && '>' in logic;
export const isJsonLogicGreaterThanOrEqual = (
  logic: RQBJsonLogic
): logic is JsonLogicGreaterThanOrEqual<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && '>=' in logic;
export const isJsonLogicLessThan = (
  logic: RQBJsonLogic
): logic is JsonLogicLessThan<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && '<' in logic && logic['<'].length === 2;
export const isJsonLogicLessThanOrEqual = (
  logic: RQBJsonLogic
): logic is JsonLogicLessThanOrEqual<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && '<=' in logic && logic['<='].length === 2;
export const isJsonLogicInArray = (
  logic: RQBJsonLogic
): logic is JsonLogicInArray<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && 'in' in logic && Array.isArray(logic.in[1]);
export const isJsonLogicInString = (
  logic: RQBJsonLogic
): logic is JsonLogicInString<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
  isPojo(logic) && 'in' in logic && !Array.isArray(logic.in[1]);

// "Between" operations are special cases of '<' and '<='
export const isJsonLogicBetweenExclusive = (
  logic: RQBJsonLogic
): logic is JsonLogicBetweenExclusive =>
  isPojo(logic) && '<' in logic && Array.isArray(logic['<']) && logic['<'].length === 3;
export const isJsonLogicBetweenInclusive = (
  logic: RQBJsonLogic
): logic is JsonLogicBetweenInclusive =>
  isPojo(logic) && '<=' in logic && Array.isArray(logic['<=']) && logic['<='].length === 3;

// RQB extensions
export const isRQBJsonLogicStartsWith = (logic: RQBJsonLogic): logic is RQBJsonLogicStartsWith =>
  isPojo(logic) && 'startsWith' in logic;
export const isRQBJsonLogicEndsWith = (logic: RQBJsonLogic): logic is RQBJsonLogicEndsWith =>
  isPojo(logic) && 'endsWith' in logic;

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
// } from '@react-querybuilder/ts/src/index.noReact';
//
// export const isJsonLogicMissing = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMissing<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'missing' in logic;
// export const isJsonLogicMissingSome = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMissingSome<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'missing_some' in logic;
// export const isJsonLogicIf = (logic: RQBJsonLogic): logic is JsonLogicIf =>
//   isPojo(logic) && 'if' in logic;
// export const isJsonLogicMax = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMax<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'max' in logic;
// export const isJsonLogicMin = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMin<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'min' in logic;
// export const isJsonLogicSum = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSum<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && '+' in logic;
// export const isJsonLogicDifference = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicDifference<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && '-' in logic;
// export const isJsonLogicProduct = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicProduct<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && '*' in logic;
// export const isJsonLogicQuotient = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicQuotient<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && '/' in logic;
// export const isJsonLogicRemainder = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicRemainder<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && '%' in logic;
// export const isJsonLogicMap = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMap<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'map' in logic;
// export const isJsonLogicFilter = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicFilter<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'filter' in logic;
// export const isJsonLogicReduce = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicReduce<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'reduce' in logic;
// export const isJsonLogicAll = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicAll<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'all' in logic;
// export const isJsonLogicNone = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicNone<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'none' in logic;
// export const isJsonLogicSome = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSome<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'some' in logic;
// export const isJsonLogicMerge = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicMerge<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'merge' in logic;
// export const isJsonLogicCat = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicCat<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'cat' in logic;
// export const isJsonLogicSubstr = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicSubstr<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'substr' in logic;
// export const isJsonLogicLog = (
//   logic: RQBJsonLogic
// ): logic is JsonLogicLog<RQBJsonLogicStartsWith | RQBJsonLogicEndsWith> =>
//   isPojo(logic) && 'log' in logic;
