import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSPARQL } from '../getDatetimeRuleProcessorSPARQL';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const XSD = 'http://www.w3.org/2001/XMLSchema#';
const prefix = `PREFIX xsd: <${XSD}>\n`;

const sparqlFields = fields.map(f => Object.assign({}, f, { name: `?${f.name}` }));
const fieldNames = fields.map(f => f.name);
const selectVariables = fieldNames.map(f => `?${f}`);
const triplePatterns = fieldNames.map(f => `?m <${f}> ?${f}`).join(' .\n    ');
const selectClause = `${prefix}SELECT ${selectVariables.join(' ')}`;

// RDF/JS literal term, as returned by Grafeo >= 0.6
const literal = (value: string, type: string) => ({
  termType: 'Literal',
  value,
  language: '',
  datatype: { termType: 'NamedNode', value: `${XSD}${type}` },
});

const toSparqlRow = (m: (typeof musicians)[number]) => ({
  firstName: literal(m.first_name, 'string'),
  middleName: literal(m.middle_name ?? '', 'string'),
  lastName: literal(m.last_name, 'string'),
  birthdate: literal(m.birthdate, 'date'),
  created_at: literal(now, 'dateTime'),
  updated_at: literal(now, 'dateTime'),
});

// Drops term methods (`equals`) so rows compare structurally
// oxlint-disable-next-line typescript/no-explicit-any
const toPlainRows = (result: any): unknown => JSON.parse(JSON.stringify(result.toArray()));

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GrafeoDBType;

beforeAll(async () => {
  db = GrafeoDB.create();
  for (const m of musicians) {
    const middlePart = m.middle_name ? ` ; <middleName> "${m.middle_name}"` : ' ; <middleName> ""';
    // oxlint-disable-next-line typescript/no-explicit-any
    await (db as any).executeSparql(`${prefix}INSERT DATA {
      <musician/${m.last_name}> a <Musician> ;
        <firstName> "${m.first_name}"${middlePart} ;
        <lastName> "${m.last_name}" ;
        <birthdate> "${m.birthdate}"^^xsd:date ;
        <created_at> "${now}"^^xsd:dateTime ;
        <updated_at> "${now}"^^xsd:dateTime .
    }`);
  }
});

afterAll(() => {
  db?.close();
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

const expectSPARQL = async (
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
  expect(toPlainRows(result)).toEqual(expectedResult.map(toSparqlRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// The shared `timestamp` test compares a date-only value ('1957-01-01', emitted as xsd:date)
// against an xsd:dateTime field. SPARQL treats these as incomparable, so Grafeo >= 0.6
// filters every row out. Tested separately below with a full ISO value.
const sparqlTestCases = Object.entries(testCases).filter(([k]) => k !== 'timestamp');

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [testQuery, expectation]] of sparqlTestCases) {
      test(testCaseName, async () => {
        const query = {
          ...testQuery,
          rules: testQuery.rules.map(r =>
            'field' in r ? Object.assign({}, r, { field: `?${r.field}` }) : r
          ),
        };
        const expected =
          expectation === 'all' ? musicians : musicians.filter(m => m.last_name === expectation);
        await expectSPARQL(query, expected, apiFns);
      });
    }

    test('timestamp (full ISO value)', async () => {
      const query = {
        combinator: 'and',
        rules: [{ field: '?created_at', operator: '>', value: '1957-01-01T00:00:00.000Z' }],
      };
      await expectSPARQL(query, musicians, apiFns);
    });
  });
}
