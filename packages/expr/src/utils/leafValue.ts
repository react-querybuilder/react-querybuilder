import { parseNumber, shouldRenderAsNumber } from '@react-querybuilder/core';
import type { ExpressionNode } from '../types';

type ValueNode = Extract<ExpressionNode, { kind: 'value' }>;

/**
 * Whether a `value` leaf should be rendered as a number: either explicitly typed
 * `'number'` or already a numeric JS type. Used to force number rendering even when
 * the format options don't enable `parseNumbers` (expressions are usually numeric).
 */
export const isNumericLeaf = (node: ValueNode): boolean =>
  node.valueType === 'number' || typeof node.value === 'number' || typeof node.value === 'bigint';

/**
 * Coerces a `value` leaf to the value that should be bound/emitted: a `number` when
 * appropriate (numeric-typed leaf or `parseNumbers` enabled), otherwise the raw value.
 */
export const coerceLeafValue = (node: ValueNode, parseNumbers?: boolean): unknown => {
  const pn = isNumericLeaf(node) ? true : parseNumbers;
  return shouldRenderAsNumber(node.value, pn)
    ? parseNumber(node.value, { parseNumbers: pn })
    : node.value;
};
