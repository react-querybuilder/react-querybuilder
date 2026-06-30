import type { Field, RuleGroupType, RuleType } from '@react-querybuilder/core';
import { defaultFunctions } from './defaultFunctions';
import { mergeFunctions } from './registry';
import type { ExpressionFunctionRegistry, ExpressionNode, ResolvedExpressions } from './types';

// Shared fixtures for the `dbquery.*` integration tests (run under `bun test`). Each
// `testCases` entry is an expression-bearing query plus the `id`s it should match; tests
// assert on the matched id set (numeric, dialect-agnostic) to dodge PGlite/SQLite type
// coercion differences for numeric/string columns.

export const sqlBase = `SELECT id FROM products WHERE`;
export const sqlOrderBy = `ORDER BY id`;

export const fields: Field[] = [
  { name: 'id', label: 'ID' },
  { name: 'name', label: 'Name' },
  { name: 'price', label: 'Price' },
  { name: 'qty', label: 'Quantity' },
  { name: 'discount', label: 'Discount' },
  { name: 'rating', label: 'Rating' },
];

export interface Product {
  id: number;
  name: string;
  price: number;
  qty: number;
  discount: number;
  rating: number | null;
}

// Values chosen so every default function yields a distinct, deterministic match set.
export const products: Product[] = [
  { id: 1, name: 'Widget', price: 10, qty: 5, discount: -2, rating: null },
  { id: 2, name: 'Gadget', price: 20, qty: 3, discount: 5, rating: 4 },
  { id: 3, name: 'ACME', price: 50, qty: 2, discount: 0, rating: null },
  { id: 4, name: 'Gizmo', price: 25, qty: 4, discount: -10, rating: 9 },
  { id: 5, name: 'gadget', price: 5, qty: 10, discount: 3, rating: 1 },
];

export const FIND_PRODUCTS_TABLE = (platform: 'sqlite' | 'postgresql'): string =>
  ({
    sqlite: `SELECT * FROM sqlite_master WHERE type = 'table' AND name = 'products'`,
    postgresql: `SELECT * FROM pg_tables WHERE tablename = 'products'`,
  })[platform];

export const CREATE_PRODUCTS_TABLE = (platform: 'sqlite' | 'postgresql'): string => {
  const realType = platform === 'sqlite' ? 'real' : 'double precision';
  return `CREATE TABLE products (
    id integer PRIMARY KEY,
    name text NOT NULL,
    price ${realType} NOT NULL,
    qty integer NOT NULL,
    discount ${realType} NOT NULL,
    rating ${realType})`;
};

// Platform-independent: numeric literals + quoted strings + NULL work in both dialects.
export const INSERT_PRODUCTS = (): string =>
  products
    .map(
      p =>
        `INSERT INTO products (id, name, price, qty, discount, rating) VALUES (${p.id}, '${p.name}', ${p.price}, ${p.qty}, ${p.discount}, ${p.rating === null ? 'NULL' : p.rating})`
    )
    .join(';\n');

// SQLite lacks LEAST/GREATEST (the default `min`/`max` SQL serializers) but has scalar
// MIN/MAX; override just those serializers, keeping arity/label/jsonLogic from the defaults.
export const sqliteFunctions: ExpressionFunctionRegistry = mergeFunctions({
  min: {
    ...defaultFunctions.min,
    sql: (...args) => `MIN(${args.join(', ')})`,
    parameterized: (...args) => `MIN(${args.join(', ')})`,
  },
  max: {
    ...defaultFunctions.max,
    sql: (...args) => `MAX(${args.join(', ')})`,
    parameterized: (...args) => `MAX(${args.join(', ')})`,
  },
});

// JSONLogic ops missing from the stock runtime; register before evaluating (`+ - * / %`
// and `min`/`max` are stock, so only these three need registering).
export const expressionJsonLogicOperators: Record<string, (...args: unknown[]) => unknown> = {
  abs: (...a) => Math.abs(a[0] as number),
  upper: (...a) => String(a[0]).toUpperCase(),
  lower: (...a) => String(a[0]).toLowerCase(),
};

// Expression-node builders (mirror the local helpers in expressionProcessors.test.ts).
export const field = (f: string): ExpressionNode => ({ kind: 'field', field: f });
export const value = (v: unknown, valueType?: string): ExpressionNode => ({
  kind: 'value',
  value: v,
  valueType,
});
export const fn = (name: string, ...args: ExpressionNode[]): ExpressionNode => ({
  kind: 'func',
  fn: name,
  args,
});

