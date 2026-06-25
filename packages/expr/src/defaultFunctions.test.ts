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
    expect((defaultFunctions.abs.jsonLogic as JL)('x')).toEqual({ abs: ['x'] });
  });
});
