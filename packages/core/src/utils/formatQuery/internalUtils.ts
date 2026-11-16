import { trimIfString } from '../arrayUtils';
import { lc } from '../misc';
import { getLikeWildcards, shouldRenderAsNumber } from './utils';

// Internal helpers (not re-exported).

/**
 * Returns the ` escape '\'` clause for `LIKE` expressions when `escapeLikeWildcards` is set and
 * the rule is a string-match operator w/ a literal value (`valueSource` "value"), else `''`.
 * MySQL string literals need the backslash doubled.
 *
 * @internal
 */
export const getLikeEscapeClause = (
  rule: { operator: string; valueSource?: string },
  { escapeLikeWildcards, preset }: { escapeLikeWildcards?: boolean; preset?: string } = {}
): string =>
  escapeLikeWildcards &&
  (rule.valueSource ?? 'value') === 'value' &&
  getLikeWildcards(lc(rule.operator)).some(Boolean)
    ? ` escape '${preset === 'mysql' ? '\\\\' : '\\'}'`
    : '';

/**
 * Returns the first two values of a "between"/"notBetween" rule, swapped into ascending order
 * when both render as numbers and `preserveValueOrder` is falsy. Values are otherwise untouched.
 *
 * @internal
 */
export const orderBetweenValues = (
  values: unknown[],
  { parseNumbers, preserveValueOrder }: { parseNumbers?: boolean; preserveValueOrder?: boolean }
): [unknown, unknown] => {
  const [first, second] = values;
  if (preserveValueOrder) return [first, second];
  const toNum = (v: unknown): number | bigint =>
    typeof v === 'bigint'
      ? v
      : typeof v === 'number' || shouldRenderAsNumber(v, parseNumbers)
        ? Number(trimIfString(v))
        : Number.NaN;
  return toNum(second) < toNum(first) ? [second, first] : [first, second];
};
