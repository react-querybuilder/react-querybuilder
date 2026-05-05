import type { RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorCypher } from '../getDatetimeRuleProcessorCypher';
import type { IsDateField } from '../types';

const now = new Date().toISOString();

const testCases: Record<string, [RuleGroupType, string]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: '1957-01-01' },
        { field: 'birthdate', operator: 'between', value: ['1957-01-01', '1969-01-01'] },
        { field: 'birthdate', operator: 'notBetween', value: ['1969-01-01', '1957-01-01'] },
        { field: 'birthdate', operator: 'in', value: ['1954-10-03', '1960-06-06'] },
        { field: 'birthdate', operator: 'notIn', value: ['1957-01-01'] },
        { field: 'created_at', operator: '<', value: now },
      ],
    },
    `birthdate > date('1957-01-01') AND date('1957-01-01') <= birthdate AND birthdate <= date('1969-01-01') AND NOT (date('1957-01-01') <= birthdate AND birthdate <= date('1969-01-01')) AND birthdate IN [date('1954-10-03'), date('1960-06-06')] AND NOT birthdate IN [date('1957-01-01')] AND created_at < datetime('${now}')`,
  ],
  duration: [
    {
      combinator: 'and',
      rules: [
        { field: 'created_at', operator: 'olderThanDuration', value: 'P30D' },
        { field: 'created_at', operator: 'withinDuration', value: 'P7D' },
      ],
    },
    `datetime() - created_at > duration('P30D') AND datetime() - created_at <= duration('P7D')`,
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'lastName', valueSource: 'field' },
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
        { field: 'birthdate', operator: 'custom_op', value: null },
      ],
    },
    `firstName <> lastName AND firstName STARTS WITH 'Stev'`,
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: '1957-01-01' },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
      ],
    },
    `(1 = 1)`,
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCase, [query, expectation]] of Object.entries(testCases)) {
      test(`case: ${testCase}`, () => {
        expect(
          formatQuery(query, {
            format: 'cypher',
            fields,
            ruleProcessor: getDatetimeRuleProcessorCypher(apiFns),
          })
        ).toBe(expectation);
      });
    }
  });
}

describe('isDateField', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'firstName', operator: '=', value: '1954-10-03' }],
  };
  const isDateFieldOptions: [string, IsDateField][] = [
    ['function', (rule, _opts) => /^\d\d\d\d-\d\d-\d\d$/.test(rule.value)],
    ['boolean', true],
    ['object', { name: 'firstName', label: 'First Name' }],
    ['array', [{ name: 'firstName' }, { name: 'invalidField' }]],
  ];

  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          format: 'cypher',
          fields,
          ruleProcessor: getDatetimeRuleProcessorCypher(apiFns),
          context: { isDateField },
        })
      ).toBe(`firstName = date('1954-10-03')`);
    });
  }
});
