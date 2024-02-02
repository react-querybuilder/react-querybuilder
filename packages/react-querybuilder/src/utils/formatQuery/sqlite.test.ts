/// <reference types="bun" />

import { Database } from 'bun:sqlite';
import type { DefaultRuleGroupTypeAny, FormatQueryOptions } from '../../types';
import { formatQuery } from './formatQuery';

// Data
interface SuperUser {
  firstName: string;
  lastName: string;
  enhanced: 1 | 0;
  madeUpName: string;
  powerUpAge: number | null;
}
// prettier-ignore
const superUsers = [
  { firstName: 'Peter', lastName: 'Parker', enhanced: 1, madeUpName: 'Spider-Man', powerUpAge: 15 },
  { firstName: 'Clark', lastName: 'Kent', enhanced: 1, madeUpName: 'Superman', powerUpAge: 0 },
  { firstName: 'Steve', lastName: 'Rogers', enhanced: 1, madeUpName: 'Captain America', powerUpAge: 20 },
  { firstName: 'Bruce', lastName: 'Wayne', enhanced: 0, madeUpName: 'Batman', powerUpAge: null },
] satisfies SuperUser[];

// Database setup
const db = new Database(); // <- in-memory db
db.run(`CREATE TABLE users (
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  enhanced INT CHECK (enhanced = 0 OR enhanced = 1),
  madeUpName TEXT NOT NULL,
  powerUpAge INT NULL
)`);
db.run(`CREATE UNIQUE INDEX ndx ON users(firstName, lastName)`);
const insertUser = db.prepare(`
INSERT INTO users (firstName, lastName, enhanced, madeUpName, powerUpAge)
     VALUES ($firstName, $lastName, $enhanced, $madeUpName, $powerUpAge)`);
db.transaction((users: typeof superUsers) => {
  for (const user of users) {
    const userWithBindVars = Object.fromEntries(Object.entries(user).map(([k, v]) => [`$${k}`, v]));
    insertUser.run(userWithBindVars);
  }
})(superUsers);

const sqlBase = `SELECT * FROM users WHERE ` as const;

interface TestSQLParams {
  query: DefaultRuleGroupTypeAny;
  expectedResult: (typeof superUsers)[number][];
  fqOptions?: FormatQueryOptions;
}

/**
 * Tests all three SQL variations.
 */
const testSQL = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  it('sql', () => {
    const sql = formatQuery(query, { format: 'sql', ...fqOptions });
    const select = db.prepare(`${sqlBase} ${sql}`);
    expect(select.all()).toEqual(expectedResult);
  });

  it('parameterized', () => {
    const parameterized = formatQuery(query, { ...fqOptions, format: 'parameterized' });
    const selectParam = db.prepare(`${sqlBase} ${parameterized.sql}`);
    expect(selectParam.all(...parameterized.params)).toEqual(expectedResult);
  });

  it('parameterized_named', () => {
    const parameterizedNamed = formatQuery(query, {
      ...fqOptions,
      format: 'parameterized_named',
      paramsKeepPrefix: true,
    });
    const selectParamNamed = db.prepare(`${sqlBase} ${parameterizedNamed.sql}`);
    expect(selectParamNamed.all(parameterizedNamed.params)).toEqual(expectedResult);
  });
};

// Tests
describe('and/or', () => {
  testSQL({
    query: {
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: 'beginsWith', value: 'P' },
        {
          combinator: 'and',
          rules: [
            { field: 'madeUpName', operator: 'doesNotContain', value: 'Bat' },
            { field: 'madeUpName', operator: 'endsWith', value: 'man' },
          ],
        },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName.startsWith('S')),
  });
});

describe('beginsWith', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'beginsWith', value: 'P' },
        { field: 'lastName', operator: 'beginsWith', value: 'P' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Spider-Man'),
  });
});

describe('endsWith', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'endsWith', value: 'e' },
        { field: 'lastName', operator: 'endsWith', value: 's' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Captain America'),
  });
});

describe('contains', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'contains', value: 'ete' },
        { field: 'lastName', operator: 'contains', value: 'ark' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Spider-Man'),
  });
});

describe('doesNotBeginWith', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'doesNotBeginWith', value: 'S' },
        { field: 'madeUpName', operator: 'doesNotBeginWith', value: 'S' },
      ],
    },
    expectedResult: superUsers.filter(
      u => u.madeUpName === 'Captain America' || u.madeUpName === 'Batman'
    ),
  });
});

describe('doesNotEndWith', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'doesNotEndWith', value: 'n' },
        { field: 'madeUpName', operator: 'doesNotEndWith', value: 'n' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Captain America'),
  });
});

describe('doesNotContain', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'doesNotContain', value: 'r' },
        { field: 'madeUpName', operator: 'doesNotContain', value: 'r' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Batman'),
  });
});

describe('greater than', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'enhanced', operator: '>', value: 0 },
        { field: 'enhanced', operator: '>', value: '0' },
      ],
    },
    expectedResult: superUsers.filter(u => u.enhanced),
  });
});

describe('between/notBetween', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: 'between', value: [10, 30] },
        { field: 'powerUpAge', operator: 'between', value: ['10', '30'] },
        { field: 'powerUpAge', operator: 'between', value: '10,30' },
        { field: 'powerUpAge', operator: 'notBetween', value: [-10, 10] },
        { field: 'powerUpAge', operator: 'notBetween', value: '-10,10' },
        { field: 'powerUpAge', operator: 'notBetween', value: ['-10', '10'] },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 0) > 10 && (u.powerUpAge ?? 0) < 30),
  });
});

describe('in/notIn', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'lastName', operator: 'in', value: ['Rogers', 'Wayne'] },
        { field: 'lastName', operator: 'in', value: 'Rogers,Wayne' },
        { field: 'lastName', operator: 'notIn', value: 'Parker,Kent' },
        { field: 'lastName', operator: 'notIn', value: ['Parker', 'Kent'] },
      ],
    },
    expectedResult: superUsers.filter(u => u.lastName === 'Rogers' || u.lastName === 'Wayne'),
  });
});

describe('null/notNull', () => {
  testSQL({
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: 'null', value: null },
        { field: 'madeUpName', operator: 'notNull', value: null },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName === 'Batman'),
  });
});

for (const q of ['"', '`', ['[', ']']] satisfies (string | [string, string])[]) {
  describe(`quote ${q[0]}fieldNames${q[1] ?? q[0]}`, () => {
    testSQL({
      query: {
        combinator: 'and',
        rules: [
          { field: 'enhanced', operator: '>', value: 0 },
          { field: 'enhanced', operator: '>', value: '0' },
        ],
      },
      expectedResult: superUsers.filter(u => u.enhanced),
      fqOptions: { quoteFieldNamesWith: q },
    });
  });
}
