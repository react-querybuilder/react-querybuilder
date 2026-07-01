import { formatQuery } from '@react-querybuilder/core';
import { add_operation, apply } from 'json-logic-js';
import { expressionJsonLogicOperators, fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorJsonLogic } from '../index';

for (const [op, func] of Object.entries(expressionJsonLogicOperators)) {
  add_operation(op, func);
}

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  test(testCaseName, () => {
    const jsonlogic = formatQuery(query, {
      format: 'jsonlogic',
      fields,
      ruleProcessor: expressionRuleProcessorJsonLogic,
    });
    const matched = products.filter(p => apply(jsonlogic, p));
    expect(matched.map(p => p.id)).toEqual(expectedIds);
  });
}
