import { defaultFunctions } from './defaultFunctions';

type JL = (...args: unknown[]) => unknown;

describe('defaultFunctions', () => {
  const infix: [string, string][] = [
    ['add', '(a + b)'],
    ['subtract', '(a - b)'],
    ['multiply', '(a * b)'],
    ['divide', '(a / b)'],
  ];

  for (const [name, expected] of infix) {
    it(`${name} serializes infix for SQL and parameterized`, () => {
      const f = defaultFunctions[name];
      expect(f.sql!('a', 'b')).toBe(expected);
      expect(f.parameterized!('a', 'b')).toBe(expected);
    });
  }

  it('maps arithmetic to JSONLogic operators', () => {
    expect((defaultFunctions.add.jsonLogic as JL)('a', 'b')).toEqual({ '+': ['a', 'b'] });
    expect((defaultFunctions.subtract.jsonLogic as JL)('a', 'b')).toEqual({ '-': ['a', 'b'] });
    expect((defaultFunctions.multiply.jsonLogic as JL)('a', 'b')).toEqual({ '*': ['a', 'b'] });
    expect((defaultFunctions.divide.jsonLogic as JL)('a', 'b')).toEqual({ '/': ['a', 'b'] });
  });

  it('serializes abs in all formats', () => {
    expect(defaultFunctions.abs.sql!('x')).toBe('ABS(x)');
    expect(defaultFunctions.abs.parameterized!('x')).toBe('ABS(x)');
    expect((defaultFunctions.abs.jsonLogic as JL)('x')).toEqual({ abs: 'x' });
  });

  it('serializes variadic min/max in all formats', () => {
    expect(defaultFunctions.min.sql!('a', 'b')).toBe('LEAST(a, b)');
    expect(defaultFunctions.min.sql!('a', 'b', 'c')).toBe('LEAST(a, b, c)');
    expect(defaultFunctions.min.parameterized!('a', 'b')).toBe('LEAST(a, b)');
    expect((defaultFunctions.min.jsonLogic as JL)('a', 'b')).toEqual({ min: ['a', 'b'] });

    expect(defaultFunctions.max.sql!('a', 'b')).toBe('GREATEST(a, b)');
    expect(defaultFunctions.max.parameterized!('a', 'b', 'c')).toBe('GREATEST(a, b, c)');
    expect((defaultFunctions.max.jsonLogic as JL)('a', 'b')).toEqual({ max: ['a', 'b'] });
  });

  it('serializes binary mod in all formats', () => {
    expect(defaultFunctions.mod.arity).toBe(2);
    expect(defaultFunctions.mod.sql!('a', 'b')).toBe('(a % b)');
    expect(defaultFunctions.mod.parameterized!('a', 'b')).toBe('(a % b)');
    expect((defaultFunctions.mod.jsonLogic as JL)('a', 'b')).toEqual({ '%': ['a', 'b'] });
  });

  it('serializes unary upper/lower in all formats', () => {
    expect(defaultFunctions.upper.sql!('x')).toBe('UPPER(x)');
    expect(defaultFunctions.upper.parameterized!('x')).toBe('UPPER(x)');
    expect((defaultFunctions.upper.jsonLogic as JL)('x')).toEqual({ upper: 'x' });

    expect(defaultFunctions.lower.sql!('x')).toBe('LOWER(x)');
    expect(defaultFunctions.lower.parameterized!('x')).toBe('LOWER(x)');
    expect((defaultFunctions.lower.jsonLogic as JL)('x')).toEqual({ lower: 'x' });
  });
});
