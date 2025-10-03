import type { RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import dayjs from 'dayjs';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorJSONata } from '../getDatetimeRuleProcessorJSONata';
import type { IsDateField } from '../types';

const now = new Date().toISOString();
const tsf = (s: string) => `$toMillis(${s})`;
const tsv = (s: string) => `$toMillis("${dayjs(s).toISOString()}")`;

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
        { field: 'created_at', operator: '>', value: 'birthdate', valueSource: 'field' },
        {
          field: 'birthdate',
          operator: 'between',
          value: ['created_at', 'updated_at'],
          valueSource: 'field',
        },
        {
          field: 'birthdate',
          operator: 'notBetween',
          value: ['created_at', 'updated_at'],
          valueSource: 'field',
        },
        {
          field: 'birthdate',
          operator: 'in',
          value: ['created_at', 'updated_at'],
          valueSource: 'field',
        },
      ],
    },
    [
      `${tsf('birthdate')} > ${tsv('1957-01-01')}`,
      `(${tsf('birthdate')} >= ${tsv('1957-01-01')} and ${tsf('birthdate')} <= ${tsv('1969-01-01')})`,
      `$not(${tsf('birthdate')} >= ${tsv('1957-01-01')} and ${tsf('birthdate')} <= ${tsv('1969-01-01')})`,
      `${tsf('birthdate')} in [${tsv('1954-10-03')}, ${tsv('1960-06-06')}]`,
      `$not(${tsf('birthdate')} in [${tsv('1957-01-01')}])`,
      `${tsf('created_at')} < $toMillis("${now}")`,
      `${tsf('created_at')} > ${tsf('birthdate')}`,
      `(${tsf('birthdate')} >= ${tsf('created_at')} and ${tsf('birthdate')} <= ${tsf('updated_at')})`,
      `$not(${tsf('birthdate')} >= ${tsf('created_at')} and ${tsf('birthdate')} <= ${tsf('updated_at')})`,
      `${tsf('birthdate')} in [${tsf('created_at')}, ${tsf('updated_at')}]`,
    ].join(' and '),
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
    `firstName != lastName and $contains(firstName, /^Stev/)`,
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: '1957-01-01' },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
        {
          field: 'birthdate',
          operator: 'between',
          value: ['created_at'],
          valueSource: 'field',
        },
        {
          field: 'birthdate',
          operator: 'in',
          value: '',
          valueSource: 'field',
        },
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
            format: 'jsonata',
            fields,
            ruleProcessor: getDatetimeRuleProcessorJSONata(apiFns),
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
          format: 'jsonata',
          fields,
          ruleProcessor: getDatetimeRuleProcessorJSONata(apiFns),
          context: { isDateField },
        })
      ).toBe(`${tsf('firstName')} = ${tsv('1954-10-03')}`);
    });
  }
});
