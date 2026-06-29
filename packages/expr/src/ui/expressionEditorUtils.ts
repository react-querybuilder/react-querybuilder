import type { OptionList, RuleType } from '@react-querybuilder/core';
import { getFirstOption } from '@react-querybuilder/core';
import type { FullField, Schema } from 'react-querybuilder';
import type { ExpressionFunction, ExpressionFunctionRegistry, ExpressionNode } from '../types';

/** Node `kind` discriminants, for the kind selector. */
export type ExpressionNodeKind = ExpressionNode['kind'];

/**
 * Resolves how many argument slots a function exposes. Fixed arity (`number`) is used
 * verbatim; a `[min, max]` range clamps the current arg count into the range; an absent
 * arity falls back to the current count.
 */
export const arityCount = (arity: ExpressionFunction['arity'], current: number): number =>
  typeof arity === 'number'
    ? arity
    : Array.isArray(arity)
      ? Math.max(arity[0], Math.min(current, arity[1]))
      : current;

/** Builds a fresh default node of the given `kind`. */
export const defaultNode = (
  kind: ExpressionNodeKind,
  options: OptionList,
  registry?: ExpressionFunctionRegistry
): ExpressionNode => {
  switch (kind) {
    case 'field':
      return { kind: 'field', field: getFirstOption(options) ?? '' };
    case 'value':
      return { kind: 'value', value: '' };
    default: {
      const fn = Object.keys(registry ?? {})[0] ?? '';
      const count = arityCount(registry?.[fn]?.arity, 0);
      return {
        kind: 'func',
        fn,
        args: Array.from({ length: count }, () => defaultNode('field', options)),
      };
    }
  }
};

/**
 * Seeds the initial right-hand-side node when a rule's value is toggled into expression
 * mode. Mirrors the rule's natural default by honoring the field's first configured
 * `valueSource`: `'field'` yields a field node naming a comparator-valid field, anything
 * else a value node carrying the field/operator default (field `defaultValue`, first
 * `values` option, `getDefaultValue` override, etc.) computed by `schema.getRuleDefaultValue`.
 */
export const rhsDefaultNode = (
  schema: Schema<FullField, string>,
  rule: RuleType
): ExpressionNode => {
  const fieldData = schema.fieldMap[rule.field] ?? ({} as FullField);
  const valueSource = getFirstOption(
    schema.getValueSources(rule.field, rule.operator, { fieldData })
  );
  const value = schema.getRuleDefaultValue({
    ...rule,
    valueSource: valueSource === 'field' ? 'field' : 'value',
  });
  return valueSource === 'field'
    ? { kind: 'field', field: typeof value === 'string' ? value : '' }
    : { kind: 'value', value };
};

/**
 * Re-shapes a `func` node when its function changes: keeps existing args where the new
 * arity allows, filling any new slots with default field nodes.
 */
export const changeFunction = (
  fn: string,
  args: ExpressionNode[],
  fields: OptionList,
  registry: ExpressionFunctionRegistry
): Extract<ExpressionNode, { kind: 'func' }> => {
  const count = arityCount(registry[fn]?.arity, args.length);
  return {
    kind: 'func',
    fn,
    args: Array.from({ length: count }, (_, i) => args[i] ?? defaultNode('field', fields)),
  };
};
