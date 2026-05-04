// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import type { RuleGroupType } from '../../../types';
import { transformQuery } from '../../transformQuery';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbTests,
  fields,
  superUsers as getSuperUsers,
  nicknameMap,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { cypherGraphProcessor } from './graphTestUtils';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');
const augmented = augmentedSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const returnFields = fieldNames.map(f => `su.${f}`);
const returnClause = `RETURN ${returnFields.join(', ')} ORDER BY su.madeUpName`;

const toCypherRow = (u: SuperUser): Record<string, unknown> =>
  Object.fromEntries(fieldNames.map(f => [`su.${f}`, u[f]]));

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GrafeoDBType;

beforeAll(() => {
  db = GrafeoDB.create();
  for (const u of augmented) {
    // Store nicknames as a list property alongside the standard properties
    db.createNode(['SuperUser'], { ...u, nicknames: u.nicknames });
  }
});

afterAll(() => {
  db?.close();
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

const runCypher = async (query: Parameters<typeof formatQuery>[0], expectedResult: SuperUser[]) => {
  const where = formatQuery(query, { format: 'cypher', parseNumbers: true });
  const cypher = `MATCH (su:SuperUser)\nWHERE ${where}\n${returnClause}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeCypher(cypher);
  expect(result.toArray()).toEqual(expectedResult.map(toCypherRow));
};

const testCypher = ({ query, expectedResult }: TestSQLParams) => {
  test('cypher', async () => {
    const newQuery = transformQuery(query, {
      ruleProcessor: r => ({ ...r, field: `su.${r.field}` }),
    });
    await runCypher(newQuery, expectedResult);
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Cypher (Grafeo)', () => {
  // Skipped dbTests entries:
  //  - 'greater than' etc.: Shared tests combine numeric and string-typed values
  //    for the same operator. Cypher is strongly typed.
  //  - 'between/notBetween': Same mixed-type issue.
  //  - 'bigint': Cypher/Grafeo does not support BigInt literals.
  //  - 'manipulateValueOrder': SQL-specific format option.
  for (const [name, t] of Object.entries(dbTests(superUsers)).filter(
    ([k]) =>
      ![
        'greater than',
        'greater than or equal to',
        'less than',
        'less than or equal to',
        'between/notBetween',
        'bigint',
        'manipulateValueOrder',
      ].includes(k)
  )) {
    describe(name, () => {
      testCypher(t);
    });
  }

  test('and/or', async () => {
    await runCypher(
      {
        combinator: 'or',
        rules: [
          { field: 'su.firstName', operator: 'beginsWith', value: 'P' },
          {
            combinator: 'and',
            rules: [
              { field: 'su.madeUpName', operator: 'doesNotContain', value: 'Bat' },
              { field: 'su.madeUpName', operator: 'endsWith', value: 'man' },
            ],
          },
        ],
      },
      superUsers.filter(
        u =>
          u.firstName.startsWith('P') ||
          (!u.madeUpName.includes('Bat') && u.madeUpName.endsWith('man'))
      )
    );
  });

  test('>', async () => {
    await runCypher(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '>', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runCypher(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '>=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runCypher(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '<', value: 20 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runCypher(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '<=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('between', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'between', value: [10, 30] }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.firstName', operator: 'notBetween', value: ['C', 'R'] }],
      },
      superUsers.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('NOT group', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          {
            combinator: 'and',
            not: true,
            rules: [{ field: 'su.madeUpName', operator: 'beginsWith', value: 'S' }],
          },
        ],
      },
      superUsers.filter(u => !u.madeUpName.startsWith('S'))
    );
  });
});

// ─── Graph-Specific Pattern Tests (custom ruleProcessor) ──────────────────────

const runCypherCustom = async (query: RuleGroupType, expectedResult: SuperUser[]) => {
  const where = formatQuery(query, {
    format: 'cypher',
    parseNumbers: true,
    ruleProcessor: cypherGraphProcessor,
  });
  const cypher = `MATCH (su:SuperUser)\nWHERE ${where}\n${returnClause}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeCypher(cypher);
  expect(result.toArray()).toEqual(expectedResult.map(toCypherRow));
};

describe('Cypher graph patterns (Grafeo)', () => {
  describe('regex', () => {
    test('matchesRegex — names ending in "man"', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.madeUpName', operator: 'matchesRegex', value: '.*man$' }],
        },
        superUsers.filter(u => /.*man$/.test(u.madeUpName))
      );
    });

    test('doesNotMatchRegex — names not starting with "S"', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.madeUpName', operator: 'doesNotMatchRegex', value: '^S.*' }],
        },
        superUsers.filter(u => !/^S.*/.test(u.madeUpName))
      );
    });
  });

  describe('list containment', () => {
    test('listContains — nicknames containing "Cap"', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.nicknames', operator: 'listContains', value: 'Cap' }],
        },
        superUsers.filter(u => [u.nickname, ...(nicknameMap[u.madeUpName] ?? [])].includes('Cap'))
      );
    });

    test('listDoesNotContain — nicknames not containing "Spidey"', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.nicknames', operator: 'listDoesNotContain', value: 'Spidey' }],
        },
        superUsers.filter(
          u => ![u.nickname, ...(nicknameMap[u.madeUpName] ?? [])].includes('Spidey')
        )
      );
    });
  });

  describe('case-insensitive', () => {
    test('equalsIgnoreCase', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.firstName', operator: 'equalsIgnoreCase', value: 'steve' }],
        },
        superUsers.filter(u => u.firstName.toLowerCase() === 'steve')
      );
    });

    test('containsIgnoreCase', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.madeUpName', operator: 'containsIgnoreCase', value: 'spider' }],
        },
        superUsers.filter(u => u.madeUpName.toLowerCase().includes('spider'))
      );
    });

    test('beginsWithIgnoreCase', async () => {
      await runCypherCustom(
        {
          combinator: 'and',
          rules: [{ field: 'su.madeUpName', operator: 'beginsWithIgnoreCase', value: 'super' }],
        },
        superUsers.filter(u => u.madeUpName.toLowerCase().startsWith('super'))
      );
    });
  });
});
