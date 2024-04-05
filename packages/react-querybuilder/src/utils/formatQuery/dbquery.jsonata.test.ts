import jsonata from 'jsonata';
import type {
  DefaultRuleGroupType,
  Field,
  FormatQueryOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../types';
import type { TestSQLParams } from './dbqueryTestUtils';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';

const superUsersJSONata = superUsers('jsonata');

const testJSONata = ({ query, expectedResult, fqOptions, guardAgainstNull }: TestSQLParams) => {
  test('jsonata', async () => {
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
    const queryAsJSONata = `*[${formatQuery(guardedQuery, { format: 'jsonata', parseNumbers: true, ...fqOptions })}]`;
    const expression = jsonata(queryAsJSONata);
    const result = await expression.evaluate(superUsersJSONata);

    expect(Array.isArray(result) ? result : [result]).toEqual(expectedResult);
  });
};

// Common tests
for (const [name, t] of Object.entries(dbTests(superUsersJSONata))) {
  describe(name, () => {
    testJSONata(t);
  });
}

// JSONata-specific tests
test('date rule processor', async () => {
  const fields: Field[] = [
    { name: 'name', label: 'Name', datatype: 'string' },
    { name: 'birthDate', label: 'Birth Date', datatype: 'date' },
  ];
  const data = [
    { name: 'Stevie Ray Vaughan', birthDate: '1954-10-03' },
    { name: 'Steve Vai', birthDate: '1960-06-06' },
  ];
  const ruleProcessor: RuleProcessor = (rule, options) => {
    if (options?.fieldData?.datatype === 'date') {
      return `$toMillis(${rule.field}) ${rule.operator} $toMillis("${rule.value}")`;
    }
    return defaultRuleProcessorJSONata(rule, options);
  };
  const options: FormatQueryOptions = {
    format: 'jsonata',
    parseNumbers: true,
    fields,
    ruleProcessor,
  };

  const queryLT: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'birthDate', operator: '<', value: '1960-01-01' }],
  };
  const expressionLT = jsonata(`*[${formatQuery(queryLT, options)}]`);
  const resultLT = await expressionLT.evaluate(data);
  expect(resultLT).toEqual(data.find(d => d.birthDate < '1960-01-01'));

  const queryGT: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'birthDate', operator: '>', value: '1956-01-01' }],
  };
  const expressionGT = jsonata(`*[${formatQuery(queryGT, options)}]`);
  const resultGT = await expressionGT.evaluate(data);
  expect(resultGT).toEqual(data.find(d => d.birthDate > '1956-01-01'));
});
