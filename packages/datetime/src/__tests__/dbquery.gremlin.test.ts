// oxlint-disable jest/expect-expect

import type { GrafeoDB as GrafeoDBType } from '@grafeo-db/js';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorGremlin } from '../getDatetimeRuleProcessorGremlin';

// Native addon — use require for reliable .node file loading
const { GrafeoDB } = require('@grafeo-db/js') as { GrafeoDB: typeof GrafeoDBType };

// The Gremlin processor emits ISO 8601 strings (date-only and datetime), which compare
// lexicographically. Store node properties as strings so `has(field, gt('...'))` works.
const now = new Date().toISOString();

let db: GrafeoDBType;

beforeAll(() => {
  db = GrafeoDB.create();
  for (const m of musicians) {
    db.createNode(['Musician'], {
      first_name: m.first_name,
      middle_name: m.middle_name ?? null,
      last_name: m.last_name,
      birthdate: m.birthdate,
      created_at: now,
      updated_at: now,
    });
  }
});

afterAll(() => {
  db?.close();
});

const runGremlin = async (
  query: Parameters<typeof formatQuery>[0],
  expectation: string,
  apiFns: (typeof dateLibraryFunctions)[number][1]
) => {
  const steps = formatQuery(query, {
    format: 'gremlin',
    fields,
    ruleProcessor: getDatetimeRuleProcessorGremlin(apiFns),
  });
  const gremlin = `g.V().hasLabel('Musician')${steps}.order().by('last_name').values('last_name')`;
  // oxlint-disable-next-line typescript/no-explicit-any
  const result = await (db as any).executeGremlin(gremlin);
  // oxlint-disable-next-line typescript/no-explicit-any
  const lastNames = result.toArray().map((r: any) => (typeof r === 'string' ? r : r.last_name));
  if (expectation === 'all') {
    expect(lastNames).toEqual(musicians.map(m => m.last_name).toSorted());
  } else {
    expect(lastNames).toEqual([expectation]);
  }
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        await runGremlin(query, expectation, apiFns);
      });
    }
  });
}
