// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { type RuleGroupType } from '@react-querybuilder/core';
import type { SuperUser } from '../../../core/src/utils/formatQuery/dbqueryTestUtils';
import {
  fields,
  superUsers as getSuperUsers,
} from '../../../core/src/utils/formatQuery/dbqueryTestUtils';
import { formatGremlin } from '../formatGremlin';
import type { GremlinFilterMeta, GremlinPatternMeta } from '../types';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const filterMeta: GremlinFilterMeta = { graphRole: 'filter', graphLang: 'gremlin' };

const suPatternRule = {
  field: '_label',
  operator: 'hasLabel',
  value: 'SuperUser',
  meta: { graphRole: 'pattern', graphLang: 'gremlin' } satisfies GremlinPatternMeta,
};

const fieldNames = fields.map(f => f.name);

const orderAndProject = `.order().by('madeUpName').valueMap(${fieldNames.map(f => `'${f}'`).join(', ')})`;

const toGremlinRow = (u: SuperUser): Record<string, unknown> => ({ ...u });

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

const runGremlin = async (query: RuleGroupType, expectedResult: SuperUser[]) => {
  const fullQuery: RuleGroupType = { ...query, rules: [suPatternRule, ...query.rules] };
  const traversal = formatGremlin(fullQuery);
  const gremlin = `${traversal}${orderAndProject}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeGremlin(gremlin);
  expect(result.toArray()).toEqual(expectedResult.map(toGremlinRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// Operators NOT tested and why:
//  - 'doesNotContain' / 'doesNotBeginWith' / 'doesNotEndWith': formatGremlin
//    emits `notContaining()`, `notStartingWith()`, `notEndingWith()` predicates
//    which Grafeo's Gremlin engine does not recognize.
//  - 'and/or' compound groups and 'NOT group': formatGremlin emits compound
//    steps like `.or(__.has(...), __.has(...))` and `.not(__.has(...))`.
//    Grafeo's Gremlin engine does not support the `__` (anonymous traversal)
//    syntax required for these compound predicates.
//  - Shared `dbTests` entries are not reused here because the shared tests
//    combine numeric and string-typed values (e.g. `> 15` AND `> '15'`)
//    and Gremlin is strongly typed.
describe('Gremlin (Grafeo)', () => {
  test('=', async () => {
    await runGremlin(
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
    await runGremlin(
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
    await runGremlin(
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

  test('endsWith', async () => {
    await runGremlin(
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

  test('contains', async () => {
    await runGremlin(
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

  test('>', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '>=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<', value: 20, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: '<=', value: 15, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('boolean', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.enhanced', operator: '=', value: true, meta: filterMeta }],
      },
      superUsers.filter(u => u.enhanced)
    );
  });

  test('between', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'between', value: [10, 30], meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween (outside)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [
          { field: 'su.powerUpAge', operator: 'notBetween', value: [10, 30], meta: filterMeta },
        ],
      },
      superUsers.filter(u => u.powerUpAge !== null && (u.powerUpAge! < 10 || u.powerUpAge! > 30))
    );
  });

  test('in (within)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'in', value: ['Rogers', 'Wayne'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );
  });

  test('notIn (without)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [
          { field: 'su.lastName', operator: 'notIn', value: ['Parker', 'Kent'], meta: filterMeta },
        ],
      },
      superUsers.filter(u => !['Parker', 'Kent'].includes(u.lastName))
    );
  });

  test('null (hasNot)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'null', value: null, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge === null)
    );
  });

  test('notNull (has)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'su.powerUpAge', operator: 'notNull', value: null, meta: filterMeta }],
      },
      superUsers.filter(u => u.powerUpAge !== null)
    );
  });
});
