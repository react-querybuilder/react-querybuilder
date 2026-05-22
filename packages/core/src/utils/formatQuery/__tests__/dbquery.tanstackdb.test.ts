/* @vitest-environment node */

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
import { describe, expect, test } from 'vitest';
import { convertToIC } from '../../convertQuery';
import { formatQuery } from '../../formatQuery';
import { dbTestsTanStackDb } from '../dbqueryTanStackDbTestUtils';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { superUsers } from '../dbqueryTestUtils';

const tanStackDbOperators = { and, eq, gt, gte, inArray, isNull, like, lt, lte, not, or };

// Use boolean-style superUsers since TanStack DB stores JS values directly
const superUserData = superUsers('jsonlogic');

const collection = createCollection(
  localOnlyCollectionOptions({ getKey: ({ firstName }) => firstName, initialData: superUserData })
);

const stripMeta = (arr: Record<string, unknown>[]) =>
  arr.map(obj => Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith('$'))));

const testTanStackDb = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  describe.each(['standard', 'independent combinators'])('%s', testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const where = formatQuery(queryToTest, {
      ...fqOptions,
      format: 'tanstack_db',
      context: { tanStackDbOperators },
    });

    test('queryOnce', async () => {
      const results = await queryOnce(q =>
        q
          .from({ su: collection })
          .where(where)
          .orderBy(({ su }) => su.madeUpName)
      );

      expect(stripMeta(results)).toEqual(expectedResult);
    });
  });
};

describe('TanStack DB', () => {
  for (const [name, t] of Object.entries(dbTestsTanStackDb(superUserData))) {
    describe(name, () => {
      testTanStackDb(t);
    });
  }
});
