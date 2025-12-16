import type { DefaultRuleGroupType, Field, FormatQueryOptions, MatchConfig } from '../../types';

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

export interface AugmentedSuperUser<
  EnhancedType = 0 | 1 | boolean,
> extends SuperUser<EnhancedType> {
  nicknames: string[];
  earlyPencilers: { firstName: string; lastName: string; generationalSuffix?: string }[];
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

export const nicknameMap: Record<string, string[]> = {
  Batman: ['The Caped Crusader'],
  Superman: ['The Man of Steel', 'The Last Son of Krypton'],
  'Spider-Man': ['Web-Slinger', 'Menace to Society'],
  'Captain America': ['The First Avenger'],
};

export const earlyPencilersMap: Record<
  string,
  { firstName: string; lastName: string; generationalSuffix?: string }[]
> = {
  Batman: [
    { firstName: 'Bob', lastName: 'Kane' },
    { firstName: 'Jerry', lastName: 'Robinson' },
    { firstName: 'Sheldon', lastName: 'Moldoff' },
    { firstName: 'Dick', lastName: 'Sprang' },
    { firstName: 'Carmine', lastName: 'Infantino' },
    { firstName: 'Neal', lastName: 'Adams' },
    { firstName: 'Jim', lastName: 'Aparo' },
    { firstName: 'Marshall', lastName: 'Rogers' },
    { firstName: 'Don', lastName: 'Newton' },
    { firstName: 'Gene', lastName: 'Colan' },
    { firstName: 'Ernie', lastName: 'Chan' },
  ],
  Superman: [
    { firstName: 'Joe', lastName: 'Shuster' },
    { firstName: 'Wayne', lastName: 'Boring' },
    { firstName: 'Curt', lastName: 'Swan' },
    { firstName: 'Jose‑Luis', lastName: 'Garcia‑Lopez' },
    { firstName: 'Mike', lastName: 'Grell' },
    { firstName: 'George', lastName: 'Pérez' },
  ],
  'Spider-Man': [
    { firstName: 'Steve', lastName: 'Ditko' },
    { firstName: 'John', lastName: 'Romita', generationalSuffix: 'Sr.' },
    { firstName: 'Larry', lastName: 'Lieber' },
    { firstName: 'Don', lastName: 'Heck' },
    { firstName: 'Jim', lastName: 'Mooney' },
    { firstName: 'John', lastName: 'Buscema' },
    { firstName: 'Gil', lastName: 'Kane' },
    { firstName: 'Ross', lastName: 'Andru' },
    { firstName: 'Sal', lastName: 'Buscema' },
    { firstName: 'Keith', lastName: 'Pollard' },
  ],
  'Captain America': [
    { firstName: 'Jack', lastName: 'Kirby' },
    { firstName: 'Al', lastName: 'Avison' },
    { firstName: 'Syd', lastName: 'Shores' },
    { firstName: 'Vince', lastName: 'Alascia' },
    { firstName: 'Ken', lastName: 'Bald' },
    { firstName: 'George', lastName: 'Tuska' },
    { firstName: 'Gil', lastName: 'Kane' },
    { firstName: 'Jim', lastName: 'Steranko' },
    { firstName: 'Gene', lastName: 'Colan' },
    { firstName: 'Sal', lastName: 'Buscema' },
    { firstName: 'Herb', lastName: 'Trimpe' },
    { firstName: 'Alan', lastName: 'Weiss' },
    { firstName: 'John', lastName: 'Romita', generationalSuffix: 'Sr.' },
    { firstName: 'Pablo', lastName: 'Marcos' },
    { firstName: 'Don', lastName: 'Perlin' },
    { firstName: 'John', lastName: 'Byrne' },
  ],
};

export const augmentedSuperUsers = <DBP extends DbPlatform>(dbPlatform: DBP) =>
  superUsers(dbPlatform).map(u =>
    Object.assign(u, {
      nicknames: [u.nickname, ...nicknameMap[u.madeUpName]],
      earlyPencilers: earlyPencilersMap[u.madeUpName],
    })
  ) as DBP extends 'mssql' | 'sqlite' ? AugmentedSuperUser<0 | 1>[] : AugmentedSuperUser<boolean>[];

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

const defaultTableName = 'superusers';
const defaultDbCommandOptions = { unquoted: false } as const;

interface DBCommandOptions {
  unquoted?: boolean;
  includeNestedArrays?: boolean;
  tableName?: string;
}

export const CREATE_TABLE = (
  dbPlatform: DbPlatform,
  {
    unquoted = false,
    includeNestedArrays = false,
    tableName = defaultTableName,
  }: DBCommandOptions = defaultDbCommandOptions
) => `CREATE TABLE ${tableName ?? defaultTableName} (
  ${unquote('firstName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('lastName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('enhanced', unquoted)} ${enhancedColumnType[dbPlatform]} NOT NULL,
  ${unquote('madeUpName', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('nickname', unquoted)} ${textColumnType[dbPlatform]} NOT NULL,
  ${unquote('powerUpAge', unquoted)} INT NULL${
    includeNestedArrays
      ? `,
  ${unquote('nicknames', unquoted)} ${textColumnType[dbPlatform]}[]`
      : ``
  }
)`;

export const CREATE_INDEX = ({
  unquoted = false,
  tableName = defaultTableName,
}: DBCommandOptions = defaultDbCommandOptions) =>
  `CREATE UNIQUE INDEX ndx${tableName} ON ${tableName} (${unquote('firstName', unquoted)}, ${unquote('lastName', unquoted)})`;

export const INSERT_INTO = (
  user: AugmentedSuperUser,
  dbPlatform: DbPlatform,
  {
    unquoted = false,
    includeNestedArrays = false,
    tableName = defaultTableName,
  }: DBCommandOptions = defaultDbCommandOptions
) => `
INSERT INTO ${tableName ?? defaultTableName} (
  ${unquote('firstName', unquoted)},
  ${unquote('lastName', unquoted)},
  ${unquote('enhanced', unquoted)},
  ${unquote('madeUpName', unquoted)},
  ${unquote('nickname', unquoted)},
  ${unquote('powerUpAge', unquoted)}${
    includeNestedArrays
      ? `,
  ${unquote('nicknames', unquoted)}`
      : ``
  }
) VALUES (
  '${user.firstName}',
  '${user.lastName}',
  ${platformBoolean[dbPlatform][user.enhanced ? 0 : 1]},
  '${user.madeUpName}',
  '${user.nickname}',
  ${typeof user.powerUpAge === 'number' ? user.powerUpAge : 'NULL'}${
    includeNestedArrays
      ? `,
  ARRAY[${user.nicknames.map(nn => `'${nn}'`).join(',')}]`
      : ``
  }
)`;

export const sqlBase = `SELECT * FROM superusers WHERE `;
export const getSqlOrderBy = (unquoted = false) => ` ORDER BY ${unquote('madeUpName', unquoted)}`;

export const dbSetup = (
  dbPlatform: DbPlatform,
  opts: DBCommandOptions = defaultDbCommandOptions
): string =>
  [
    CREATE_TABLE(dbPlatform, opts),
    CREATE_INDEX(opts),
    ...augmentedSuperUsers(dbPlatform).map(user => INSERT_INTO(user, dbPlatform, opts)),
  ].join(';');

export const dbTests = (
  superUsers: SuperUser[] | AugmentedSuperUser[]
): Record<string, TestSQLParams> => ({
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

export const genStringsMatchQuery = (match: MatchConfig): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: [
    {
      field: 'nicknames',
      operator: '=',
      value: {
        combinator: 'and',
        rules: [{ field: '', operator: 'contains', value: 'S' }],
      },
      match,
    },
  ],
});

export const genObjectsMatchQuery = (match: MatchConfig): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: [
    {
      field: 'earlyPencilers',
      operator: '=',
      value: {
        combinator: 'and',
        rules: [{ field: 'lastName', operator: 'contains', value: 'S' }],
      },
      match,
    },
  ],
});

