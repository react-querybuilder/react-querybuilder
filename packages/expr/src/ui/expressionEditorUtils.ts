import type { OptionList } from '@react-querybuilder/core';
import { getFirstOption } from '@react-querybuilder/core';
import type {
  ExpressionFunctionMeta,
  ExpressionFunctionMetaRegistry,
  ExpressionNode,
} from '../types';

/** Node `kind` discriminants, for the kind selector. */
export type ExpressionNodeKind = ExpressionNode['kind'];

/**
 * Resolves how many argument slots a function exposes. Fixed arity (`number`) is used
 * verbatim; a `[min, max]` range clamps the current arg count into the range; an absent
 * arity falls back to the current count.
 */
export const arityCount = (arity: ExpressionFunctionMeta['arity'], current: number): number =>
  typeof arity === 'number'
    ? arity
    : Array.isArray(arity)
      ? Math.max(arity[0], Math.min(current, arity[1]))
      : current;

/**
 * Whether a function admits exactly one argument — i.e. is eligible as a left-hand side
 * wrapper around the rule's field. Fixed arity must equal `1`; a `[min, max]` range must
 * include `1`; absent arity is treated as variadic (eligible).
 */
export const isUnaryArity = (arity: ExpressionFunctionMeta['arity']): boolean =>
  typeof arity === 'number'
    ? arity === 1
    : Array.isArray(arity)
      ? arity[0] <= 1 && 1 <= arity[1]
      : true;

/** Builds a fresh default node of the given `kind`. */
export const defaultNode = (
  kind: ExpressionNodeKind,
  options: OptionList,
  meta?: ExpressionFunctionMetaRegistry
): ExpressionNode => {
  switch (kind) {
    case 'field':
      return { kind: 'field', field: getFirstOption(options) ?? '' };
    case 'value':
      return { kind: 'value', value: '' };
    default: {
      const fn = Object.keys(meta ?? {})[0] ?? '';
      const count = arityCount(meta?.[fn]?.arity, 0);
      return {
        kind: 'func',
        fn,
        args: Array.from({ length: count }, () => defaultNode('field', options)),
      };
    }
  }
};

/**
 * Seeds the right-hand-side node when a rule's value source switches to `expression`.
 * The RHS is always rooted at a function call (first registered function) with default
 * field arguments, giving the user an editable expression skeleton to fill in.
 */
export const rhsDefaultNode = (
  fields: OptionList,
  meta: ExpressionFunctionMetaRegistry
): ExpressionNode => defaultNode('func', fields, meta);

/**
 * Re-shapes a `func` node when its function changes: keeps existing args where the new
 * arity allows, filling any new slots with default field nodes.
 */
export const changeFunction = (
  fn: string,
  args: ExpressionNode[],
  fields: OptionList,
  meta: ExpressionFunctionMetaRegistry
): Extract<ExpressionNode, { kind: 'func' }> => {
  const count = arityCount(meta[fn]?.arity, args.length);
  return {
    kind: 'func',
    fn,
    args: Array.from({ length: count }, (_, i) => args[i] ?? defaultNode('field', fields)),
  };
};
