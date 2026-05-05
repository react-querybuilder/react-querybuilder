// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorCypher } from '../getDatetimeRuleProcessorCypher';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// ─── Test Data ────────────────────────────────────────────────────────────────

const now = new Date().toISOString();

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fieldNames = fields.map(f => f.name);
const returnFields = fieldNames.map(f => `m.${f}`);
const returnClause = `RETURN ${returnFields.join(', ')} ORDER BY m.lastName`;

interface CypherRow {
  [key: `m.${string}`]: unknown;
}

const toCypherRow = (m: (typeof musicians)[number]): CypherRow =>
  Object.fromEntries(
    fieldNames.map(f => {
      const key = `m.${f}`;
      if (f === 'birthdate') return [key, m.birthdate];
      if (f === 'created_at' || f === 'updated_at') return [key, new Date(now)];
      if (f === 'firstName') return [key, m.first_name];
      if (f === 'middleName') return [key, m.middle_name ?? null];
      if (f === 'lastName') return [key, m.last_name];
      return [key, null];
    })
  ) as CypherRow;

// ─── DB Lifecycle ─────────────────────────────────────────────────────────────

let db: GrafeoDBType;

beforeAll(async () => {
  db = GrafeoDB.create();
  // Use CREATE with temporal constructors so date() and datetime() comparisons work
  for (const m of musicians) {
    const middleName = m.middle_name ? `'${m.middle_name}'` : 'null';
    // oxlint-disable-next-line typescript/no-explicit-any
    await (db as any).executeCypher(
      `CREATE (n:Musician {` +
        `firstName: '${m.first_name}', ` +
        `middleName: ${middleName}, ` +
        `lastName: '${m.last_name}', ` +
        `birthdate: date('${m.birthdate}'), ` +
        `created_at: datetime('${now}'), ` +
        `updated_at: datetime('${now}')` +
        `})`
    );
  }
});

afterAll(() => {
  db?.close();
});

// ─── Test Runner ──────────────────────────────────────────────────────────────

const runCypher = async (
  query: Parameters<typeof formatQuery>[0],
  expectedResult: (typeof musicians)[number][],
  apiFns: (typeof dateLibraryFunctions)[number][1]
) => {
  const where = formatQuery(query, {
    format: 'cypher',
    parseNumbers: true,
    fields: fields.map(f => Object.assign({}, f, { name: `m.${f.name}` })),
    ruleProcessor: getDatetimeRuleProcessorCypher(apiFns),
  });
  const cypher = `MATCH (m:Musician)\nWHERE ${where}\n${returnClause}`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeCypher(cypher);
  expect(result.toArray()).toEqual(expectedResult.map(toCypherRow));
};

// ─── Tests ────────────────────────────────────────────────────────────────────

// The shared `timestamp` test uses a date-only comparison value ('1957-01-01')
// against a datetime-typed field. The processor correctly wraps it as date('...'),
// but Grafeo doesn't support cross-type datetime > date comparisons (Neo4j does).
// We test the timestamp case separately with a full ISO value below.
const cypherTestCases = Object.entries(testCases).filter(([k]) => k !== 'timestamp');

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [testQuery, expectation]] of cypherTestCases) {
      test(testCaseName, async () => {
        const query = {
          ...testQuery,
          rules: testQuery.rules.map(r =>
            'field' in r ? Object.assign({}, r, { field: `m.${r.field}` }) : r
          ),
        };
        const expected =
          expectation === 'all' ? musicians : musicians.filter(m => m.last_name === expectation);
        await runCypher(query, expected, apiFns);
      });
    }

    test('timestamp (full ISO value)', async () => {
      const query = {
        combinator: 'and',
        rules: [{ field: 'm.created_at', operator: '>', value: '1957-01-01T00:00:00.000Z' }],
      };
      await runCypher(query, musicians, apiFns);
    });
  });
}
