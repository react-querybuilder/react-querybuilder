// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import type { RuleGroupType } from '../../../types';
import type { SuperUser } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  fields,
  superUsers as getSuperUsers,
  nicknameMap,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { gremlinGraphProcessor } from './graphTestUtils';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');
const augmented = augmentedSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const orderAndProject = `.order().by('madeUpName').valueMap(${fieldNames.map(f => `'${f}'`).join(', ')})`;

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

// ─── Graph-Specific Pattern Tests (custom ruleProcessor) ──────────────────────

const runGremlinCustom = async (query: RuleGroupType, expectedResult: SuperUser[]) => {
  const steps = formatQuery(query, {
    format: 'gremlin',
    parseNumbers: true,
    ruleProcessor: gremlinGraphProcessor,
  });
  const gremlin = `g.V().hasLabel('SuperUser')${steps}${orderAndProject}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeGremlin(gremlin);
  expect(result.toArray()).toEqual(expectedResult);
};

describe('Gremlin graph patterns (Grafeo)', () => {
  // Note: Grafeo's Gremlin engine may not support regex(), notRegex(),
  // containing() for list membership, or .ignoreCase(). These tests
  // document the expected Gremlin output and verify execution where supported.

  describe('regex', () => {
    test('matchesRegex — names ending in "man"', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'madeUpName', operator: 'matchesRegex', value: '.*man$' }],
        },
        superUsers.filter(u => /.*man$/.test(u.madeUpName))
      );
    });

    // Grafeo doesn't support negated predicates with arguments (notRegex)
    // oxlint-disable-next-line no-disabled-tests
    test.skip('doesNotMatchRegex — names not starting with "S"', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'madeUpName', operator: 'doesNotMatchRegex', value: '^S.*' }],
        },
        superUsers.filter(u => !/^S.*/.test(u.madeUpName))
      );
    });
  });

  describe('list containment', () => {
    // Grafeo's containing() operates on string contents, not list membership
    // oxlint-disable-next-line no-disabled-tests
    test.skip('listContains — nicknames containing "Cap"', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'nicknames', operator: 'listContains', value: 'Cap' }],
        },
        superUsers.filter(u => [u.nickname, ...(nicknameMap[u.madeUpName] ?? [])].includes('Cap'))
      );
    });

    // Grafeo doesn't support notContaining() predicate
    // oxlint-disable-next-line no-disabled-tests
    test.skip('listDoesNotContain — nicknames not containing "Spidey"', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'nicknames', operator: 'listDoesNotContain', value: 'Spidey' }],
        },
        superUsers.filter(
          u => ![u.nickname, ...(nicknameMap[u.madeUpName] ?? [])].includes('Spidey')
        )
      );
    });
  });

  describe('case-insensitive', () => {
    // Grafeo doesn't support .ignoreCase() method chaining on predicates
    // oxlint-disable-next-line no-disabled-tests
    test.skip('equalsIgnoreCase', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'firstName', operator: 'equalsIgnoreCase', value: 'steve' }],
        },
        superUsers.filter(u => u.firstName.toLowerCase() === 'steve')
      );
    });

    // Grafeo doesn't support .ignoreCase() method chaining on predicates
    // oxlint-disable-next-line no-disabled-tests
    test.skip('containsIgnoreCase', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'madeUpName', operator: 'containsIgnoreCase', value: 'spider' }],
        },
        superUsers.filter(u => u.madeUpName.toLowerCase().includes('spider'))
      );
    });

    // Grafeo doesn't support .ignoreCase() method chaining on predicates
    // oxlint-disable-next-line no-disabled-tests
    test.skip('beginsWithIgnoreCase', async () => {
      await runGremlinCustom(
        {
          combinator: 'and',
          rules: [{ field: 'madeUpName', operator: 'beginsWithIgnoreCase', value: 'super' }],
        },
        superUsers.filter(u => u.madeUpName.toLowerCase().startsWith('super'))
      );
    });
  });
});
