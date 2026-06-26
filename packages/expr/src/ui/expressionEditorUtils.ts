import type { ExpressionNode } from '../types';
import type { ExpressionFunction, ExpressionFunctionRegistry } from '../types';

/** A selectable field option for the expression editor (identifier + display label). */
export interface ExpressionFieldOption {
  name: string;
  label: string;
}

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
  fields: ExpressionFieldOption[],
  registry?: ExpressionFunctionRegistry
): ExpressionNode => {
  switch (kind) {
    case 'field':
      return { kind: 'field', field: fields[0]?.name ?? '' };
    case 'value':
      return { kind: 'value', value: '' };
    default: {
      const fn = Object.keys(registry ?? {})[0] ?? '';
      const count = arityCount(registry?.[fn]?.arity, 0);
      return {
        kind: 'func',
        fn,
        args: Array.from({ length: count }, () => defaultNode('field', fields)),
      };
    }
  }
};

/**
 * Re-shapes a `func` node when its function changes: keeps existing args where the new
 * arity allows, filling any new slots with default field nodes.
 */
export const changeFunction = (
  fn: string,
  args: ExpressionNode[],
  fields: ExpressionFieldOption[],
  registry: ExpressionFunctionRegistry
): Extract<ExpressionNode, { kind: 'func' }> => {
  const count = arityCount(registry[fn]?.arity, args.length);
  return {
    kind: 'func',
    fn,
    args: Array.from({ length: count }, (_, i) => args[i] ?? defaultNode('field', fields)),
  };
};
