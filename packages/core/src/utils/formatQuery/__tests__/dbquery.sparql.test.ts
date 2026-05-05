// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import type { RuleGroupType } from '../../../types';
import type { SuperUser } from '../dbqueryTestUtils';
import { fields, superUsers as getSuperUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { sparqlGraphProcessor, sparqlTypedLiteralProcessor } from './graphTestUtils';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const superUsers = getSuperUsers('postgres');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const selectVariables = fieldNames.map(f => `?${f}`);

// Triple patterns bind each property to a SPARQL variable
const triplePatterns = fieldNames.map(f => `?su <${f}> ?${f}`).join(' .\n    ');

const selectClause = `SELECT ${selectVariables.join(' ')}`;

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
 * Builds and executes a SPARQL query:
 *   SELECT ?vars WHERE { triple_patterns . FILTER(expression) } ORDER BY ?madeUpName
 *
 * Nodes without a `powerUpAge` triple are excluded from results because
 * the required triple pattern `?su <powerUpAge> ?powerUpAge` has no match.
 */
const runSPARQL = async (query: Parameters<typeof formatQuery>[0], expectedResult: SuperUser[]) => {
  const filter = formatQuery(query, { format: 'sparql', parseNumbers: true });
  const sparql = `${selectClause} WHERE {
    ?su a <SuperUser> .
    ${triplePatterns} .
    FILTER(${filter})
  } ORDER BY ?madeUpName`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeSparql(sparql);
  expect(result.toArray()).toEqual(expectedResult.map(toSparqlRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// All SPARQL results only include users that have a powerUpAge triple.
// Batman (powerUpAge: null) has no triple, so the required pattern excludes him.
const superUsersWithAge = superUsers.filter(u => u.powerUpAge !== null);

// Operators NOT tested and why:
//  - 'null' / 'notNull': Grafeo's SPARQL engine hangs when evaluating
//    `OPTIONAL { ... } FILTER(!BOUND(?var))`.
//  - 'in' / 'notIn': formatQuery expands IN to a chain of `||` / `&&`
//    equality checks which Grafeo's SPARQL engine does not support.
//  - Shared `dbTests` entries are not reused because SPARQL requires
//    `?variable` field names and manual triple patterns.
describe('SPARQL (Grafeo)', () => {
  test('=', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?firstName', operator: '=', value: 'Peter' },
          { field: '?lastName', operator: '=', value: 'Parker' },
        ],
      },
      superUsersWithAge.filter(u => u.firstName === 'Peter' && u.lastName === 'Parker')
    );
  });

  test('!=', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?firstName', operator: '!=', value: 'Peter' }] },
      superUsersWithAge.filter(u => u.firstName !== 'Peter')
    );
  });

  test('contains', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?madeUpName', operator: 'contains', value: 'man' }] },
      superUsersWithAge.filter(u => u.madeUpName.includes('man'))
    );
  });

  test('doesNotContain', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?madeUpName', operator: 'doesNotContain', value: 'r' }],
      },
      superUsersWithAge.filter(u => !u.madeUpName.includes('r'))
    );
  });

  test('beginsWith', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?firstName', operator: 'beginsWith', value: 'P' }] },
      superUsersWithAge.filter(u => u.firstName.startsWith('P'))
    );
  });

  test('endsWith', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?madeUpName', operator: 'endsWith', value: 'man' }] },
      superUsersWithAge.filter(u => u.madeUpName.endsWith('man'))
    );
  });

  test('>', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?powerUpAge', operator: '>', value: 15 }] },
      superUsersWithAge.filter(u => u.powerUpAge! > 15)
    );
  });

  test('>=', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?powerUpAge', operator: '>=', value: 15 }] },
      superUsersWithAge.filter(u => u.powerUpAge! >= 15)
    );
  });

  test('<', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?powerUpAge', operator: '<', value: 20 }] },
      superUsersWithAge.filter(u => u.powerUpAge! < 20)
    );
  });

  test('<=', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?powerUpAge', operator: '<=', value: 15 }] },
      superUsersWithAge.filter(u => u.powerUpAge! <= 15)
    );
  });

  test('boolean', async () => {
    await runSPARQL(
      { combinator: 'and', rules: [{ field: '?enhanced', operator: '=', value: true }] },
      superUsersWithAge.filter(u => u.enhanced)
    );
  });

  test('between', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?powerUpAge', operator: 'between', value: [10, 30] }],
      },
      superUsersWithAge.filter(u => u.powerUpAge! >= 10 && u.powerUpAge! <= 30)
    );
  });

  test('notBetween', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?firstName', operator: 'notBetween', value: ['C', 'R'] }],
      },
      superUsersWithAge.filter(u => !(u.firstName >= 'C' && u.firstName <= 'R'))
    );
  });

  test('and/or', async () => {
    await runSPARQL(
      {
        combinator: 'or',
        rules: [
          { field: '?firstName', operator: 'beginsWith', value: 'P' },
          {
            combinator: 'and',
            rules: [
              { field: '?madeUpName', operator: 'doesNotContain', value: 'Bat' },
              { field: '?madeUpName', operator: 'endsWith', value: 'man' },
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
            rules: [{ field: '?madeUpName', operator: 'beginsWith', value: 'S' }],
          },
        ],
      },
      superUsersWithAge.filter(u => !u.madeUpName.startsWith('S'))
    );
  });
});

