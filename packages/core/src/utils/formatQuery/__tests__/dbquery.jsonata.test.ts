import jsonata from 'jsonata';
import type { DefaultRuleGroupType } from '../../../types';
import type { TestSQLParams } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const superUsersJSONata = superUsers('jsonata');
const augmentedSuperUsersJSONata = augmentedSuperUsers('jsonata');

const testJSONata = (
  name: string,
  { query, expectedResult, fqOptions, guardAgainstNull }: TestSQLParams,
  data = superUsersJSONata
) => {
  test(name, async () => {
    const guardedQuery =
      guardAgainstNull && guardAgainstNull.length > 0
        ? ({
            combinator: 'and',
            rules: [
              ...guardAgainstNull.map(f => ({ field: f, operator: 'notNull', value: null })),
              query,
            ],
          } as DefaultRuleGroupType)
        : query;
    const queryAsJSONata = `*[${formatQuery(guardedQuery, { ...fqOptions, format: 'jsonata', parseNumbers: true })}]`;
    const expression = jsonata(queryAsJSONata);
    const result = await expression.evaluate(data);

    expect(Array.isArray(result) ? result : [result]).toEqual(expectedResult);
  });
};

describe('JSONata', () => {
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersJSONata))) {
    testJSONata(name, t);
  }

  // JsonLogic-specific tests
  describe('match modes', () => {
    const runTest = (
      name: string,
      query: DefaultRuleGroupType,
      filterFn: (u: (typeof augmentedSuperUsersJSONata)[number]) => boolean
    ) => {
      testJSONata(
        name,
        { query, expectedResult: augmentedSuperUsersJSONata.filter(u => filterFn(u)) },
        augmentedSuperUsersJSONata
      );
    };

    describe('strings', () => {
      for (const [name, mm, fn] of matchModeTests.strings) {
        runTest(name, genStringsMatchQuery(mm), fn);
      }
    });

    describe('objects', () => {
      for (const [name, mm, fn] of matchModeTests.objects) {
        runTest(name, genObjectsMatchQuery(mm), fn);
      }
    });
  });
});
