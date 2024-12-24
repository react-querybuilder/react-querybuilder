import dayjs from 'dayjs';
import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { getDatetimeRuleProcessorCEL } from '../getDatetimeRuleProcessorCEL';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import type { IsDateField } from '../types';

const now = new Date().toISOString();
const d = (s: string) => dayjs(s).toISOString();
const ts = (s: string) => `timestamp("${dayjs(s).toISOString()}")`;

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
    `birthdate > ${ts('1957-01-01')} && (birthdate >= ${ts('1957-01-01')} && birthdate <= ${ts('1969-01-01')}) && (birthdate < ${ts('1957-01-01')} || birthdate > ${ts('1969-01-01')}) && birthdate in [${ts('1954-10-03')}, ${ts('1960-06-06')}] && !(birthdate in [${ts('1957-01-01')}]) && created_at < timestamp("${now}")`,
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
    `firstName != lastName && firstName.startsWith("Stev")`,
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: '1957-01-01' },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
      ],
    },
    `1 == 1`,
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCase, [query, expectation]] of Object.entries(testCases)) {
      test(`case: ${testCase}`, () => {
        expect(
          formatQuery(query, {
            format: 'cel',
            fields,
            ruleProcessor: getDatetimeRuleProcessorCEL(apiFns),
          })
        ).toBe(expectation);
      });
    }
  });
}

describe('isDateField', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'firstName', operator: '=', value: d('1954-10-03') }],
  };
  const isDateFieldOptions: [string, IsDateField][] = [
    ['function', (rule, _opts) => /^\d\d\d\d-\d\d-\d\dT/.test(rule.value)],
    ['boolean', true],
    ['object', { name: 'firstName', label: 'First Name' }],
    ['array', [{ name: 'firstName' }, { name: 'invalidField' }]],
  ];

  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          format: 'cel',
          fields,
          ruleProcessor: getDatetimeRuleProcessorCEL(apiFns),
          context: { isDateField },
        })
      ).toBe(`firstName == ${ts('1954-10-03')}`);
    });
  }
});
