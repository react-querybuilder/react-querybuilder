import type { DefaultRuleGroupType, Field, FormatQueryOptions } from '../../types/index.noReact';

type DbPlatform = 'postgres' | 'sqlite' | 'jsonlogic' | 'jsonata' | 'mssql' | 'mongodb' | 'cel';

export interface TestSQLParams {
  query: DefaultRuleGroupType;
  expectedResult: SuperUser[];
  expectedResultCoercedNull?: SuperUser[];
  fqOptions?: FormatQueryOptions;
  guardAgainstNull?: [string, ...string[]];
  skipParameterized?: boolean;
}

export interface SuperUser<EnhancedType = 0 | 1 | boolean> {
  firstName: string;
  lastName: string;
  enhanced: EnhancedType;
  madeUpName: string;
  nickname: string;
  powerUpAge: number | null | undefined;
}

const platformBoolean: Record<DbPlatform, [1, 0] | [true, false]> = {
  cel: [true, false],
  jsonata: [true, false],
  jsonlogic: [true, false],
  mssql: [1, 0],
  mongodb: [true, false],
  postgres: [true, false],
  sqlite: [1, 0],
};

export const fields: Field[] = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'enhanced', label: 'Enhanced' },
  { name: 'madeUpName', label: 'Made Up Name' },
  { name: 'nickname', label: 'Nickname' },
  {
    name: 'powerUpAge',
    label: 'Power Up Age',
    inputType: 'number',
    validator: r => !(r.value === 99 && r.field === 'powerUpAge'),
  },
];

export const superUsers = <DBP extends DbPlatform>(
  dbPlatform: DBP
): DBP extends 'mssql' | 'sqlite' ? SuperUser<0 | 1>[] : SuperUser<boolean>[] => {
  const [isEnhanced, isNotEnhanced] = platformBoolean[dbPlatform];

  // Sorted by `madeUpName`
  return [
    {
      firstName: 'Bruce',
      lastName: 'Wayne',
      enhanced: isNotEnhanced,
      madeUpName: 'Batman',
      nickname: 'The Dark Knight',
      powerUpAge: dbPlatform === 'cel' ? undefined : null,
    },
    {
      firstName: 'Steve',
      lastName: 'Rogers',
      enhanced: isEnhanced,
      madeUpName: 'Captain America',
      nickname: 'Cap',
      powerUpAge: 20,
    },
    {
      firstName: 'Peter',
      lastName: 'Parker',
      enhanced: isEnhanced,
      madeUpName: 'Spider-Man',
      nickname: 'Spidey',
      powerUpAge: 15,
    },
    {
      firstName: 'Clark',
      lastName: 'Kent',
      enhanced: isEnhanced,
      madeUpName: 'Superman',
      nickname: 'Supes',
      powerUpAge: 0,
    },
  ] as DBP extends 'mssql' | 'sqlite' ? SuperUser<0 | 1>[] : SuperUser<boolean>[];
};

const enhancedColumnType: Record<DbPlatform, string> = {
  cel: 'N/A',
  jsonata: 'N/A',
  jsonlogic: 'N/A',
  mongodb: 'boolean',
  mssql: 'INT CHECK (enhanced = 0 OR enhanced = 1)',
  postgres: 'BOOLEAN',
  sqlite: 'INT CHECK (enhanced = 0 OR enhanced = 1)',
};

const textColumnType: Record<DbPlatform, string> = {
  cel: 'TEXT',
  jsonata: 'TEXT',
  jsonlogic: 'TEXT',
  mongodb: 'string',
  mssql: 'VARCHAR(255)',
  postgres: 'TEXT',
  sqlite: 'TEXT',
};

const unquote = (fieldName: string, unquoted = false) =>
  unquoted ? fieldName.toLocaleLowerCase() : `"${fieldName}"`;

const unquotedFalse = { unquoted: false } as const;

export const CREATE_TABLE = (
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = unquotedFalse
) => `CREATE TABLE superusers (
  ${unquote('firstName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('lastName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('enhanced', unquoted)} ${enhancedColumnType[dbPlatform]} NOT NULL,
  ${unquote('madeUpName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('nickname', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('powerUpAge', unquoted)} INT NULL
)`;

export const CREATE_INDEX = ({ unquoted = false }: { unquoted?: boolean } = unquotedFalse) =>
  `CREATE UNIQUE INDEX ndx ON superusers(${unquote('firstName', unquoted)}, ${unquote('lastName', unquoted)})`;

export const INSERT_INTO = (
  user: SuperUser,
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = unquotedFalse
) => `
INSERT INTO superusers (
  ${unquote('firstName', unquoted)},
  ${unquote('lastName', unquoted)},
  ${unquote('enhanced', unquoted)},
  ${unquote('madeUpName', unquoted)},
  ${unquote('nickname', unquoted)},
  ${unquote('powerUpAge', unquoted)}
) VALUES (
  '${user.firstName}',
  '${user.lastName}',
  ${platformBoolean[dbPlatform][user.enhanced ? 0 : 1]},
  '${user.madeUpName}',
  '${user.nickname}',
  ${typeof user.powerUpAge === 'number' ? user.powerUpAge : 'NULL'}
)`;

export const sqlBase = `SELECT * FROM superusers WHERE `;
export const getSqlOrderBy = (unquoted = false) => ` ORDER BY ${unquote('madeUpName', unquoted)}`;

export const dbSetup = (
  dbPlatform: DbPlatform,
  { unquoted = false }: { unquoted?: boolean } = unquotedFalse
): string =>
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
  '=': {
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '=', value: 'Peter' },
        { field: 'lastName', operator: '=', value: 'Parker' },
      ],
    },
    expectedResult: superUsers.filter(u => u.firstName === 'Peter' && u.lastName === 'Parker'),
  },
  '!=': {
    query: {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'Peter' },
        { field: 'lastName', operator: '!=', value: 'Parker' },
      ],
    },
    expectedResult: superUsers.filter(u => u.firstName !== 'Peter' && u.lastName !== 'Parker'),
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
  bigint: {
    guardAgainstNull: ['powerUpAge'],
    query: {
      combinator: 'and',
      rules: [{ field: 'powerUpAge', operator: '<', value: 20n }],
    },
    expectedResult: superUsers.filter(u => (u.powerUpAge ?? 999) < 20n),
    expectedResultCoercedNull: superUsers.filter(u => u.powerUpAge! < 20n),
  },
  manipulateValueOrder: {
    guardAgainstNull: ['powerUpAge'],
    skipParameterized: true,
    query: {
      combinator: 'and',
      rules: [{ field: 'powerUpAge', operator: 'between', value: [100, 0] }],
    },
    expectedResult: superUsers.filter(
      u => (u.powerUpAge ?? 999) >= 0 && (u.powerUpAge ?? 999) <= 100
    ),
    expectedResultCoercedNull: superUsers.filter(u => u.powerUpAge! >= 0 && u.powerUpAge! <= 100),
    fqOptions: { preserveValueOrder: false, parseNumbers: true },
  },
  preserveValueOrder: {
    guardAgainstNull: ['powerUpAge'],
    skipParameterized: true,
    query: {
      combinator: 'and',
      rules: [{ field: 'powerUpAge', operator: 'between', value: [100, 0] }],
    },
    expectedResult: [],
    expectedResultCoercedNull: [],
    fqOptions: { preserveValueOrder: true, parseNumbers: true },
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
