/// <reference types="bun-types" />

import { Database } from 'bun:sqlite';
import type { FormatQueryOptions, RuleGroupTypeAny } from '../../types';
import { formatQuery } from './formatQuery';

// Data
interface SuperUser {
  firstName: string;
  lastName: string;
  enhanced: 1 | 0;
  madeUpName: string;
}
const superUsers = [
  { firstName: 'Peter', lastName: 'Parker', enhanced: 1, madeUpName: 'Spider-Man' },
  { firstName: 'Clark', lastName: 'Kent', enhanced: 1, madeUpName: 'Superman' },
  { firstName: 'Steve', lastName: 'Rogers', enhanced: 1, madeUpName: 'Captain America' },
  { firstName: 'Bruce', lastName: 'Wayne', enhanced: 0, madeUpName: 'Batman' },
] satisfies SuperUser[];

// Database setup
const db = new Database();
db.run(`CREATE TABLE users (
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  enhanced INT CHECK (enhanced = 0 OR enhanced = 1),
  madeUpName TEXT NOT NULL
)`);
db.run(`CREATE UNIQUE INDEX ndx ON users(firstName, lastName)`);
const insertUser = db.prepare(`
INSERT INTO users (firstName, lastName, enhanced, madeUpName)
     VALUES ($firstName, $lastName, $enhanced, $madeUpName)`);
db.transaction((users: typeof superUsers) => {
  for (const user of users) {
    const userWithBindVars = Object.fromEntries(Object.entries(user).map(([k, v]) => [`$${k}`, v]));
    insertUser.run(userWithBindVars);
  }
})(superUsers);

const sqlBase = `SELECT * FROM users WHERE ` as const;

interface TestSQLParams {
  query: RuleGroupTypeAny;
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

describe('begins with', () => {
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
