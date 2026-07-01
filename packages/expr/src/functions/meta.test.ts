import { defaultFunctionMeta } from './meta';

describe('defaultFunctionMeta', () => {
  it('exposes UI labels and arities for every built-in function', () => {
    expect(Object.keys(defaultFunctionMeta).toSorted()).toEqual([
      'abs',
      'add',
      'divide',
      'lower',
      'max',
      'min',
      'mod',
      'multiply',
      'subtract',
      'upper',
    ]);
  });

  it('models the binary arithmetic operators with arity 2', () => {
    expect(defaultFunctionMeta.add).toEqual({ label: '+', arity: 2 });
    expect(defaultFunctionMeta.subtract).toEqual({ label: '-', arity: 2 });
    expect(defaultFunctionMeta.mod).toEqual({ label: 'MOD', arity: 2 });
  });

  it('models min/max as variadic (min 2 args)', () => {
    expect(defaultFunctionMeta.min.arity).toEqual([2, Infinity]);
    expect(defaultFunctionMeta.max.arity).toEqual([2, Infinity]);
  });

  it('models the unary functions with arity 1', () => {
    expect(defaultFunctionMeta.abs.arity).toBe(1);
    expect(defaultFunctionMeta.upper.arity).toBe(1);
    expect(defaultFunctionMeta.lower.arity).toBe(1);
  });
});
