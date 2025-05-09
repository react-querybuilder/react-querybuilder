import { formatQuery } from '../formatQuery';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { superUsers, dbTests } from '../dbqueryTestUtils';
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicAdditionalOperators } from '../utils';

const superUsersJsonLogic = superUsers('jsonlogic');

for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
  add_operation(op, func);
}

const testJsonLogic = (
  name: string,
  { query, expectedResult, expectedResultCoercedNull, fqOptions }: TestSQLParams
) => {
  test(name, async () => {
    const jsonlogic = formatQuery(query, { ...fqOptions, format: 'jsonlogic' });
    expect(superUsersJsonLogic.filter(u => apply(jsonlogic, u))).toEqual(
      expectedResultCoercedNull ?? expectedResult
    );
  });
};

// Common tests
describe('JsonLogic', () => {
  for (const [name, t] of Object.entries(dbTests(superUsersJsonLogic))) {
    testJsonLogic(name, t);
  }
});
