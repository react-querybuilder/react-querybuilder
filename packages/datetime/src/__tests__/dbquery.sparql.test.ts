// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSPARQL } from '../getDatetimeRuleProcessorSPARQL';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const sparqlFields = fields.map(f => Object.assign({}, f, { name: `?${f.name}` }));
const fieldNames = fields.map(f => f.name);
const selectVariables = fieldNames.map(f => `?${f}`);
const triplePatterns = fieldNames.map(f => `?m <${f}> ?${f}`).join(' .\n    ');
const selectClause = `SELECT ${selectVariables.join(' ')}`;

interface SparqlRow {
  [key: string]: string;
}

const toSparqlRow = (m: (typeof musicians)[number]): SparqlRow => ({
  firstName: m.first_name,
  middleName: m.middle_name ?? '',
  lastName: m.last_name,
  birthdate: m.birthdate,
  created_at: now,
  updated_at: now,
});

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GrafeoDBType;

beforeAll(async () => {
  db = GrafeoDB.create();
  for (const m of musicians) {
    const middlePart = m.middle_name ? ` ; <middleName> "${m.middle_name}"` : ' ; <middleName> ""';
    // oxlint-disable-next-line typescript/no-explicit-any
    await (db as any).executeSparql(`INSERT DATA {
      <musician/${m.last_name}> a <Musician> ;
        <firstName> "${m.first_name}"${middlePart} ;
        <lastName> "${m.last_name}" ;
        <birthdate> "${m.birthdate}" ;
        <created_at> "${now}" ;
        <updated_at> "${now}" .
    }`);
  }
});

afterAll(() => {
  db?.close();
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

const runSPARQL = async (
  query: Parameters<typeof formatQuery>[0],
  expectedResult: (typeof musicians)[number][],
  apiFns: (typeof dateLibraryFunctions)[number][1]
) => {
  const filter = formatQuery(query, {
    format: 'sparql',
    parseNumbers: true,
    fields: sparqlFields,
    ruleProcessor: getDatetimeRuleProcessorSPARQL(apiFns),
  });
  const sparql = `${selectClause} WHERE {
    ?m a <Musician> .
    ${triplePatterns} .
    FILTER(${filter})
  } ORDER BY ?lastName`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeSparql(sparql);
  expect(result.toArray()).toEqual(expectedResult.map(toSparqlRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [testQuery, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const query = {
          ...testQuery,
          rules: testQuery.rules.map(r =>
            'field' in r ? Object.assign({}, r, { field: `?${r.field}` }) : r
          ),
        };
        const expected =
          expectation === 'all' ? musicians : musicians.filter(m => m.last_name === expectation);
        await runSPARQL(query, expected, apiFns);
      });
    }
  });
}
