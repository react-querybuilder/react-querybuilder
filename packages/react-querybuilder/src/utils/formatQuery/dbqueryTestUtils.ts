import type { DefaultRuleGroupType, FormatQueryOptions } from '../../types';

type DbPlatform = 'postgres' | 'sqlite' | 'jsonlogic' | 'jsonata';

export interface TestSQLParams {
  query: DefaultRuleGroupType;
  expectedResult: SuperUser[];
  expectedResultCoercedNull?: SuperUser[];
  fqOptions?: FormatQueryOptions;
  guardAgainstNull?: [string, ...string[]];
}

export interface SuperUser {
  firstName: string;
  lastName: string;
  enhanced: 1 | 0 | boolean;
  madeUpName: string;
  powerUpAge: number | null;
}

const platformBoolean: Record<DbPlatform, [1, 0] | [true, false]> = {
  jsonata: [true, false],
  jsonlogic: [true, false],
  postgres: [true, false],
  sqlite: [1, 0],
};

export const superUsers = (dbPlatform: DbPlatform) => {
  const [isEnhanced, isNotEnhanced] = platformBoolean[dbPlatform];

  return [
    {
      firstName: 'Peter',
      lastName: 'Parker',
      enhanced: isEnhanced,
      madeUpName: 'Spider-Man',
      powerUpAge: 15,
    },
    {
      firstName: 'Clark',
      lastName: 'Kent',
      enhanced: isEnhanced,
      madeUpName: 'Superman',
      powerUpAge: 0,
    },
    {
      firstName: 'Steve',
      lastName: 'Rogers',
      enhanced: isEnhanced,
      madeUpName: 'Captain America',
      powerUpAge: 20,
    },
    {
      firstName: 'Bruce',
      lastName: 'Wayne',
      enhanced: isNotEnhanced,
      madeUpName: 'Batman',
      powerUpAge: null,
    },
  ] satisfies SuperUser[];
};

const enhancedColumnType: Record<DbPlatform, string> = {
  jsonata: 'N/A',
  jsonlogic: 'N/A',
  postgres: 'BOOLEAN',
  sqlite: 'INT CHECK (enhanced = 0 OR enhanced = 1)',
};

const unquote = (fieldName: string, unquoted = false) =>
  unquoted ? fieldName.toLocaleLowerCase() : `"${fieldName}"`;

export const CREATE_TABLE = (
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = { unquoted: false }
) => `CREATE TABLE superusers (
  ${unquote('firstName', unquoted)} TEXT NOT NULL,
  ${unquote('lastName', unquoted)} TEXT NOT NULL,
  ${unquote('enhanced', unquoted)} ${enhancedColumnType[dbPlatform]} NOT NULL,
  ${unquote('madeUpName', unquoted)} TEXT NOT NULL,
  ${unquote('powerUpAge', unquoted)} INT NULL
  )`;

export const CREATE_INDEX = ({ unquoted = false }: { unquoted?: boolean } = { unquoted: false }) =>
  `CREATE UNIQUE INDEX ndx ON superusers(${unquote('firstName', unquoted)}, ${unquote('lastName', unquoted)})`;

export const INSERT_INTO = (
  user: SuperUser,
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = { unquoted: false }
) => `
INSERT INTO superusers (
  ${unquote('firstName', unquoted)},
  ${unquote('lastName', unquoted)},
  ${unquote('enhanced', unquoted)},
  ${unquote('madeUpName', unquoted)},
  ${unquote('powerUpAge', unquoted)}
) VALUES (
  '${user.firstName}',
  '${user.lastName}',
  ${platformBoolean[dbPlatform][user.enhanced ? 0 : 1]},
  '${user.madeUpName}',
  ${typeof user.powerUpAge === 'number' ? user.powerUpAge : 'NULL'}
)`;

export const sqlBase = `SELECT * FROM superusers WHERE `;

export const dbSetup = (
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = { unquoted: false }
) =>
  [
    CREATE_TABLE(dbPlatform, { unquoted }),
    CREATE_INDEX({ unquoted }),
    ...superUsers(dbPlatform).map(user => INSERT_INTO(user, dbPlatform, { unquoted })),
  ].join(';');

export const dbTests = (superUsers: SuperUser[]): Record<string, TestSQLParams> => ({
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
  doesNotBeginWith: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotBeginWith', value: 'S' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.startsWith('S')),
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
  doesNotEndWith: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotEndWith', value: 'n' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.endsWith('n')),
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
  doesNotContain: {
    query: {
      combinator: 'and',
      rules: [{ field: 'madeUpName', operator: 'doesNotContain', value: 'r' }],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.includes('r')),
  },
  'greater than': {
    guardAgainstNull: ['powerUpAge'],
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: '>', value: 15 },
        { field: 'powerUpAge', operator: '>', value: '15' },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 0) > 15),
  },
  'greater than or equal to': {
    guardAgainstNull: ['powerUpAge'],
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: '>=', value: 15 },
        { field: 'powerUpAge', operator: '>=', value: '15' },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 0) >= 15),
  },
  'less than': {
    guardAgainstNull: ['powerUpAge'],
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: '<', value: 20 },
        { field: 'powerUpAge', operator: '<', value: '20' },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 999) < 20),
    expectedResultCoercedNull: superUsers.filter(u => u.powerUpAge! < 20),
  },
  'less than or equal to': {
    guardAgainstNull: ['powerUpAge'],
    query: {
      combinator: 'and',
      rules: [
        { field: 'powerUpAge', operator: '<=', value: 15 },
        { field: 'powerUpAge', operator: '<=', value: '15' },
      ],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 999) <= 15),
    expectedResultCoercedNull: superUsers.filter(u => u.powerUpAge! <= 15),
  },
  boolean: {
    query: {
      combinator: 'and',
      rules: [{ field: 'enhanced', operator: '=', value: true }],
    },
    expectedResult: superUsers.filter(u => !!u.enhanced),
  },
  'between/notBetween': {
    guardAgainstNull: ['powerUpAge'],
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
    expectedResult: superUsers.filter(
      u => (u.powerUpAge ?? 0) >= 10 && (u.powerUpAge ?? 999) <= 30
    ),
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
