import { isValidValue, parseNumber, shouldRenderAsNumber, toArray } from '@react-querybuilder/core';

/**
 * Determines whether `factVal` falls within the inclusive range described by `compareVal`, mirroring
 * the robustness of the `"between"` handling in {@link react-querybuilder!formatQuery formatQuery}.
 * The bounds may be supplied as an array (`[lo, hi]`) or a comma-separated string (`"lo,hi"`).
 * Numeric bounds are parsed and reordered ascending; non-numeric bounds compare lexicographically
 * in the order given. Returns `null` when fewer than two valid bounds are present.
 */
export const inRange = (factVal: unknown, compareVal: unknown): boolean | null => {
  const bounds = toArray(compareVal, { retainEmptyStrings: true });
  if (bounds.length < 2 || !isValidValue(bounds[0]) || !isValidValue(bounds[1])) {
    return null;
  }
  const [first, second] = bounds;
  if (shouldRenderAsNumber(first, true) && shouldRenderAsNumber(second, true)) {
    const a = Number(parseNumber(first, { parseNumbers: 'strict' }));
    const b = Number(parseNumber(second, { parseNumbers: 'strict' }));
    const f = Number(factVal);
    return f >= Math.min(a, b) && f <= Math.max(a, b);
  }
  const f = `${factVal}`;
  return f >= `${first}` && f <= `${second}`;
};

/**
 * Looks up `path` in a fact object. An exact key match wins (so flat keys that literally contain
 * dots still work); otherwise the path is traversed segment-by-segment (`"profile.age"`).
 */
export const getFactValue = (facts: unknown, path: string): unknown => {
  if (facts !== null && typeof facts === 'object' && Object.hasOwn(facts, path)) {
    return (facts as Record<string, unknown>)[path];
  }
  let current: unknown = facts;
  for (const segment of path.split('.')) {
    if (current === null || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
};

const includesLoose = (haystack: unknown, needle: unknown): boolean => {
  const arr = toArray(haystack, { retainEmptyStrings: true });
  return arr.some(v => v === needle || `${v}` === `${needle}`);
};

/**
 * Evaluators for every React Query Builder default operator, comparing a fact value against the
 * value stored on a rule. Used by the `"native"` and `"node-rules"` export targets to evaluate
 * antecedents in process. Unknown operators evaluate to `false`.
 *
 * @group Export
 */
export const nativeOperators: Record<string, (factVal: unknown, compareVal: unknown) => boolean> = {
  '=': (a, b) => a === b,
  '!=': (a, b) => a !== b,
  '<': (a, b) => (a as number) < (b as number),
  '<=': (a, b) => (a as number) <= (b as number),
  '>': (a, b) => (a as number) > (b as number),
  '>=': (a, b) => (a as number) >= (b as number),
  contains: (a, b) => `${a}`.includes(`${b}`),
  doesNotContain: (a, b) => !`${a}`.includes(`${b}`),
  beginsWith: (a, b) => `${a}`.startsWith(`${b}`),
  doesNotBeginWith: (a, b) => !`${a}`.startsWith(`${b}`),
  endsWith: (a, b) => `${a}`.endsWith(`${b}`),
  doesNotEndWith: (a, b) => !`${a}`.endsWith(`${b}`),
  null: a => a === null || a === undefined,
  notNull: a => a !== null && a !== undefined,
  in: (a, b) => includesLoose(b, a),
  notIn: (a, b) => !includesLoose(b, a),
  between: (a, b) => inRange(a, b) === true,
  notBetween: (a, b) => inRange(a, b) === false,
};
