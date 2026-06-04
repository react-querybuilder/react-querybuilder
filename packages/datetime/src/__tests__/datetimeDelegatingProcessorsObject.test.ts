/* @vitest-environment node */

import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import type { FullField } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorDrizzle } from '../getDatetimeRuleProcessorDrizzle';
import { getDatetimeRuleProcessorSequelize } from '../getDatetimeRuleProcessorSequelize';
import { getDatetimeRuleProcessorTanStackDB } from '../getDatetimeRuleProcessorTanStackDB';

const apiFns = dateLibraryFunctions.find(([name]) => name === 'Day.js')![1];

// Stubbed operator/ref objects: real driver runtime deps aren't needed because the
// default processors only call these as opaque builders. Each stub echoes its arguments.
const operatorStub = (...args: unknown[]) => args;
const sqlStub = <T>(...x: T[]): T[] => x;
sqlStub.raw = (s: string) => s;

const comparisonQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'birthdate', operator: '>', value: '1957-01-01' }],
};
// Reversed operands exercise the chronological-reorder branch.
const betweenQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'birthdate', operator: 'between', value: ['1969-01-01', '1957-01-01'] }],
};
const fallbackQuery: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
};

const comparisonRule = comparisonQuery.rules[0] as RuleType;
const betweenRule = betweenQuery.rules[0] as RuleType;
const fallbackRule = fallbackQuery.rules[0] as RuleType;

const fieldOf = (name: string) => fields.find(f => f.name === name)! as unknown as FullField;
const firstField = fields[0] as unknown as FullField;

const expectedDate = (s: string) => apiFns.toDate(s);

describe('drizzle', () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const drizzleOperators: any = {
    and: operatorStub,
    between: operatorStub,
    eq: operatorStub,
    gt: operatorStub,
    gte: operatorStub,
    inArray: operatorStub,
    isNotNull: operatorStub,
    isNull: operatorStub,
    like: operatorStub,
    lt: operatorStub,
    lte: operatorStub,
    ne: operatorStub,
    notBetween: operatorStub,
    notInArray: operatorStub,
    notLike: operatorStub,
    sql: sqlStub,
  };
  const columns = Object.fromEntries(fields.map(f => [f.name, { name: f.name }]));
  const ruleProcessor = getDatetimeRuleProcessorDrizzle(apiFns);
  const context = { columns, drizzleOperators };

  test('converts comparison values to Date objects', () => {
    const where = formatQuery(comparisonQuery, { format: 'drizzle', fields, ruleProcessor });
    // `gt(column, Date)` → [column, Date]
    expect(where(columns as never, drizzleOperators)).toEqual([
      [{ name: 'birthdate' }, expectedDate('1957-01-01')],
    ]);
  });

  test('orders between operands chronologically', () => {
    const where = formatQuery(betweenQuery, { format: 'drizzle', fields, ruleProcessor });
    expect(where(columns as never, drizzleOperators)).toEqual([
      [{ name: 'birthdate' }, expectedDate('1957-01-01'), expectedDate('1969-01-01')],
    ]);
  });

  test('falls back to the default processor for non-date fields', () => {
    expect(ruleProcessor(fallbackRule, { context, fieldData: firstField })).toEqual([
      { name: 'firstName' },
      'Steve',
    ]);
  });
});

describe('sequelize', () => {
  const Op = {
    eq: Symbol('eq'),
    ne: Symbol('ne'),
    lt: Symbol('lt'),
    lte: Symbol('lte'),
    gt: Symbol('gt'),
    gte: Symbol('gte'),
    in: Symbol('in'),
    notIn: Symbol('notIn'),
    between: Symbol('between'),
    notBetween: Symbol('notBetween'),
    is: Symbol('is'),
    not: Symbol('not'),
    like: Symbol('like'),
    notLike: Symbol('notLike'),
    substring: Symbol('substring'),
    startsWith: Symbol('startsWith'),
    endsWith: Symbol('endsWith'),
    col: Symbol('col'),
  };
  const context = { isDateField: true, sequelizeOperators: Op };
  const ruleProcessor = getDatetimeRuleProcessorSequelize(apiFns);
  const fieldData = fieldOf('birthdate');

  test('converts comparison values to Date objects', () => {
    const out = ruleProcessor(comparisonRule, { context, fieldData }) as {
      birthdate: Record<symbol, unknown>;
    };
    expect(out.birthdate[Op.gt]).toEqual(expectedDate('1957-01-01'));
  });

  test('orders between operands chronologically', () => {
    const out = ruleProcessor(betweenRule, { context, fieldData }) as {
      birthdate: Record<symbol, Date[]>;
    };
    expect(out.birthdate[Op.between]).toEqual([
      expectedDate('1957-01-01'),
      expectedDate('1969-01-01'),
    ]);
  });

  test('falls back to the default processor for non-date fields', () => {
    const out = ruleProcessor(fallbackRule, { context, fieldData: firstField }) as {
      firstName: Record<symbol, unknown>;
    };
    expect(out.firstName[Op.eq]).toBe('Steve');
  });
});

describe('tanstack_db', () => {
  // oxlint-disable-next-line typescript/no-explicit-any
  const ops: any = {
    and: operatorStub,
    eq: operatorStub,
    gt: operatorStub,
    gte: operatorStub,
    inArray: operatorStub,
    isNull: operatorStub,
    like: operatorStub,
    lt: operatorStub,
    lte: operatorStub,
    not: operatorStub,
  };
  const refs = { musicians: Object.fromEntries(fields.map(f => [f.name, { col: f.name }])) };
  const context = {
    isDateField: true,
    tanStackDbOperators: ops,
    _tanstackDbRefs: refs,
    _tanstackDbPrimaryRef: 'musicians',
  };
  const ruleProcessor = getDatetimeRuleProcessorTanStackDB(apiFns);
  const fieldData = fieldOf('birthdate');

  test('converts comparison values to Date objects', () => {
    expect(ruleProcessor(comparisonRule, { context, fieldData })).toEqual([
      { col: 'birthdate' },
      expectedDate('1957-01-01'),
    ]);
  });

  test('orders between operands chronologically', () => {
    // between → and(gte(col, first), lte(col, second))
    expect(ruleProcessor(betweenRule, { context, fieldData })).toEqual([
      [{ col: 'birthdate' }, expectedDate('1957-01-01')],
      [{ col: 'birthdate' }, expectedDate('1969-01-01')],
    ]);
  });

  test('falls back to the default processor for non-date fields', () => {
    expect(ruleProcessor(fallbackRule, { context, fieldData: firstField })).toEqual([
      { col: 'firstName' },
      'Steve',
    ]);
  });
});
