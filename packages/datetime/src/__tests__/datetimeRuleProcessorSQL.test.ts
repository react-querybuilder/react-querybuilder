import type { RuleGroupType, SQLPreset } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSQL } from '../getDatetimeRuleProcessorSQL';
import type { IsDateField } from '../types';

const now = new Date().toISOString();
const nowOracle = now.replace('T', ' ').replace('Z', ' UTC');

const testCases: Record<string, [RuleGroupType, Record<SQLPreset, string>]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: '1957-01-01' },
        { field: 'birthdate', operator: 'between', value: '1957-01-01,1969-01-01' },
        { field: 'birthdate', operator: 'notBetween', value: '1969-01-01,1957-01-01' },
        { field: 'birthdate', operator: 'in', value: '1954-10-03,1960-06-06' },
        { field: 'created_at', operator: '<', value: now },
      ],
    },
    {
      ansi: `(birthdate > '1957-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate not between '1957-01-01' and '1969-01-01' and birthdate in ('1954-10-03', '1960-06-06') and created_at < '${now}')`,
      mssql: `([birthdate] > cast('1957-01-01' as date) and [birthdate] between cast('1957-01-01' as date) and cast('1969-01-01' as date) and [birthdate] not between cast('1957-01-01' as date) and cast('1969-01-01' as date) and [birthdate] in (cast('1954-10-03' as date), cast('1960-06-06' as date)) and [created_at] < cast('${now}' as datetimeoffset))`,
      mysql: `(birthdate > cast('1957-01-01' as date) and birthdate between cast('1957-01-01' as date) and cast('1969-01-01' as date) and birthdate not between cast('1957-01-01' as date) and cast('1969-01-01' as date) and birthdate in (cast('1954-10-03' as date), cast('1960-06-06' as date)) and created_at < cast('${now}' as datetime))`,
      oracle: `(birthdate > date'1957-01-01' and birthdate between date'1957-01-01' and date'1969-01-01' and birthdate not between date'1957-01-01' and date'1969-01-01' and birthdate in (date'1954-10-03', date'1960-06-06') and created_at < timestamp'${nowOracle}')`,
      postgresql: `("birthdate" > date'1957-01-01' and "birthdate" between date'1957-01-01' and date'1969-01-01' and "birthdate" not between date'1957-01-01' and date'1969-01-01' and "birthdate" in (date'1954-10-03', date'1960-06-06') and "created_at" < timestamp'${now}')`,
      sqlite: `(birthdate > '1957-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate not between '1957-01-01' and '1969-01-01' and birthdate in ('1954-10-03', '1960-06-06') and created_at < '${now}')`,
    },
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
    {
      ansi: `(firstName != lastName and firstName like 'Stev%' and birthdate custom_op '')`,
      mssql: `([firstName] != [lastName] and [firstName] like 'Stev%' and [birthdate] custom_op cast('' as date))`,
      mysql: `(firstName != lastName and firstName like 'Stev%' and birthdate custom_op cast('' as date))`,
      oracle: `(firstName != lastName and firstName like 'Stev%' and birthdate custom_op date'')`,
      postgresql: `("firstName" != "lastName" and "firstName" like 'Stev%' and "birthdate" custom_op date'')`,
      sqlite: `(firstName != lastName and firstName like 'Stev%' and birthdate custom_op '')`,
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
    {
      ansi: `(1 = 1)`,
      mssql: `(1 = 1)`,
      mysql: `(1 = 1)`,
      oracle: `(1 = 1)`,
      postgresql: `(1 = 1)`,
      sqlite: `(1 = 1)`,
    },
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCase, [query, presets]] of Object.entries(testCases)) {
      describe(`case: ${testCase}`, () => {
        for (const [preset, expected] of Object.entries(presets) as [SQLPreset, string][]) {
          test(preset, () => {
            const fieldsMapped =
              preset === 'mssql'
                ? fields.map(f =>
                    typeof f.datatype === 'string'
                      ? { ...f, datatype: f.datatype.replace(/.*timestamp.*/i, 'datetimeoffset') }
                      : f
                  )
                : fields;
            expect(
              formatQuery(query, {
                preset,
                fields: fieldsMapped,
                ruleProcessor: getDatetimeRuleProcessorSQL(apiFns),
              })
            ).toBe(expected);
          });
        }
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

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          preset: 'postgresql',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSQL(
            dateLibraryFunctions.find(([name]) => name === 'date-fns')![1]
          ),
          context: { isDateField },
        })
      ).toBe(`("firstName" = date'1954-10-03')`);
    });
  }
});
