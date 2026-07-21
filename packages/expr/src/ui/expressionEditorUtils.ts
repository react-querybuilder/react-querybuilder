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
 * Whether a function can wrap the governing field on the left-hand side — i.e. it accepts
 * at least one argument (arg 0 holds the field). Fixed arity must be `>= 1`; a `[min, max]`
 * range must allow `>= 1` (`max >= 1`); absent arity is unconstrained (eligible). Only a
 * fixed arity of `0` (or a range capped at `0`) is excluded.
 */
export const admitsLHSArg = (arity: ExpressionFunctionMeta['arity']): boolean =>
  typeof arity === 'number' ? arity >= 1 : Array.isArray(arity) ? arity[1] >= 1 : true;

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

/**
 * Builds the left-hand-side wrapper node `fn(field, …args)`. Argument 0 is always the
 * governing `field` (which still drives operator/value/validation); arguments 1…N are the
 * function's remaining operands, preserved from `existingArgs` where the new arity allows and
 * otherwise seeded with default field nodes. At least the governing field arg is guaranteed,
 * even for a nominally zero-arity function.
 */
export const lhsFuncNode = (
  fn: string,
  field: string,
  existingArgs: ExpressionNode[],
  fields: OptionList,
  meta: ExpressionFunctionMetaRegistry
): Extract<ExpressionNode, { kind: 'func' }> => {
  const fieldNode: ExpressionNode = { kind: 'field', field };
  // Re-shape to the new arity: pin arg 0 to the governing field, keep any extra operands.
  const node = changeFunction(fn, [fieldNode, ...existingArgs.slice(1)], fields, meta);
  return node.args.length > 0 ? node : { kind: 'func', fn, args: [fieldNode] };
};
