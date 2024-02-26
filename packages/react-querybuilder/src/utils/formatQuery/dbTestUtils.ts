import type { DefaultRuleGroupTypeAny, FormatQueryOptions } from '../../types';

export interface TestSQLParams {
  query: DefaultRuleGroupTypeAny;
  expectedResult: SuperUser[];
  fqOptions?: FormatQueryOptions;
}

export interface SuperUser {
  firstName: string;
  lastName: string;
  enhanced: 1 | 0 | boolean;
  madeUpName: string;
  powerUpAge: number | null;
}

export const superUsers = (platform?: 'postgres' | 'sqlite') => {
  const [t, f] = platform === 'sqlite' ? ([1, 0] as const) : [true, false];
  return [
    {
      firstName: 'Peter',
      lastName: 'Parker',
      enhanced: t,
      madeUpName: 'Spider-Man',
      powerUpAge: 15,
    },
    { firstName: 'Clark', lastName: 'Kent', enhanced: t, madeUpName: 'Superman', powerUpAge: 0 },
    {
      firstName: 'Steve',
      lastName: 'Rogers',
      enhanced: t,
      madeUpName: 'Captain America',
      powerUpAge: 20,
    },
    { firstName: 'Bruce', lastName: 'Wayne', enhanced: f, madeUpName: 'Batman', powerUpAge: null },
  ] satisfies SuperUser[];
};

export const CREATE_TABLE = (platform?: 'postgres' | 'sqlite') => `CREATE TABLE users (
  "firstName" TEXT NOT NULL,
  "lastName" TEXT NOT NULL,
  "enhanced" ${platform === 'sqlite' ? 'INT CHECK (enhanced = 0 OR enhanced = 1)' : 'BOOLEAN'},
  "madeUpName" TEXT NOT NULL,
  "powerUpAge" INT NULL
  )`;

export const CREATE_INDEX = `CREATE UNIQUE INDEX ndx ON users("firstName", "lastName")`;

// TODO: Make this parameterized once PGlite supports it
export const INSERT_INTO = (
  user: SuperUser,
  platform?: 'postgres' | 'sqlite'
) => `INSERT INTO users ("firstName", "lastName", "enhanced", "madeUpName", "powerUpAge")
VALUES ('${user.firstName}', '${user.lastName}', ${platform === 'sqlite' ? (user.enhanced ? 1 : 0) : user.enhanced}, '${user.madeUpName}', ${typeof user.powerUpAge === 'number' ? `'${user.powerUpAge}'` : 'NULL'})`;

export const sqlBase = `SELECT * FROM users WHERE ` as const;

interface SqlTest {
  query: DefaultRuleGroupTypeAny;
  expectedResult: SuperUser[];
}

export const dbTests = (superUsers: SuperUser[]): Record<string, SqlTest> => ({
  'and/or': {
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
    expectedResult: superUsers.filter(
      u =>
        u.firstName.startsWith('P') ||
        (!u.madeUpName.includes('Bat') && u.madeUpName.endsWith('man'))
    ),
  },
  beginsWith: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'beginsWith', value: 'P' },
        { field: 'lastName', operator: 'beginsWith', value: 'P' },
      ],
    },
    expectedResult: superUsers.filter(
      u => u.firstName.startsWith('P') && u.lastName.startsWith('P')
    ),
  },
  endsWith: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'endsWith', value: 'e' },
        { field: 'lastName', operator: 'endsWith', value: 's' },
      ],
    },
    expectedResult: superUsers.filter(u => u.firstName.endsWith('e') && u.lastName.endsWith('s')),
  },
  contains: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'contains', value: 'ete' },
        { field: 'lastName', operator: 'contains', value: 'ark' },
      ],
    },
    expectedResult: superUsers.filter(
      u => u.firstName.includes('ete') && u.lastName.includes('ark')
    ),
  },
  doesNotBeginWith: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotBeginWith', value: 'S' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.startsWith('S')),
  },
  doesNotEndWith: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotEndWith', value: 'n' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.endsWith('n')),
  },
  doesNotContain: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotContain', value: 'r' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.includes('r')),
  },
  'greater than': {
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: '>', value: 15 },
        { field: 'powerUpAge', operator: '>', value: '15' },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 0) > 15),
  },
  boolean: {
    query: {
      combinator: 'and',
      rules: [{ field: 'enhanced', operator: '=', value: true }],
    },
    expectedResult: superUsers.filter(u => !!u.enhanced),
  },
  'between/notBetween': {
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
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 0) >= 10 && (u.powerUpAge ?? 0) <= 30),
  },
  'in/notIn': {
    query: {
      combinator: 'and',
      rules: [
        { field: 'lastName', operator: 'in', value: ['Rogers', 'Wayne'] },
        { field: 'lastName', operator: 'in', value: 'Rogers,Wayne' },
        { field: 'lastName', operator: 'notIn', value: 'Parker,Kent' },
        { field: 'lastName', operator: 'notIn', value: ['Parker', 'Kent'] },
      ],
    },
    expectedResult: superUsers.filter(
      u => ['Rogers', 'Wayne'].includes(u.lastName) && !['Parker', 'Kent'].includes(u.lastName)
    ),
  },
  'null/notNull': {
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: 'null', value: null },
        { field: 'madeUpName', operator: 'notNull', value: null },
      ],
    },
    expectedResult: superUsers.filter(u => u.powerUpAge === null && u.madeUpName !== null),
  },
});
