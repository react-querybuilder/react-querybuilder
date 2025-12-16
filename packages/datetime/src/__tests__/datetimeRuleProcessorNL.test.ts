import type { RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import dayjs from 'dayjs';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorNL } from '../getDatetimeRuleProcessorNL';
import type { IsDateField } from '../types';

const now = new Date().toISOString();

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
          format: 'natural_language',
          fields,
          ruleProcessor: getDatetimeRuleProcessorNL(
            dateLibraryFunctions.find(([name]) => name === 'date-fns')![1]
          ),
          context: { isDateField },
        })
      ).toBe(`First Name is Sunday, October 3, 1954`);
    });
  }
});

const idf = new Intl.DateTimeFormat(undefined, { dateStyle: 'full' });
const idtf = new Intl.DateTimeFormat(undefined, { dateStyle: 'full', timeStyle: 'long' });
const dFmt = (s: string) => idf.format(dayjs(s).toDate());
const dtFmt = (s: string) => idtf.format(dayjs(s).toDate());

const testCases2: Record<string, [RuleGroupType, string]> = {
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
      `Birthdate is after ${dFmt('1957-01-01')}`,
      `Birthdate is between ${dFmt('1957-01-01')} and ${dFmt('1969-01-01')}`,
      `Birthdate is not between ${dFmt('1957-01-01')} and ${dFmt('1969-01-01')}`,
      `Birthdate is one of the dates (${dFmt('1954-10-03')}, ${dFmt('1960-06-06')})`,
      `Birthdate is not (${dFmt('1957-01-01')})`,
      `Created At is before ${dtFmt(now)}`,
      `Created At is after Birthdate`,
      `Birthdate is between the dates in Created At and Updated At`,
      `Birthdate is not between the dates in Created At and Updated At`,
      `Birthdate is the same as a date in (Created At or Updated At)`,
    ].join(', and '),
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'unknown_field', valueSource: 'field' },
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
        { field: 'birthdate', operator: 'custom_op', value: null },
      ],
    },
    `First Name is not the same as the value in unknown_field, and First Name starts with 'Stev', and Birthdate custom_op`,
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: '1957-01-01' },
        { field: 'birthdate', operator: 'notBetween', value: '' },
        { field: 'birthdate', operator: 'in', value: null },
        { field: 'birthdate', operator: 'notIn', value: undefined },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
        { field: 'birthdate', operator: 'between', value: ['created_at'], valueSource: 'field' },
        { field: 'birthdate', operator: 'in', value: '', valueSource: 'field' },
      ],
    },
    '1 is 1',
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    const ruleProcessor = getDatetimeRuleProcessorNL(apiFns);
    for (const [testCase, [query, expectation]] of Object.entries(testCases2)) {
      test(`case: ${testCase}`, () => {
        expect(formatQuery(query, { format: 'natural_language', fields, ruleProcessor })).toBe(
          expectation
        );
      });
    }
  });
}

it('works with no field data', () => {
  expect(
    formatQuery(
      { rules: [{ field: 'f1', operator: '=', value: '1969-01-01' }] },
      {
        format: 'natural_language',
        context: { isDateField: true },
        ruleProcessor: getDatetimeRuleProcessorNL(
          dateLibraryFunctions.find(([name]) => name === 'date-fns')![1]
        ),
      }
    )
  ).toBe('f1 is Wednesday, January 1, 1969');
});

it('uses custom date formats', () => {
  const d = '1969-01-01';
  const dt = '1969-01-01T12:14:26.052';
  const context = {
    isDateField: true,
    dateFormat: { dateStyle: 'short' },
    dateTimeFormat: { dateStyle: 'short', timeStyle: 'medium' },
  } as const;
  expect(
    formatQuery(
      { rules: [{ field: 'birthdate', operator: '=', value: d }] },
      {
        format: 'natural_language',
        fields,
        context,
        ruleProcessor: getDatetimeRuleProcessorNL(
          dateLibraryFunctions.find(([name]) => name === 'date-fns')![1]
        ),
      }
    )
  ).toBe(
    `Birthdate is ${new Intl.DateTimeFormat(undefined, context.dateFormat).format(dayjs(d).toDate())}`
  );

  expect(
    formatQuery(
      { rules: [{ field: 'created_at', operator: '<', value: dt }] },
      {
        format: 'natural_language',
        fields,
        context,
        ruleProcessor: getDatetimeRuleProcessorNL(
          dateLibraryFunctions.find(([name]) => name === 'date-fns')![1]
        ),
      }
    )
  ).toBe(
    `Created At is before ${new Intl.DateTimeFormat(undefined, context.dateTimeFormat).format(dayjs(dt).toDate())}`
  );
});
