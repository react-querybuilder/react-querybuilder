import { formatQuery } from './formatQuery';
import type { TestSQLParams } from './dbqueryTestUtils';
import { superUsers, dbTests } from './dbqueryTestUtils';
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicAdditionalOperators } from './utils';

const superUsersJsonLogic = superUsers('jsonlogic');

for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
  add_operation(op, func);
}

const testJsonLogic = ({
  query,
  expectedResult,
  expectedResultCoercedNull,
  fqOptions,
}: TestSQLParams) => {
  test('jsonlogic', async () => {
    const jsonlogic = formatQuery(query, { format: 'jsonlogic', ...fqOptions });
    expect(superUsersJsonLogic.filter(u => apply(jsonlogic, u))).toEqual(
      expectedResultCoercedNull ?? expectedResult
    );
  });
};

// Common tests
for (const [name, t] of Object.entries(dbTests(superUsersJsonLogic))) {
  describe(name, () => {
    testJsonLogic(t);
  });
}