// ─── Field-to-Field Comparison Tests ──────────────────────────────────────────

describe('SPARQL field-to-field (Grafeo)', () => {
  test('< (alphabetical comparison)', async () => {
    // Clark < Kent → Superman
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?firstName', operator: '<', value: '?lastName', valueSource: 'field' }],
      },
      superUsersWithAge.filter(u => u.firstName < u.lastName)
    );
  });

  test('!= (different property values)', async () => {
    await runSPARQL(
      {
        combinator: 'and',
        rules: [{ field: '?firstName', operator: '!=', value: '?lastName', valueSource: 'field' }],
      },
      superUsersWithAge.filter(u => u.firstName !== u.lastName)
    );
  });

  test('CONTAINS (madeUpName contains nickname)', async () => {
    // "Captain America" CONTAINS "Cap" → Captain America
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          { field: '?madeUpName', operator: 'contains', value: '?nickname', valueSource: 'field' },
        ],
      },
      superUsersWithAge.filter(u => u.madeUpName.includes(u.nickname))
    );
  });

  test('STRSTARTS (madeUpName starts with nickname)', async () => {
    // "Captain America" STRSTARTS "Cap" → Captain America
    await runSPARQL(
      {
        combinator: 'and',
        rules: [
          {
            field: '?madeUpName',
            operator: 'beginsWith',
            value: '?nickname',
            valueSource: 'field',
          },
        ],
      },
      superUsersWithAge.filter(u => u.madeUpName.startsWith(u.nickname))
    );
  });
});

// ─── Graph-Specific Pattern Tests (custom ruleProcessor) ──────────────────────

const runSPARQLCustom = async (
  query: RuleGroupType,
  expectedResult: SuperUser[],
  ruleProcessor: typeof sparqlGraphProcessor
) => {
  const filter = formatQuery(query, { format: 'sparql', parseNumbers: true, ruleProcessor });
  const sparql = `${selectClause} WHERE {
    ?su a <SuperUser> .
    ${triplePatterns} .
    FILTER(${filter})
  } ORDER BY ?madeUpName`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeSparql(sparql);
  expect(result.toArray()).toEqual(expectedResult.map(toSparqlRow));
};

describe('SPARQL graph patterns (Grafeo)', () => {
  describe('regex', () => {
    test('matchesRegex — names ending in "man"', async () => {
      await runSPARQLCustom(
        {
          combinator: 'and',
          rules: [{ field: '?madeUpName', operator: 'matchesRegex', value: '.*man$' }],
        },
        superUsersWithAge.filter(u => /.*man$/.test(u.madeUpName)),
        sparqlGraphProcessor
      );
    });

    test('doesNotMatchRegex — names not starting with "S"', async () => {
      await runSPARQLCustom(
        {
          combinator: 'and',
          rules: [{ field: '?madeUpName', operator: 'doesNotMatchRegex', value: '^S.*' }],
        },
        superUsersWithAge.filter(u => !/^S.*/.test(u.madeUpName)),
        sparqlGraphProcessor
      );
    });
  });

  describe('typed literals', () => {
    const typedFields = [
      { name: '?powerUpAge', label: 'Power Up Age', inputType: 'number' as const },
    ];

    test('xsd:integer comparison', async () => {
      const filter = formatQuery(
        { combinator: 'and', rules: [{ field: '?powerUpAge', operator: '>', value: '15' }] },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor, fields: typedFields }
      );
      const sparql = `${selectClause} WHERE {
        ?su a <SuperUser> .
        ${triplePatterns} .
        FILTER(${filter})
      } ORDER BY ?madeUpName`;
      // oxlint-disable-next-line typescript/no-explicit-any
      const result = await (db as any).executeSparql(sparql);
      expect(result.toArray()).toEqual(
        superUsersWithAge.filter(u => u.powerUpAge! > 15).map(toSparqlRow)
      );
    });
  });

  describe('case-insensitive', () => {
    test('equalsIgnoreCase', async () => {
      await runSPARQLCustom(
        {
          combinator: 'and',
          rules: [{ field: '?firstName', operator: 'equalsIgnoreCase', value: 'steve' }],
        },
        superUsersWithAge.filter(u => u.firstName.toLowerCase() === 'steve'),
        sparqlGraphProcessor
      );
    });

    test('containsIgnoreCase', async () => {
      await runSPARQLCustom(
        {
          combinator: 'and',
          rules: [{ field: '?madeUpName', operator: 'containsIgnoreCase', value: 'spider' }],
        },
        superUsersWithAge.filter(u => u.madeUpName.toLowerCase().includes('spider')),
        sparqlGraphProcessor
      );
    });

    test('beginsWithIgnoreCase', async () => {
      await runSPARQLCustom(
        {
          combinator: 'and',
          rules: [{ field: '?madeUpName', operator: 'beginsWithIgnoreCase', value: 'super' }],
        },
        superUsersWithAge.filter(u => u.madeUpName.toLowerCase().startsWith('super')),
        sparqlGraphProcessor
      );
    });
  });
});
