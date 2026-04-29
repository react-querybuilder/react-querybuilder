// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { transformQuery } from '../../transformQuery';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbTests, fields, superUsers as getSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

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
  for (const u of superUsers) {
    db.createNode(['SuperUser'], u);
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