export type MatchModeTests = Record<
  'strings' | 'objects',
  [string, MatchConfig, (u: AugmentedSuperUser) => boolean][]
>;

// TODO: Add variation to the queries so they all produce _some_ results
export const matchModeTests: MatchModeTests = {
  strings: [
    ['"all"', { mode: 'all' }, u => u.nicknames.every(n => n.includes('S'))],
    ['"none"', { mode: 'none' }, u => u.nicknames.every(n => !n.includes('S'))],
    ['"some"', { mode: 'some' }, u => u.nicknames.some(n => n.includes('S'))],
    [
      '"none" as atMost 0',
      { mode: 'atMost', threshold: 0 },
      u => u.nicknames.every(n => !n.includes('S')),
    ],
    [
      '"some" as atLeast 1',
      { mode: 'atLeast', threshold: 1 },
      u => u.nicknames.some(n => n.includes('S')),
    ],
    [
      '"atLeast" integer',
      { mode: 'atLeast', threshold: 2 },
      u => u.nicknames.filter(n => n.includes('S')).length >= 2,
    ],
    [
      '"atLeast" decimal',
      { mode: 'atLeast', threshold: 0.5 },
      u => u.nicknames.filter(n => n.includes('S')).length >= u.nicknames.length / 2,
    ],
    [
      '"atMost" integer',
      { mode: 'atMost', threshold: 2 },
      u => u.nicknames.filter(n => n.includes('S')).length <= 2,
    ],
    [
      '"atMost" decimal',
      { mode: 'atMost', threshold: 0.5 },
      u => u.nicknames.filter(n => n.includes('S')).length <= u.nicknames.length / 2,
    ],
    [
      '"exactly" integer',
      { mode: 'exactly', threshold: 2 },
      u => u.nicknames.filter(n => n.includes('S')).length === 2,
    ],
    [
      '"exactly" decimal',
      { mode: 'exactly', threshold: 0.5 },
      u => u.nicknames.filter(n => n.includes('S')).length === u.nicknames.length / 2,
    ],
  ],
  objects: [
    ['"all"', { mode: 'all' }, u => u.earlyPencilers.every(n => n.lastName.includes('S'))],
    ['"none"', { mode: 'none' }, u => u.earlyPencilers.every(n => !n.lastName.includes('S'))],
    ['"some"', { mode: 'some' }, u => u.earlyPencilers.some(n => n.lastName.includes('S'))],
    [
      '"none" as atMost 0',
      { mode: 'atMost', threshold: 0 },
      u => u.earlyPencilers.every(n => !n.lastName.includes('S')),
    ],
    [
      '"some" as atLeast 1',
      { mode: 'atLeast', threshold: 1 },
      u => u.earlyPencilers.some(n => n.lastName.includes('S')),
    ],
    [
      '"atLeast" integer',
      { mode: 'atLeast', threshold: 2 },
      u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length >= 2,
    ],
    [
      '"atLeast" decimal',
      { mode: 'atLeast', threshold: 0.5 },
      u =>
        u.earlyPencilers.filter(n => n.lastName.includes('S')).length >=
        u.earlyPencilers.length / 2,
    ],
    [
      '"atMost" integer',
      { mode: 'atMost', threshold: 2 },
      u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length <= 2,
    ],
    [
      '"atMost" decimal',
      { mode: 'atMost', threshold: 0.5 },
      u =>
        u.earlyPencilers.filter(n => n.lastName.includes('S')).length <=
        u.earlyPencilers.length / 2,
    ],
    [
      '"exactly" integer',
      { mode: 'exactly', threshold: 2 },
      u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length === 2,
    ],
    [
      '"exactly" decimal',
      { mode: 'exactly', threshold: 0.5 },
      u =>
        u.earlyPencilers.filter(n => n.lastName.includes('S')).length ===
        u.earlyPencilers.length / 2,
    ],
  ],
};
