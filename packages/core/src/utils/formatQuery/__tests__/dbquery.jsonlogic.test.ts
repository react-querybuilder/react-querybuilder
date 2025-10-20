import { add_operation, apply } from 'json-logic-js';
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
import { jsonLogicAdditionalOperators } from '../utils';

const superUsersJsonLogic = superUsers('jsonlogic');

const augmentedSuperUsersJsonLogic = augmentedSuperUsers('jsonlogic');

for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
  add_operation(op, func);
}

const testJsonLogic = (
  name: string,
  { query, expectedResult, expectedResultCoercedNull, fqOptions }: TestSQLParams,
  data = superUsersJsonLogic
) => {
  test(name, () => {
    const jsonlogic = formatQuery(query, { ...fqOptions, format: 'jsonlogic' });
    expect(data.filter(u => apply(jsonlogic, u))).toEqual(
      expectedResultCoercedNull ?? expectedResult
    );
  });
};

describe('JsonLogic', () => {
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersJsonLogic))) {
    testJsonLogic(name, t);
  }

  describe('match modes', () => {
    const runTest = (
      name: string,
      query: DefaultRuleGroupType,
      filterFn: (u: (typeof augmentedSuperUsersJsonLogic)[number]) => boolean
    ) => {
      testJsonLogic(
        name,
        { query, expectedResult: augmentedSuperUsersJsonLogic.filter(u => filterFn(u)) },
        augmentedSuperUsersJsonLogic
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
