// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { type RuleGroupType } from '@react-querybuilder/core';
import type { SuperUser } from '../../../../../core/src/utils/formatQuery/dbqueryTestUtils';
import {
  fields,
  superUsers as getSuperUsers,
} from '../../../../../core/src/utils/formatQuery/dbqueryTestUtils';
import type { SparqlFilterMeta, SparqlPatternMeta } from '../../../types';
import { formatSPARQL } from '../formatSPARQL';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const filterMeta: SparqlFilterMeta = { graphRole: 'filter', graphLang: 'sparql' };

const fieldNames = fields.map(f => f.name);

const suPatternRules = [
  {
    field: 'a',
    operator: 'binds',
    value: '<SuperUser>',
    meta: { graphRole: 'pattern', graphLang: 'sparql', subject: '?su' } satisfies SparqlPatternMeta,
  },
  ...fieldNames.map(name => ({
    field: `<${name}>`,
    operator: 'binds',
    value: `?${name}`,
    meta: { graphRole: 'pattern', graphLang: 'sparql', subject: '?su' } satisfies SparqlPatternMeta,
  })),
];

const selectVariables = fieldNames.map(name => `?${name}`);

const toSparqlRow = (u: SuperUser): Record<string, unknown> => ({
  firstName: u.firstName,
  lastName: u.lastName,
  enhanced: String(u.enhanced),
  madeUpName: u.madeUpName,
  nickname: u.nickname,
  powerUpAge: String(u.powerUpAge),
});

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GrafeoDBType;

beforeAll(async () => {
  db = GrafeoDB.create();

  for (const u of superUsers) {
    const pua = u.powerUpAge === null ? '' : ` ; <powerUpAge> ${u.powerUpAge}`;
    // oxlint-disable-next-line typescript/no-explicit-any
    await (db as any).executeSparql(`INSERT DATA {
      <su/${u.madeUpName.replace(/ /g, '_')}> a <SuperUser> ;
        <firstName> "${u.firstName}" ;
        <lastName> "${u.lastName}" ;
        <enhanced> ${u.enhanced} ;
        <madeUpName> "${u.madeUpName}" ;
        <nickname> "${u.nickname}"${pua} .
    }`);
  }
});

