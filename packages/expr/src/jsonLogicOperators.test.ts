import { add_operation, apply } from 'json-logic-js';
import { expressionJsonLogicOperators } from './dbqueryTestUtils';
import { jsonLogicExpressionOperators } from './jsonLogicOperators';

describe('jsonLogicExpressionOperators', () => {
  const { abs, upper, lower } = jsonLogicExpressionOperators;

  it('abs coerces and returns the absolute value', () => {
    expect(abs(-5)).toBe(5);
    expect(abs(5)).toBe(5);
    expect(abs('-7')).toBe(7);
    expect(abs('nope')).toBeNaN();
  });

  it('upper coerces to an uppercased string', () => {
    expect(upper('abc')).toBe('ABC');
    expect(upper(42)).toBe('42');
  });

  it('lower coerces to a lowercased string', () => {
    expect(lower('ABC')).toBe('abc');
    expect(lower(42)).toBe('42');
  });
});

describe('registered expressionJsonLogicOperators', () => {
  it('produces operators a real json-logic instance can apply', () => {
    for (const [op, func] of Object.entries(expressionJsonLogicOperators)) {
      add_operation(op, func);
    }
    expect(apply({ abs: { var: 'x' } }, { x: -5 })).toBe(5);
    expect(apply({ upper: { var: 's' } }, { s: 'abc' })).toBe('ABC');
    expect(apply({ lower: { var: 's' } }, { s: 'ABC' })).toBe('abc');
  });
});
