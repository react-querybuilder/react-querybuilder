import type { ExpressionNode, RuleType, ValueProcessorOptions } from '@react-querybuilder/core';
import {
  lc,
  nullOrUndefinedOrEmpty,
  parseNumber,
  shouldRenderAsNumber,
  toArray,
} from '@react-querybuilder/core';
import { defaultFunctionMeta } from './functions/meta';
import type { ExpressionFunctionMetaRegistry, ResolvedExpressions } from './types';

/**
 * Merges one or more function-metadata registries (later entries win), defaulting the first
 * source to {@link defaultFunctionMeta} so callers extend the built-ins by default.
 */
export const mergeFunctionMeta = (
  ...registries: (ExpressionFunctionMetaRegistry | undefined)[]
): ExpressionFunctionMetaRegistry => Object.assign({}, defaultFunctionMeta, ...registries);

/**
 * Converts a non-expression `between`/`notBetween` value (array or comma-separated string)
 * into `value`/`field`/`parameter` leaf bounds, mirroring the stock processors: numeric
 * bounds are parsed (only when both qualify) unless `parseNumbers` is `false`, and parsed
 * bounds are ordered unless `preserveValueOrder` is set. Returns `{}` when either bound is
 * missing.
 */
const getLiteralBetweenBounds = (
  rule: RuleType,
  {
    parseNumbers,
    preserveValueOrder,
  }: Pick<ValueProcessorOptions, 'parseNumbers' | 'preserveValueOrder'>
): Pick<ResolvedExpressions, 'rhs' | 'rhs2'> => {
  const values = toArray(rule.value);
  if (values.length < 2 || nullOrUndefinedOrEmpty(values[0]) || nullOrUndefinedOrEmpty(values[1])) {
    return {};
  }
  if (rule.valueSource === 'field') {
    return {
      rhs: { kind: 'field', field: `${values[0]}` },
      rhs2: { kind: 'field', field: `${values[1]}` },
    };
  }
  if (rule.valueSource === 'parameter') {
    return {
      rhs: { kind: 'parameter', parameter: `${values[0]}` },
      rhs2: { kind: 'parameter', parameter: `${values[1]}` },
    };
  }
  const parse = parseNumbers !== false;
  const [a, b] = values;
  // Convert only if both bounds numeric; mixed pair keeps original types
  const numeric = shouldRenderAsNumber(a, parse) && shouldRenderAsNumber(b, parse);
  let [from, to] = (
    numeric
      ? [parseNumber(a, { parseNumbers: parse }), parseNumber(b, { parseNumbers: parse })]
      : [a, b]
  ) as [unknown, unknown];
  if (numeric && !preserveValueOrder && (to as number | bigint) < (from as number | bigint)) {
    [from, to] = [to, from];
  }
  return { rhs: { kind: 'value', value: from }, rhs2: { kind: 'value', value: to } };
};

/**
 * Resolves a rule's expression operands: `lhs` from `rule.lhs`, and the right-hand side
 * from `rule.value` when `valueSource` is `"expression"`. For `between`/`notBetween`
 * operators the value is a 2-tuple `[lower, upper]` split into `rhs`/`rhs2`; all other
 * operators carry a single `rhs`. When a `between`/`notBetween` rule has an `lhs` but plain
 * (value or field) bounds, the bounds are converted to leaf nodes in `rhs`/`rhs2` so the
 * range applies to the `lhs`. Returns `undefined` when the rule carries no expression on
 * either side.
 */
export const getRuleExpressions = (
  rule: RuleType,
  options: Pick<ValueProcessorOptions, 'parseNumbers' | 'preserveValueOrder'> = {}
): ResolvedExpressions | undefined => {
  const lhs = rule.lhs;
  const operator = lc(rule.operator);
  const between = operator === 'between' || operator === 'notbetween';

  if (rule.valueSource !== 'expression') {
    if (!lhs) return undefined;
    return between ? { lhs, ...getLiteralBetweenBounds(rule, options) } : { lhs };
  }

  if (between) {
    // Objects can't be comma-joined, so an expression between always stores a 2-tuple.
    const bounds = (Array.isArray(rule.value) ? rule.value : [rule.value]) as ExpressionNode[];
    const [rhs, rhs2] = bounds;
    return lhs || rhs || rhs2 ? { lhs, rhs, rhs2 } : undefined;
  }

  const rhs = rule.value as ExpressionNode;
  return lhs || rhs ? { lhs, rhs } : undefined;
};
