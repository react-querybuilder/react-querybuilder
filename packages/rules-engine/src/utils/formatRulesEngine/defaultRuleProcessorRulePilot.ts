import {
  isValidValue,
  parseNumber,
  shouldRenderAsNumber,
  toArray,
  type RuleProcessor,
} from '@react-querybuilder/core';
import type { Condition, Constraint } from 'rulepilot';

/**
 * React Query Builder substring operators that the `"rulepilot"` export format cannot represent.
 * rulepilot's only string-matching operator, `matches`, builds the regular expression from the
 * runtime *fact* and tests it against the *rule* value (`new RegExp(fact).test(value)`)—the inverse
 * of what these operators require—so there is no faithful mapping. Rules using these operators are
 * skipped (treated as invalid) during export; see {@link defaultRuleGroupProcessorRulePilot}.
 *
 * @group Export
 */
export const rulePilotUnsupportedOperators: ReadonlySet<string> = new Set([
  'contains',
  'doesNotContain',
  'beginsWith',
  'doesNotBeginWith',
  'endsWith',
  'doesNotEndWith',
]);

const operatorMap: Record<string, Constraint['operator']> = {
  '=': '==',
  '!=': '!=',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
};

/**
 * Parses `between`/`notBetween` bounds into an ascending `[low, high]` pair, mirroring the
 * robustness of the `"native"` target's range logic: bounds may be supplied as an array
 * (`[lo, hi]`) or a comma-separated string (`"lo,hi"`); numeric bounds are parsed and reordered
 * ascending, non-numeric bounds keep the given order. Returns `null` when fewer than two valid
 * bounds are present (the rule is then skipped as invalid).
 */
const betweenBounds = (value: unknown): [Constraint['value'], Constraint['value']] | null => {
  const bounds = toArray(value, { retainEmptyStrings: true });
  if (bounds.length < 2 || !isValidValue(bounds[0]) || !isValidValue(bounds[1])) {
    return null;
  }
  const [first, second] = bounds;
  if (shouldRenderAsNumber(first, true) && shouldRenderAsNumber(second, true)) {
    const a = Number(parseNumber(first, { parseNumbers: 'strict' }));
    const b = Number(parseNumber(second, { parseNumbers: 'strict' }));
    return [Math.min(a, b), Math.max(a, b)];
  }
  return [first, second];
};

/**
 * Default rule processor for the `"rulepilot"` export format. Compiles a single React Query Builder
 * rule into a rulepilot {@link Constraint} (or a small {@link Condition} for range/null checks).
 *
 * Operators map as follows: `= != < <= > >=` to their rulepilot equivalents (`=`/`!=` become the
 * loose `==`/`!=`); `in`/`notIn` to `in`/`not in` with an array value; `between`/`notBetween` to a
 * `>=`/`<=` range (negated with `none` for `notBetween`); `null`/`notNull` to a `!= null` check
 * (wrapped in `none` for `null`). Operators rulepilot cannot represent—see
 * {@link rulePilotUnsupportedOperators}—and any unknown operator return `null`, signaling the group
 * processor to skip the rule.
 *
 * @group Export
 */
export const defaultRuleProcessorRulePilot: RuleProcessor = (
  rule,
  opts
): Constraint | Condition | null => {
  // rulepilot cannot represent these; skip the rule as invalid.
  if (rulePilotUnsupportedOperators.has(rule.operator)) {
    return null;
  }

  const { field, value } = rule;
  const parseNumbers = opts?.parseNumbers;
  const prep = (v: unknown): Constraint['value'] => parseNumber(v, { parseNumbers });

  switch (rule.operator) {
    case '=':
    case '!=':
    case '<':
    case '<=':
    case '>':
    case '>=':
      return { field, operator: operatorMap[rule.operator], value: prep(value) };

    case 'in':
    case 'notIn':
      return {
        field,
        operator: rule.operator === 'in' ? 'in' : 'not in',
        value: toArray(value).map((v): string | number => parseNumber(v, { parseNumbers })),
      };

    case 'between':
    case 'notBetween': {
      const bounds = betweenBounds(value);
      if (!bounds) return null;
      const inRange: Condition = {
        all: [
          { field, operator: '>=', value: bounds[0] },
          { field, operator: '<=', value: bounds[1] },
        ],
      };
      return rule.operator === 'between' ? inRange : { none: [inRange] };
    }

    case 'null':
      return { none: [{ field, operator: '!=', value: null }] };

    case 'notNull':
      return { field, operator: '!=', value: null };

    // Any other (unknown) operator is skipped as invalid.
    default:
      return null;
  }
};
