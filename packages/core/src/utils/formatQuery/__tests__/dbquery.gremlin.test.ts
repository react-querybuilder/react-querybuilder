// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import type { SuperUser } from '../dbqueryTestUtils';
import { fields, superUsers as getSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const orderAndProject = `.order().by('madeUpName').valueMap(${fieldNames.map(f => `'${f}'`).join(', ')})`;

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

const runGremlin = async (
  query: Parameters<typeof formatQuery>[0],
  expectedResult: SuperUser[]
) => {
  const steps = formatQuery(query, { format: 'gremlin', parseNumbers: true });
  const gremlin = `g.V().hasLabel('SuperUser')${steps}${orderAndProject}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeGremlin(gremlin);
  expect(result.toArray()).toEqual(expectedResult);
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// Operators NOT tested and why:
//  - 'doesNotContain' / 'doesNotBeginWith' / 'doesNotEndWith': formatQuery emits
//    notContaining(), notStartingWith(), notEndingWith() predicates which Grafeo's
//    Gremlin engine does not recognize.
//  - 'and/or' compound groups and 'NOT group': formatQuery emits compound steps
//    like .or(__.has(...), __.has(...)) and .not(__.has(...)). Grafeo's Gremlin
//    engine does not support the __ anonymous traversal syntax.
//  - Shared dbTests entries are not reused because the shared tests combine numeric
//    and string-typed values and Gremlin is strongly typed.
describe('Gremlin (Grafeo)', () => {
  test('=', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Peter' },
          { field: 'lastName', operator: '=', value: 'Parker' },
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
          { field: 'firstName', operator: '!=', value: 'Peter' },
          { field: 'lastName', operator: '!=', value: 'Parker' },
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
          { field: 'firstName', operator: 'beginsWith', value: 'P' },
          { field: 'lastName', operator: 'beginsWith', value: 'P' },
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
          { field: 'firstName', operator: 'endsWith', value: 'e' },
          { field: 'lastName', operator: 'endsWith', value: 's' },
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
          { field: 'firstName', operator: 'contains', value: 'ete' },
          { field: 'lastName', operator: 'contains', value: 'ark' },
        ],
      },
      superUsers.filter(u => u.firstName.includes('ete') && u.lastName.includes('ark'))
    );
  });

  test('>', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: '>', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: '>=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: '<', value: 20 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: '<=', value: 15 }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! <= 15)
    );
  });

  test('boolean', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'enhanced', operator: '=', value: true }] },
      superUsers.filter(u => u.enhanced)
    );
  });

  test('between', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: 'between', value: [10, 30] }] },
      superUsers.filter(u => u.powerUpAge !== null && u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween (outside)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'powerUpAge', operator: 'notBetween', value: [10, 30] }],
      },
      superUsers.filter(u => u.powerUpAge !== null && (u.powerUpAge! < 10 || u.powerUpAge! > 30))
    );
  });

  test('in (within)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'lastName', operator: 'in', value: ['Rogers', 'Wayne'] }],
      },
      superUsers.filter(u => ['Rogers', 'Wayne'].includes(u.lastName))
    );
  });

  test('notIn (without)', async () => {
    await runGremlin(
      {
        combinator: 'and',
        rules: [{ field: 'lastName', operator: 'notIn', value: ['Parker', 'Kent'] }],
      },
      superUsers.filter(u => !['Parker', 'Kent'].includes(u.lastName))
    );
  });

  test('null (hasNot)', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: 'null', value: null }] },
      superUsers.filter(u => u.powerUpAge === null)
    );
  });

  test('notNull (has)', async () => {
    await runGremlin(
      { combinator: 'and', rules: [{ field: 'powerUpAge', operator: 'notNull', value: null }] },
      superUsers.filter(u => u.powerUpAge !== null)
    );
  });
});
