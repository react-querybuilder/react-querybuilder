import type {
  QueryValidator,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '@react-querybuilder/core';
import type { ExpressionNode, ResolvedExpressions } from '../types';
import { createExpressionValidator } from './createExpressionValidator';

/** The expr validator always yields a {@link ValidationMap}; narrow it for assertions. */
const run = (validate: QueryValidator, query: RuleGroupTypeAny): ValidationMap =>
  validate(query) as ValidationMap;

const field = (f: string): ExpressionNode => ({ kind: 'field', field: f });
const value = (v: unknown): ExpressionNode => ({ kind: 'value', value: v });
const fn = (name: string, ...args: ExpressionNode[]): ExpressionNode => ({
  kind: 'func',
  fn: name,
  args,
});

const rule = (
  over: Partial<RuleType> & { id?: string },
  { lhs, rhs }: ResolvedExpressions = {}
): RuleType => {
  const r = { field: '(expression)', operator: '=', value: '', ...over } as RuleType;
  if (lhs) r.lhs = lhs;
  if (rhs) {
    r.value = rhs;
    r.valueSource = 'expression';
  }
  return r;
};

const group = (...rules: RuleType[]): RuleGroupType => ({ combinator: 'and', rules });

describe('createExpressionValidator', () => {
  it('returns an empty map when every expression rule is valid', () => {
    const validate = createExpressionValidator();
    const query = group(
      rule({ id: 'a' }, { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100) }),
      rule({ id: 'b' }, { lhs: field('total') }),
      rule({ id: 'c' }, { rhs: fn('abs', field('balance')) }),
      // Plain rule with no expression operands -> nothing to validate.
      { id: 'plain', field: 'name', operator: '=', value: 'x' } as RuleType
    );
    expect(run(validate, query)).toEqual({});
  });

  it('flags an invalid lhs expression keyed by rule id', () => {
    const validate = createExpressionValidator();
    // `multiply` has fixed arity 2 but receives a single argument.
    const query = group(rule({ id: 'r1' }, { lhs: fn('multiply', field('x')) }));
    expect(run(validate, query)).toEqual({
      r1: { valid: false, reasons: [expect.stringMatching(/expects 2 argument/)] },
    });
  });

  it('flags an invalid rhs expression', () => {
    const validate = createExpressionValidator();
    // `add` needs 2 args; the single arg also has an empty field reference.
    const query = group(rule({ id: 'r2' }, { rhs: fn('add', field('')) }));
    expect(run(validate, query)).toEqual({
      r2: { valid: false, reasons: expect.arrayContaining(['Field reference is empty']) },
    });
  });

  it('merges custom functions so registered functions pass validation', () => {
    const customRule = group(rule({ id: 'p' }, { lhs: fn('pow', field('x'), value(2)) }));

    // Without the custom registry, `pow` is unknown.
    expect(run(createExpressionValidator(), customRule)).toEqual({
      p: { valid: false, reasons: ['Unknown function "pow"'] },
    });

    // With it, the rule validates cleanly.
    const validate = createExpressionValidator({ pow: { arity: 2 } });
    expect(run(validate, customRule)).toEqual({});
  });

  it('skips rules that lack an id', () => {
    const validate = createExpressionValidator();
    // Invalid expression but no id -> cannot be keyed, so it is omitted.
    const query = group(rule({}, { lhs: fn('multiply', field('x')) }));
    expect(run(validate, query)).toEqual({});
  });

  it('recurses into nested groups and ignores IC combinator strings', () => {
    const validate = createExpressionValidator();
    const query: RuleGroupTypeIC = {
      rules: [
        rule({ id: 'top' }, { lhs: fn('divide', field('x')) }),
        'and',
        { rules: [rule({ id: 'nested' }, { rhs: fn('subtract', field('y')) })] },
      ],
    };
    const result = run(validate, query);
    expect(Object.keys(result).toSorted()).toEqual(['nested', 'top']);
    expect(result).toMatchObject({ top: { valid: false }, nested: { valid: false } });
  });
});
