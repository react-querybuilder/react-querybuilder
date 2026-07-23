import { formatQuery } from '@react-querybuilder/core';
import { parseSQL } from '@react-querybuilder/core/parseSQL';
import type {
  ParseSQLExpressionContext,
  SQLExpressionOperand,
} from '@react-querybuilder/core/parseSQL';
import { expressionRuleProcessorSQL } from '../index';
import { expressionParserSQL, getExpressionParserSQL } from './getExpressionParserSQL';

const fields = [
  { name: 'price', value: 'price', label: 'Price' },
  { name: 'cost', value: 'cost', label: 'Cost' },
  { name: 'quantity', value: 'quantity', label: 'Quantity' },
  { name: 'a', value: 'a', label: 'A' },
  { name: 'b', value: 'b', label: 'B' },
  { name: 'x', value: 'x', label: 'X' },
];
const opt = { getExpression: expressionParserSQL, fields } as const;
const anyCtx: ParseSQLExpressionContext = { fieldExists: () => true };

describe('parseSQL with expressionParserSQL', () => {
  it('converts arithmetic RHS', () => {
    expect(parseSQL('price > (cost * 2)', opt).rules[0]).toEqual({
      field: 'price',
      operator: '>',
      value: {
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'cost' },
          { kind: 'value', value: 2 },
        ],
      },
      valueSource: 'expression',
    });
  });

  it('accepts both `mod` spellings', () => {
    for (const sql of ['(a % b) = 0', '(a MOD b) = 0']) {
      expect(parseSQL(sql, opt).rules[0]).toMatchObject({ lhs: { kind: 'func', fn: 'mod' } });
    }
  });

  it.each([
    ['LEAST', 'min'],
    ['MIN', 'min'],
    ['GREATEST', 'max'],
    ['MAX', 'max'],
  ])('%s → fn:%s', (name, fn) => {
    expect(parseSQL(`${name}(a, b) > 1`, opt).rules[0]).toMatchObject({
      lhs: { kind: 'func', fn },
    });
  });

  it.each(['abs', 'upper', 'lower'])('unary function %s', name => {
    expect(parseSQL(`x > ${name.toUpperCase()}(a)`, opt).rules[0]).toMatchObject({
      value: { kind: 'func', fn: name, args: [{ kind: 'field', field: 'a' }] },
    });
  });

  it('drops a rule with a non-mapped operator', () => {
    expect(parseSQL('(a ^ b) > 0', opt).rules).toEqual([]);
  });

  it('drops a rule with an unknown function', () => {
    expect(parseSQL('FOO(x) > 0', opt).rules).toEqual([]);
  });

  it('drops a rule with an arity mismatch', () => {
    expect(parseSQL('ABS(a, b) > 0', opt).rules).toEqual([]);
  });

  it('drops a rule referencing an unknown field leaf', () => {
    expect(parseSQL('(price * unknownField) > 1', opt).rules).toEqual([]);
  });

  it('parameter leaf inside an expression', () => {
    expect(
      parseSQL('price * :factor > 100', { ...opt, parseParameters: true }).rules[0]
    ).toMatchObject({
      lhs: {
        kind: 'func',
        fn: 'multiply',
        args: [
          { kind: 'field', field: 'price' },
          { kind: 'parameter', parameter: 'factor' },
        ],
      },
    });
  });

  it.each([
    'price > (cost * 2)',
    '(price * quantity) > 100',
    'price between (a + b) and (cost * 2)',
    'x >= ABS(a)',
  ])('round-trips %s', sql => {
    const query = parseSQL(sql, opt);
    const back = formatQuery(query, {
      format: 'sql',
      ruleProcessor: expressionRuleProcessorSQL,
      parseNumbers: true,
    });
    expect(back).toBe(`(${sql})`);
  });
});

describe('getExpressionParserSQL custom registries', () => {
  it('merges a custom function', () => {
    const getExpr = getExpressionParserSQL(
      { functions: { POWER: 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseSQL('POWER(x, 2) >= 9', { getExpression: getExpr, fields }).rules[0]).toMatchObject(
      {
        lhs: {
          kind: 'func',
          fn: 'pow',
          args: [
            { kind: 'field', field: 'x' },
            { kind: 'value', value: 2 },
          ],
        },
      }
    );
  });

  it('merges a custom operator', () => {
    const getExpr = getExpressionParserSQL(
      { operators: { '^': 'pow' } },
      { pow: { label: 'pow', arity: 2 } }
    );
    expect(parseSQL('(a ^ b) > 0', { getExpression: getExpr, fields }).rules[0]).toMatchObject({
      lhs: { kind: 'func', fn: 'pow' },
    });
  });
});

describe('parseSQLExpression via handler directly', () => {
  it('returns null for an arity mismatch', () => {
    const node: SQLExpressionOperand = {
      type: 'FunctionCall',
      name: 'ABS',
      params: [
        { type: 'Identifier', value: 'a' },
        { type: 'Identifier', value: 'b' },
      ],
    } as unknown as SQLExpressionOperand;
    expect(expressionParserSQL(node, anyCtx)).toBeNull();
  });

  it('builds a parameter leaf from a PlaceHolder node', () => {
    const node = {
      type: 'PlaceHolder',
      value: '${p}',
      param: 'p',
    } as unknown as SQLExpressionOperand;
    expect(expressionParserSQL(node, anyCtx)).toEqual({ kind: 'parameter', parameter: 'p' });
  });

  it('returns null when a field leaf does not exist', () => {
    const node = { type: 'Identifier', value: 'nope' } as unknown as SQLExpressionOperand;
    expect(expressionParserSQL(node, { fieldExists: () => false })).toBeNull();
  });

  it('returns null when a function param cannot be built', () => {
    const node = {
      type: 'FunctionCall',
      name: 'ABS',
      params: [{ type: 'Unknown' }],
    } as unknown as SQLExpressionOperand;
    expect(expressionParserSQL(node, anyCtx)).toBeNull();
  });

  it('returns null for an unrepresentable node type', () => {
    const node = { type: 'Unknown' } as unknown as SQLExpressionOperand;
    expect(expressionParserSQL(node, anyCtx)).toBeNull();
  });
});