afterAll(() => {
  db?.close();
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

/**
 * Builds and executes a SPARQL query using formatSPARQL, then compares results.
 *
 * Users without a powerUpAge triple are excluded from results because
 * the required triple pattern `?su <powerUpAge> ?powerUpAge` has no match.
 * Tests that need null semantics are handled separately.
 */
const runSPARQL = async (query: RuleGroupType, expectedResult: SuperUser[]) => {
  const fullQuery: RuleGroupType = { ...query, rules: [...suPatternRules, ...query.rules] };
  const sparqlBase = formatSPARQL(fullQuery, { selectVariables });
  const sparql = `${sparqlBase.replace(/\}$/, '')}\n} ORDER BY ?madeUpName`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeSparql(sparql);
  expect(result.toArray()).toEqual(expectedResult.map(toSparqlRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// SPARQL operates on the RDF triple store. Nodes without a `powerUpAge` triple
// are excluded by the required triple pattern, so all SPARQL results only
// include users that have a powerUpAge value.
const superUsersWithAge = superUsers.filter(u => u.powerUpAge !== null);

// Operators NOT tested and why:
//  - 'null' / 'notNull': Grafeo's SPARQL engine hangs when evaluating
//    `OPTIONAL { ... } FILTER(!BOUND(?var))`, which is the standard SPARQL
//    pattern for null/not-null checks. Instead, unbound triples simply
//    exclude the row from results (see `superUsersWithAge` above).
//  - 'in' / 'notIn': formatSPARQL expands IN to a chain of `||` / `&&`
//    equality checks (e.g. `?x = "a" || ?x = "b"`). This is valid SPARQL
//    but Grafeo's SPARQL engine does not support disjunctions across
//    equality comparisons within a single FILTER.
//  - 'and()' / 'or()' compound groups with nested sub-groups: Not tested
//    because Grafeo's SPARQL engine does not support the `__` anonymous
//    traversal needed for compound Gremlin predicates (only relevant if
//    the test were ported from Gremlin).
//  - Shared `dbTests` entries are not reused here because SPARQL requires
//    `?variable` field names and SPARQL-specific pattern rules, unlike the
//    property-graph languages that use `alias.property` notation.
describe('SPARQL (Grafeo)', () => {
  test('=', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: '=', value: 'Peter', meta: filterMeta },
          { field: '?lastName', operator: '=', value: 'Parker', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => u.firstName === 'Peter' && u.lastName === 'Parker')
    );
  });

  test('!=', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: '!=', value: 'Peter', meta: filterMeta },
          { field: '?lastName', operator: '!=', value: 'Parker', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => u.firstName !== 'Peter' && u.lastName !== 'Parker')
    );
  });

  test('beginsWith (STRSTARTS)', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: 'beginsWith', value: 'P', meta: filterMeta },
          { field: '?lastName', operator: 'beginsWith', value: 'P', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => u.firstName.startsWith('P') && u.lastName.startsWith('P'))
    );
  });

  test('doesNotBeginWith', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?madeUpName', operator: 'doesNotBeginWith', value: 'S', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => !u.madeUpName.startsWith('S'))
    );
  });

  test('endsWith (STRENDS)', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: 'endsWith', value: 'e', meta: filterMeta },
          { field: '?lastName', operator: 'endsWith', value: 's', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => u.firstName.endsWith('e') && u.lastName.endsWith('s'))
    );
  });

  test('doesNotEndWith', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?madeUpName', operator: 'doesNotEndWith', value: 'n', meta: filterMeta }],
      },
      superUsersWithAge.filter(u => !u.madeUpName.endsWith('n'))
    );
  });

  test('contains (CONTAINS)', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: 'contains', value: 'ete', meta: filterMeta },
          { field: '?lastName', operator: 'contains', value: 'ark', meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => u.firstName.includes('ete') && u.lastName.includes('ark'))
    );
  });

  test('doesNotContain', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?madeUpName', operator: 'doesNotContain', value: 'r', meta: filterMeta }],
      },
      superUsersWithAge.filter(u => !u.madeUpName.includes('r'))
    );
  });

  test('>', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: '>', value: 15, meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: '>=', value: 15, meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: '<', value: 20, meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: '<=', value: 15, meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! <= 15)
    );
  });

  test('boolean', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?enhanced', operator: '=', value: true, meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.enhanced)
    );
  });

  test('between', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: 'between', value: [10, 30], meta: filterMeta }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: 'notBetween', value: ['C', 'R'], meta: filterMeta },
        ],
      },
      superUsersWithAge.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('and/or', async () => {
    await runSPARQL(
      {
        combinator: 'or',
        rules: [
          { field: '?firstName', operator: 'beginsWith', value: 'P', meta: filterMeta },
          {
            combinator: 'and',
            rules: [
              { field: '?madeUpName', operator: 'doesNotContain', value: 'Bat', meta: filterMeta },
              { field: '?madeUpName', operator: 'endsWith', value: 'man', meta: filterMeta },
            ],
          },
        ],
      },
      superUsersWithAge.filter(
        u =>
          u.firstName.startsWith('P') ||
          (!u.madeUpName.includes('Bat') && u.madeUpName.endsWith('man'))
      )
    );
  });

  test('NOT group', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          {
            combinator: 'and',
            not: true,
            rules: [{ field: '?madeUpName', operator: 'beginsWith', value: 'S', meta: filterMeta }],
          },
        ],
      },
      superUsersWithAge.filter(u => !u.madeUpName.startsWith('S'))
    );
  });
});
