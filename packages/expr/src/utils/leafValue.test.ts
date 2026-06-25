import type { ExpressionNode } from '../types';
import { coerceLeafValue, isNumericLeaf } from './leafValue';

type ValueNode = Extract<ExpressionNode, { kind: 'value' }>;
const v = (value: unknown, valueType?: string): ValueNode => ({ kind: 'value', value, valueType });

describe('isNumericLeaf', () => {
  it('is true for number and bigint values', () => {
    expect(isNumericLeaf(v(5))).toBe(true);
    expect(isNumericLeaf(v(5n))).toBe(true);
  });

  it('is true when valueType is "number"', () => {
    expect(isNumericLeaf(v('5', 'number'))).toBe(true);
  });

  it('is false for plain strings', () => {
    expect(isNumericLeaf(v('5'))).toBe(false);
    expect(isNumericLeaf(v('foo'))).toBe(false);
  });
});

describe('coerceLeafValue', () => {
  it('returns numeric JS values as-is', () => {
    expect(coerceLeafValue(v(5))).toBe(5);
    expect(coerceLeafValue(v(5n))).toBe(5n);
  });

  it('parses numeric-typed strings to numbers', () => {
    expect(coerceLeafValue(v('5', 'number'))).toBe(5);
  });

  it('returns a numeric-typed non-numeric string unchanged', () => {
    expect(coerceLeafValue(v('foo', 'number'))).toBe('foo');
  });

  it('parses plain strings only when parseNumbers is enabled', () => {
    expect(coerceLeafValue(v('5'))).toBe('5');
    expect(coerceLeafValue(v('5'), true)).toBe(5);
  });

  it('leaves non-numeric strings untouched even with parseNumbers', () => {
    expect(coerceLeafValue(v('foo'), true)).toBe('foo');
  });
});
