/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import {
  and,
  createCollection,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  localOnlyCollectionOptions,
  lt,
  lte,
  not,
  or,
  queryOnce,
} from '@tanstack/db';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorTanStackDB } from '../getDatetimeRuleProcessorTanStackDB';

const tanStackDbOperators = { and, eq, gt, gte, inArray, isNull, like, lt, lte, not, or };

// TanStack DB compares against native JS values, so store dates as `Date` objects
// (matching what the processor emits for materialized/absolute datetime values).
const now = new Date();
const musicianData = musicians.map(m => ({
  ...m,
  birthdate: new Date(m.birthdate),
  created_at: now,
  updated_at: now,
}));

const collection = createCollection(
  localOnlyCollectionOptions({ getKey: ({ first_name }) => first_name, initialData: musicianData })
);

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const where = formatQuery(query, {
          format: 'tanstack_db',
          fields,
          ruleProcessor: getDatetimeRuleProcessorTanStackDB(apiFns),
          context: { tanStackDbOperators },
        });
        const result = await queryOnce(q =>
          q
            .from({ m: collection })
            .where(where)
            .orderBy(({ m }) => m.last_name)
        );
        // oxlint-disable no-conditional-expect
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result).toHaveLength(1);
          expect(result[0].last_name).toBe(expectation);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
