import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { datetimeRuleProcessorJsonLogic } from '../datetimeRuleProcessorJsonLogic';
import { fields } from '../dbqueryTestUtils';
import type { IsDateField, RQBDateTimeJsonLogic } from '../types';

const now = new Date().toISOString();

const testCases: Record<string, [RuleGroupType, RQBDateTimeJsonLogic]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: '1957-01-01' },
        { field: 'birthdate', operator: 'between', value: '1957-01-01,1969-01-01' },
        { field: 'birthdate', operator: 'between', value: '1969-01-01,1957-01-01' },
        { field: 'birthdate', operator: 'in', value: '1954-10-03,1960-06-06' },
        { field: 'created_at', operator: '<', value: now },
        { field: 'created_at', operator: '>', value: 'birthdate', valueSource: 'field' },
      ],
    },
    {
      and: [
        { dateAfter: [{ var: 'birthdate' }, '1957-01-01'] },
        { dateBetween: ['1957-01-01', { var: 'birthdate' }, '1969-01-01'] },
        { dateBetween: ['1969-01-01', { var: 'birthdate' }, '1957-01-01'] },
        { dateIn: [{ var: 'birthdate' }, ['1954-10-03', '1960-06-06']] },
        { dateBefore: [{ var: 'created_at' }, now] },
        { dateAfter: [{ var: 'created_at' }, { var: 'birthdate' }] },
      ],
    },
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'lastName', valueSource: 'field' },
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
        { field: 'birthdate', operator: 'null', value: null },
        { field: 'birthdate', operator: 'custom_op', value: null },
      ],
    },
    {
      and: [
        { '!=': [{ var: 'firstName' }, { var: 'lastName' }] },
        { startsWith: [{ var: 'firstName' }, 'Stev'] },
        { '==': [{ var: 'birthdate' }, null] },
      ],
    },
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: '1957-01-01' },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
      ],
    },
    // This one's technically a fallback for JsonLogic,
    // but it's not strictly valid as a date.
    { and: [{ dateIn: [{ var: 'birthdate' }, ['Stev']] }] },
  ],
};

for (const [testCase, [query, expectation]] of Object.entries(testCases)) {
  test(testCase, () => {
    expect(
      formatQuery(query, {
        format: 'jsonlogic',
        ruleProcessor: datetimeRuleProcessorJsonLogic,
        fields,
      })
    ).toEqual(expectation);
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

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          format: 'jsonlogic',
          fields,
          ruleProcessor: datetimeRuleProcessorJsonLogic,
          context: { isDateField },
        })
      ).toEqual({ and: [{ dateOn: [{ var: 'firstName' }, '1954-10-03'] }] });
    });
  }
});
