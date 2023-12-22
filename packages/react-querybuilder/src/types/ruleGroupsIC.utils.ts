// Get the list of odd numbers, plus zero
type MAXIMUM_ALLOWED_NUMBER = 45;
type MappedNumber<N extends number, Result extends Array<unknown> = []> = Result['length'] extends N
  ? Result
  : MappedNumber<N, [...Result, Result['length']]>;
// 0, 1, 2 ... 494
type NumberRange = MappedNumber<MAXIMUM_ALLOWED_NUMBER>[number];
type OddEnd = '1' | '3' | '5' | '7' | '9';
type IsOdd<T extends `${number}`> = T extends `${infer Int}${infer Rest}`
  ? Rest extends ''
    ? Int extends OddEnd
      ? true
      : false
    : Rest extends `${number}`
      ? IsOdd<Rest>
      : false
  : false;
type Compare<Num extends number> = Num extends number
  ? IsOdd<`${Num}`> extends true
    ? Num
    : never
  : never;
type OddRange = Compare<NumberRange>;
export type OddRangeWithZero = OddRange | 0;

/* istanbul ignore next */
export const isOddOrZero = (n: number): n is OddRangeWithZero => n >= 0 && (n === 0 || n % 2 === 1);

// Utility for repeating the rule(,combinator,rule)* pattern of the RuleGroupTypeIC types
type MAXIMUM_ALLOWED_BOUNDARY = 80;
export type MappedTuple<
  Tuple extends Array<unknown>,
  Result extends Array<unknown> = [],
  Count extends ReadonlyArray<number> = [],
> = Count['length'] extends MAXIMUM_ALLOWED_BOUNDARY
  ? Result
  : Tuple extends []
    ? []
    : Result extends []
      ? MappedTuple<Tuple, Tuple, [...Count, 1]>
      : MappedTuple<Tuple, Result | [...Result, ...Tuple], [...Count, 1]>;
