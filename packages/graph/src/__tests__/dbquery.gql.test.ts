// oxlint-disable jest/expect-expect

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type {
  GraphLiteDB as GraphLiteDBType,
  GraphLiteSession as GraphLiteSessionType,
} from '@jakeboone02/graphlite-node';
import { transformQuery, type RuleGroupType } from '@react-querybuilder/core';
import type {
  SuperUser,
  TestSQLParams,
} from '../../../core/src/utils/formatQuery/dbqueryTestUtils';
import {
  dbTests,
  superUsers as getSuperUsers,
} from '../../../core/src/utils/formatQuery/dbqueryTestUtils';
import { formatGQL } from '../formatCypher';
import type { CypherFilterMeta, CypherPatternMeta } from '../types';

// Native addon — use require for reliable .node file loading
const { GraphLiteDB } = require('@jakeboone02/graphlite-node') as {
  GraphLiteDB: typeof GraphLiteDBType;
};

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const filterMeta: CypherFilterMeta = { graphRole: 'filter' };

const suPatternRule = {
  field: '_type',
  operator: 'is',
  value: 'SuperUser',
  meta: {
    graphRole: 'pattern',
    nodeAlias: 'su',
    nodeLabel: 'SuperUser',
  } satisfies CypherPatternMeta,
};

const returnFields = [
  'su.firstName',
  'su.lastName',
  'su.enhanced',
  'su.madeUpName',
  'su.nickname',
  'su.powerUpAge',
] as const;

const returnClause = `RETURN ${returnFields.join(', ')} ORDER BY su.madeUpName`;

const toGqlRow = (u: SuperUser): Record<string, unknown> => ({
  'su.firstName': u.firstName,
  'su.lastName': u.lastName,
  'su.enhanced': u.enhanced,
  'su.madeUpName': u.madeUpName,
  'su.nickname': u.nickname,
  'su.powerUpAge': u.powerUpAge,
});

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

const runGQL = (query: RuleGroupType, expectedResult: SuperUser[]) => {
  const fullQuery: RuleGroupType = { ...query, rules: [suPatternRule, ...query.rules] };
  const gql = `${formatGQL(fullQuery, { includeReturn: false })}\n${returnClause}`;
  const result = session.query(gql);
  expect(result.rows).toEqual(expectedResult.map(toGqlRow));
};

const testGQL = ({ query, expectedResult }: TestSQLParams) => {
  test('gql', () => {
    const newQuery = transformQuery(query, {
      ruleProcessor: r => ({ ...r, field: `su.${r.field}`, meta: filterMeta }),
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
          { field: 'su.firstName', operator: 'beginsWith', value: 'P', meta: filterMeta },
          {
            combinator: 'and',
            rules: [
              {
                field: 'su.madeUpName',
                operator: 'doesNotContain',
                value: 'Bat',
                meta: filterMeta,
              },
              { field: 'su.madeUpName', operator: 'endsWith', value: 'man', meta: filterMeta },
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

  test('=', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: '=', value: 'Peter', meta: filterMeta },
          { field: 'su.lastName', operator: '=', value: 'Parker', meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.firstName === 'Peter' && u.lastName === 'Parker')
    );
  });

  test('!=', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: '!=', value: 'Peter', meta: filterMeta },
          { field: 'su.lastName', operator: '!=', value: 'Parker', meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.firstName !== 'Peter' && u.lastName !== 'Parker')
    );
  });

  test('beginsWith', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: 'beginsWith', value: 'P', meta: filterMeta },
          { field: 'su.lastName', operator: 'beginsWith', value: 'P', meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.firstName.startsWith('P') && u.lastName.startsWith('P'))
    );
  });

  test('doesNotBeginWith', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotBeginWith', value: 'S', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.startsWith('S'))
    );
  });

  test('endsWith', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: 'endsWith', value: 'e', meta: filterMeta },
          { field: 'su.lastName', operator: 'endsWith', value: 's', meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.firstName.endsWith('e') && u.lastName.endsWith('s'))
    );
  });

  test('doesNotEndWith', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotEndWith', value: 'n', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.endsWith('n'))
    );
  });

  test('contains', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: 'contains', value: 'ete', meta: filterMeta },
          { field: 'su.lastName', operator: 'contains', value: 'ark', meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.firstName.includes('ete') && u.lastName.includes('ark'))
    );
  });

  test('doesNotContain', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotContain', value: 'r', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.includes('r'))
    );
  });

  test('>', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<', value: 20, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('boolean', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.enhanced', operator: '=', value: true, meta: filterMeta }],
      },
      superUsers.filter(u => u.enhanced)
    );
  });

  test('between', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'between', value: [10, 30], meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', () => {
    // Use a non-nullable string field to avoid GraphLite's
    // "NOT operator requires boolean operand" error on null values
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: 'notBetween', value: ['C', 'R'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('in', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'in', value: ['Rogers', 'Wayne'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );
  });

  test('notIn', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'notIn', value: ['Parker', 'Kent'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => !['Parker', 'Kent'].includes(u.lastName))
    );
  });

  test('null', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'null', value: null, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge === null)
    );
  });

  test('notNull', () => {
    runGQL(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'notNull', value: null, meta: filterMeta }],
      },
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
            rules: [
              { field: 'su.madeUpName', operator: 'beginsWith', value: 'S', meta: filterMeta },
            ],
          },
        ],
      },
      superUsers.filter(u => !u.madeUpName.startsWith('S'))
    );
  });
});
