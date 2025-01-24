import jsonata from 'jsonata';
import type { DefaultRuleGroupType } from '../../types';
import type { TestSQLParams } from './dbqueryTestUtils';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const superUsersJSONata = superUsers('jsonata');

const testJSONata = (
  name: string,
  { query, expectedResult, fqOptions, guardAgainstNull }: TestSQLParams
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
    const result = await expression.evaluate(superUsersJSONata);

    expect(Array.isArray(result) ? result : [result]).toEqual(expectedResult);
  });
};

// Common tests
describe('JSONata', () => {
  for (const [name, t] of Object.entries(dbTests(superUsersJSONata))) {
    testJSONata(name, t);
  }
});
