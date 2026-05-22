import type { SuperUser, TestSQLParams } from './dbqueryTestUtils';
import { dbTests } from './dbqueryTestUtils';

/**
 * TanStack DB-specific integration test cases.
 * Extends shared `dbTests` with format-specific cases (negation via `not(...)`, etc.)
 * Excludes tests that rely on features unsupported in TanStack DB's query engine
 * (e.g., `like` with field refs, bigint comparisons).
 */
export const dbTestsTanStackDb = (superUsers: SuperUser[]): Record<string, TestSQLParams> => {
  const shared = dbTests(superUsers);

  // TanStack DB doesn't support `like` with field-reference patterns (proxy can't concatenate),
  // and bigint comparisons may not work. Exclude those.
  const {
    bigint: _bigint,
    'f2f contains': _f2fContains,
    'f2f beginsWith': _f2fBeginsWith,
    ...rest
  } = shared;

  return {
    ...rest,
    // TanStack DB composes negation: `not(or(...))`
    not: {
      query: {
        not: true,
        combinator: 'or',
        rules: [
          { field: 'powerUpAge', operator: 'notNull', value: null },
          { field: 'madeUpName', operator: 'null', value: null },
        ],
      },
      expectedResult: superUsers.filter(u => !(u.powerUpAge !== null || u.madeUpName === null)),
    },
    // valueSource: 'field' with between (no `like` involved)
    valueSourceFieldBetween: {
      query: {
        combinator: 'and',
        rules: [
          {
            field: 'lastName',
            operator: 'between',
            value: ['firstName', 'madeUpName'],
            valueSource: 'field',
          },
        ],
      },
      expectedResult: superUsers.filter(
        u => u.lastName >= u.firstName && u.lastName <= u.madeUpName
      ),
    },
  };
};
