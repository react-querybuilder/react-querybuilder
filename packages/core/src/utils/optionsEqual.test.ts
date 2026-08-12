import { optionsEqual, valuesEqual } from './optionsEqual';

describe('valuesEqual', () => {
  it('compares primitives by value', () => {
    expect(valuesEqual(1, 1)).toBe(true);
    expect(valuesEqual('a', 'a')).toBe(true);
    expect(valuesEqual(Number.NaN, Number.NaN)).toBe(true);
    expect(valuesEqual(1, 2)).toBe(false);
    expect(valuesEqual(0, -0)).toBe(false);
    expect(valuesEqual(null, undefined)).toBe(false);
    expect(valuesEqual(null, {})).toBe(false);
    expect(valuesEqual({}, null)).toBe(false);
    expect(valuesEqual(1, {})).toBe(false);
  });

  it('compares arrays by value', () => {
    expect(valuesEqual([1, { a: 2 }], [1, { a: 2 }])).toBe(true);
    expect(valuesEqual([1, 2], [1, 2, 3])).toBe(false);
    expect(valuesEqual([1, 2], [1, 3])).toBe(false);
    expect(valuesEqual([1], { 0: 1, length: 1 })).toBe(false);
    expect(valuesEqual({ 0: 1, length: 1 }, [1])).toBe(false);
  });

  it('compares plain objects by value, recursively', () => {
    expect(valuesEqual({ a: { b: [1] } }, { a: { b: [1] } })).toBe(true);
    expect(valuesEqual({ a: 1 }, { a: 1, b: 2 })).toBe(false);
    expect(valuesEqual({ a: 1, b: 2 }, { a: 1 })).toBe(false);
    expect(valuesEqual({ a: 1 }, { a: 2 })).toBe(false);
    expect(valuesEqual(Object.create(null), Object.create(null))).toBe(true);
  });

  it('compares functions by identity', () => {
    const fn = () => 'x';
    expect(valuesEqual(fn, fn)).toBe(true);
    expect(valuesEqual(fn, () => 'x')).toBe(false);
    expect(valuesEqual({ fn }, { fn })).toBe(true);
    expect(valuesEqual({ fn }, { fn: () => 'x' })).toBe(false);
  });

  it('compares non-plain objects by identity', () => {
    const date = new Date(0);
    expect(valuesEqual(date, date)).toBe(true);
    // Distinct instances with no own enumerable keys would compare equal under a key-wise walk.
    expect(valuesEqual(new Date(0), new Date(0))).toBe(false);
    expect(valuesEqual(new Map(), new Map())).toBe(false);
    expect(valuesEqual(/a/, /a/)).toBe(false);
  });

  it('reports objects with different prototypes as unequal', () => {
    class Thing {
      a = 1;
    }
    expect(valuesEqual(new Thing(), { a: 1 })).toBe(false);
    expect(valuesEqual({ a: 1 }, Object.create(null))).toBe(false);
  });
});

describe('optionsEqual', () => {
  it('reports a rebuilt but structurally identical options object as equal', () => {
    const getDefaultValue = () => 'x';
    const build = () => ({
      fields: [{ name: 'f1', label: 'F1' }],
      history: { maxHistory: 10, coalesceMs: 250 },
      getDefaultValue,
    });

    expect(optionsEqual(build(), build())).toBe(true);
  });

  it('descends into nested option objects', () => {
    expect(optionsEqual({ history: { maxHistory: 10 } }, { history: { maxHistory: 3 } })).toBe(
      false
    );
  });

  it('handles undefined on either side', () => {
    expect(optionsEqual(undefined, undefined)).toBe(true);
    expect(optionsEqual(undefined, {})).toBe(false);
    expect(optionsEqual({}, undefined)).toBe(false);
  });
});