// Builds a rule using the core storage contract: `lhs` lives on `rule.lhs`, and an `rhs`
// expression is stored in `rule.value` with `valueSource: 'expression'`.
export const exprRule = (
  rule: Partial<RuleType> & { operator: string },
  { lhs, rhs }: ResolvedExpressions = {}
): RuleType => {
  const result = { field: '(expression)', value: '', ...rule } as RuleType;
  if (lhs) result.lhs = lhs;
  if (rhs) {
    result.value = rhs;
    result.valueSource = 'expression';
  }
  return result;
};

export const group = (...rules: RuleType[]): RuleGroupType => ({ combinator: 'and', rules });

export const testCases: Record<string, [RuleGroupType, number[]]> = {
  // (price * qty): 50, 60, 100, 100, 50 -> > 80 matches the two 100s.
  multiply: [
    group(
      exprRule(
        { operator: '>' },
        { lhs: fn('multiply', field('price'), field('qty')), rhs: value(80, 'number') }
      )
    ),
    [3, 4],
  ],
  // (price + discount): 8, 25, 50, 15, 8 -> >= 25.
  add: [
    group(
      exprRule(
        { operator: '>=' },
        { lhs: fn('add', field('price'), field('discount')), rhs: value(25, 'number') }
      )
    ),
    [2, 3],
  ],
  // (price - discount): 12, 15, 50, 35, 2 -> > 30.
  subtract: [
    group(
      exprRule(
        { operator: '>' },
        { lhs: fn('subtract', field('price'), field('discount')), rhs: value(30, 'number') }
      )
    ),
    [3, 4],
  ],
  // (price / qty): 2, 6.67, 25, 6.25, 0.5 -> >= 6 (margins avoid float edge cases).
  divide: [
    group(
      exprRule(
        { operator: '>=' },
        { lhs: fn('divide', field('price'), field('qty')), rhs: value(6, 'number') }
      )
    ),
    [2, 3, 4],
  ],
  // (qty % 2) == 0: even quantities 2, 4, 10.
  mod: [
    group(
      exprRule(
        { operator: '=' },
        { lhs: fn('mod', field('qty'), value(2, 'number')), rhs: value(0, 'number') }
      )
    ),
    [3, 4, 5],
  ],
  // ABS(discount): 2, 5, 0, 10, 3 -> >= 5.
  abs: [
    group(
      exprRule({ operator: '>=' }, { lhs: fn('abs', field('discount')), rhs: value(5, 'number') })
    ),
    [2, 4],
  ],
  // LEAST/MIN(price, qty): 5, 3, 2, 4, 5 -> >= 4.
  min: [
    group(
      exprRule(
        { operator: '>=' },
        { lhs: fn('min', field('price'), field('qty')), rhs: value(4, 'number') }
      )
    ),
    [1, 4, 5],
  ],
  // GREATEST/MAX(price, qty): 10, 20, 50, 25, 10 -> > 20.
  max: [
    group(
      exprRule(
        { operator: '>' },
        { lhs: fn('max', field('price'), field('qty')), rhs: value(20, 'number') }
      )
    ),
    [3, 4],
  ],
  // UPPER(name) == 'ACME': only the ACME row (plain string RHS).
  upper: [
    group(
      exprRule({ field: 'name', operator: '=', value: 'ACME' }, { lhs: fn('upper', field('name')) })
    ),
    [3],
  ],
  // LOWER(name) == 'gadget': both Gadget/gadget rows.
  lower: [
    group(
      exprRule(
        { field: 'name', operator: '=', value: 'gadget' },
        { lhs: fn('lower', field('name')) }
      )
    ),
    [2, 5],
  ],
  // Plain LHS field with an RHS expression: price > (qty * 5) where qty*5 = 25,15,10,20,50.
  rhsExpression: [
    group(
      exprRule(
        { field: 'price', operator: '>' },
        { rhs: fn('multiply', field('qty'), value(5, 'number')) }
      )
    ),
    [2, 3, 4],
  ],
  // Expressions on both sides (commutative identity) -> always true -> all rows.
  bothSides: [
    group(
      exprRule(
        { operator: '>=' },
        {
          lhs: fn('multiply', field('price'), field('qty')),
          rhs: fn('multiply', field('qty'), field('price')),
        }
      )
    ),
    [1, 2, 3, 4, 5],
  ],
  // Unary operators on a nullable column (plain field LHS for cross-format parity).
  isNull: [
    group(exprRule({ field: 'rating', operator: 'null', value: null }, { lhs: field('rating') })),
    [1, 3],
  ],
  isNotNull: [
    group(
      exprRule({ field: 'rating', operator: 'notNull', value: null }, { lhs: field('rating') })
    ),
    [2, 4, 5],
  ],
};
