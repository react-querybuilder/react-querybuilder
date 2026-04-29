// oxlint-disable jest/expect-expect

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {
  GraphLiteDB as GraphLiteDBType,
  GraphLiteSession as GraphLiteSessionType,
} from '@jakeboone02/graphlite-node';
import { transformQuery } from '../../transformQuery';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import { dbTests, fields, superUsers as getSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Native addon — use require for reliable .node file loading
const { GraphLiteDB } = require('@jakeboone02/graphlite-node') as {
  GraphLiteDB: typeof GraphLiteDBType;
};

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const returnFields = fieldNames.map(f => `su.${f}`);
const returnClause = `RETURN ${returnFields.join(', ')} ORDER BY su.madeUpName`;

const toGqlRow = (u: SuperUser): Record<string, unknown> =>
  Object.fromEntries(fieldNames.map(f => [`su.${f}`, u[f]]));

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GraphLiteDBType;
let session: GraphLiteSessionType;
let dbPath: string;

beforeAll(() => {
  dbPath = mkdtempSync(join(tmpdir(), 'graphlite-dbquery-'));
  db = GraphLiteDB.open(dbPath);
  session = db.createSession('admin');

  session.execute('CREATE SCHEMA /test');
  session.execute('SESSION SET SCHEMA /test');
  session.execute('CREATE GRAPH /test/superusers');
  session.execute('SESSION SET GRAPH /test/superusers');

  for (const u of superUsers) {
    const props = [
      `firstName: '${u.firstName}'`,
      `lastName: '${u.lastName}'`,
      `enhanced: ${u.enhanced}`,
      `madeUpName: '${u.madeUpName}'`,
      `nickname: '${u.nickname}'`,
      `powerUpAge: ${u.powerUpAge}`,
    ].join(', ');
    session.execute(`INSERT (:SuperUser {${props}})`);
  }
});

afterAll(() => {
  session?.close();
  db?.close();
  try {
    rmSync(dbPath, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

const runGQL = (query: Parameters<typeof formatQuery>[0], expectedResult: SuperUser[]) => {
  const where = formatQuery(query, { format: 'gql', parseNumbers: true });
  const gql = `MATCH (su:SuperUser)\nWHERE ${where}\n${returnClause}`;
  const result = session.query(gql);
  expect(result.rows).toEqual(expectedResult.map(toGqlRow));
};

const testGQL = ({ query, expectedResult }: TestSQLParams) => {
  test('gql', () => {
    const newQuery = transformQuery(query, {
      ruleProcessor: r => ({ ...r, field: `su.${r.field}` }),
    });
    runGQL(newQuery, expectedResult);
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GQL (GraphLite)', () => {
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
      testGQL(t);
    });
  }

  test('and/or', () => {
    runGQL(
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

  test('>', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '>', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '>=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '<', value: 20 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: '<=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('between', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'between', value: [10, 30] }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.firstName', operator: 'notBetween', value: ['C', 'R'] }],
      },
      superUsers.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('in', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.lastName', operator: 'in', value: ['Rogers', 'Wayne'] }],
      },
      superUsers.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );
  });

  test('notIn', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.lastName', operator: 'notIn', value: ['Parker', 'Kent'] }],
      },
      superUsers.filter(u => !['Parker', 'Kent'].includes(u.lastName))
    );
  });

  test('null', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: 'null', value: null }] },
      superUsers.filter(u => u.powerUpAge === null)
    );
  });

  test('notNull', () => {
    runGQL(
      { combinator: 'and', rules: [{ field: 'su.powerUpAge', operator: 'notNull', value: null }] },
      superUsers.filter(u => u.powerUpAge !== null)
    );
  });

  test('NOT group', () => {
    runGQL(
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
