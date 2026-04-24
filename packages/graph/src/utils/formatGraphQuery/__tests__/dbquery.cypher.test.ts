// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { transformQuery, type RuleGroupType } from '@react-querybuilder/core';
import type {
  SuperUser,
  TestSQLParams,
} from '../../../../../core/src/utils/formatQuery/dbqueryTestUtils';
import {
  dbTests,
  fields,
  superUsers as getSuperUsers,
} from '../../../../../core/src/utils/formatQuery/dbqueryTestUtils';
import type { CypherFilterMeta, CypherPatternMeta, FormatGraphQueryOptions } from '../../../types';
import { formatCypher } from '../formatCypher';
import { formatGraphQuery } from '../formatGraphQuery';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

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

const runCypher = async (
  query: RuleGroupType,
  expectedResult: SuperUser[],
  fqOptions?: Partial<FormatGraphQueryOptions>
) => {
  const fullQuery: RuleGroupType = { ...query, rules: [suPatternRule, ...query.rules] };
  const cypher = fqOptions
    ? formatGraphQuery(fullQuery, { format: 'cypher', includeReturn: false, ...fqOptions })
    : formatCypher(fullQuery, { includeReturn: false });
  const fullCypher = `${cypher}\n${returnClause}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeCypher(fullCypher);
  expect(result.toArray()).toEqual(expectedResult.map(toCypherRow));
};

const testCypher = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('cypher', async () => {
    const newQuery = transformQuery(query, {
      ruleProcessor: r => ({ ...r, field: `su.${r.field}`, meta: filterMeta }),
    });
    const {
      format: _format,
      ruleProcessor: _rp,
      ruleGroupProcessor: _rgp,
      ...graphFqOptions
    } = fqOptions ?? {};
    await runCypher(newQuery, expectedResult, { parseNumbers: true, ...graphFqOptions });
  });
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Cypher (Grafeo)', () => {
  // Skipped dbTests entries:
  //  - 'bigint': Cypher/Grafeo does not support BigInt literals.
  for (const [name, t] of Object.entries(dbTests(superUsers)).filter(
    ([k]) => !['bigint'].includes(k)
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

  test('=', async () => {
    await runCypher(
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

  test('!=', async () => {
    await runCypher(
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

  test('beginsWith', async () => {
    await runCypher(
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

  test('doesNotBeginWith', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotBeginWith', value: 'S', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.startsWith('S'))
    );
  });

  test('endsWith', async () => {
    await runCypher(
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

  test('doesNotEndWith', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotEndWith', value: 'n', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.endsWith('n'))
    );
  });

  test('contains', async () => {
    await runCypher(
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

  test('doesNotContain', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.madeUpName', operator: 'doesNotContain', value: 'r', meta: filterMeta },
        ],
      },
      superUsers.filter(u => !u.madeUpName.includes('r'))
    );
  });

  test('>', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<', value: 20, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('boolean', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.enhanced', operator: '=', value: true, meta: filterMeta }],
      },
      superUsers.filter(u => u.enhanced)
    );
  });

  test('between', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'between', value: [10, 30], meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', async () => {
    // Use a non-nullable string field to avoid null comparison issues
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.firstName', operator: 'notBetween', value: ['C', 'R'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('in', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'in', value: ['Rogers', 'Wayne'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );
  });

  test('notIn', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'notIn', value: ['Parker', 'Kent'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => !['Parker', 'Kent'].includes(u.lastName))
    );
  });

  test('null', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'null', value: null, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge === null)
    );
  });

  test('notNull', async () => {
    await runCypher(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'notNull', value: null, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null)
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
