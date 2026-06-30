import * as jsonLogic from 'json-logic-js';
import {
  jsonLogicExpressionOperators,
  registerJsonLogicExpressionOperators,
} from './jsonLogicOperators';

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

describe('registerJsonLogicExpressionOperators', () => {
  it('registers the built-in operators by default', () => {
    const add_operation = vi.fn();
    registerJsonLogicExpressionOperators({ add_operation });
    expect(add_operation).toHaveBeenCalledTimes(3);
    expect(add_operation).toHaveBeenCalledWith('abs', jsonLogicExpressionOperators.abs);
    expect(add_operation).toHaveBeenCalledWith('upper', jsonLogicExpressionOperators.upper);
    expect(add_operation).toHaveBeenCalledWith('lower', jsonLogicExpressionOperators.lower);
  });

  it('registers a custom operator record', () => {
    const add_operation = vi.fn();
    const pow = (base: unknown, exp: unknown) => Math.pow(Number(base), Number(exp));
    registerJsonLogicExpressionOperators({ add_operation }, { pow });
    expect(add_operation).toHaveBeenCalledTimes(1);
    expect(add_operation).toHaveBeenCalledWith('pow', pow);
  });

  it('produces operators a real json-logic instance can apply', () => {
    registerJsonLogicExpressionOperators(jsonLogic);
    expect(jsonLogic.apply({ abs: { var: 'x' } }, { x: -5 })).toBe(5);
    expect(jsonLogic.apply({ upper: { var: 's' } }, { s: 'abc' })).toBe('ABC');
    expect(jsonLogic.apply({ lower: { var: 's' } }, { s: 'ABC' })).toBe('abc');
  });
});
