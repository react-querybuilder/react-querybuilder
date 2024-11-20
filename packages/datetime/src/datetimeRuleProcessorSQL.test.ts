import { formatQuery, type RuleGroupType, type SQLPreset } from 'react-querybuilder';
import { datetimeRuleProcessorSQL } from './datetimeRuleProcessorSQL';
import { dateLibraryFunctions, fields } from './dbqueryTestUtils';

const now = new Date().toISOString();
const nowOracle = now.replace('T', ' ').replace('Z', ' UTC');

const testCases: Record<string, [RuleGroupType, Record<SQLPreset, string>]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: '1957-01-01' },
        { field: 'birthdate', operator: 'between', value: '1957-01-01,1969-01-01' },
        { field: 'birthdate', operator: 'between', value: '1969-01-01,1957-01-01' },
        { field: 'birthdate', operator: 'in', value: '1954-10-03,1960-06-06' },
        { field: 'created_at', operator: '<', value: now },
      ],
    },
    {
      ansi: `(birthdate > '1957-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate in ('1954-10-03', '1960-06-06') and created_at < '${now}')`,
      mssql: `([birthdate] > cast('1957-01-01' as date) and [birthdate] between cast('1957-01-01' as date) and cast('1969-01-01' as date) and [birthdate] between cast('1957-01-01' as date) and cast('1969-01-01' as date) and [birthdate] in (cast('1954-10-03' as date), cast('1960-06-06' as date)) and [created_at] < cast('${now}' as datetimeoffset))`,
      mysql: `(birthdate > cast('1957-01-01' as date) and birthdate between cast('1957-01-01' as date) and cast('1969-01-01' as date) and birthdate between cast('1957-01-01' as date) and cast('1969-01-01' as date) and birthdate in (cast('1954-10-03' as date), cast('1960-06-06' as date)) and created_at < cast('${now}' as datetime))`,
      oracle: `(birthdate > date'1957-01-01' and birthdate between date'1957-01-01' and date'1969-01-01' and birthdate between date'1957-01-01' and date'1969-01-01' and birthdate in (date'1954-10-03', date'1960-06-06') and created_at < timestamp'${nowOracle}')`,
      postgresql: `("birthdate" > date'1957-01-01' and "birthdate" between date'1957-01-01' and date'1969-01-01' and "birthdate" between date'1957-01-01' and date'1969-01-01' and "birthdate" in (date'1954-10-03', date'1960-06-06') and "created_at" < timestamp'${now}')`,
      sqlite: `(birthdate > '1957-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate between '1957-01-01' and '1969-01-01' and birthdate in ('1954-10-03', '1960-06-06') and created_at < '${now}')`,
    },
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'lastName', valueSource: 'field' },
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
      ],
    },
    {
      ansi: `(firstName != lastName and firstName like 'Stev%')`,
      mssql: `([firstName] != [lastName] and [firstName] like 'Stev%')`,
      mysql: `(firstName != lastName and firstName like 'Stev%')`,
      oracle: `(firstName != lastName and firstName like 'Stev%')`,
      postgresql: `("firstName" != "lastName" and "firstName" like 'Stev%')`,
      sqlite: `(firstName != lastName and firstName like 'Stev%')`,
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

for (const [libName, ops] of dateLibraryFunctions) {
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
                ruleProcessor: datetimeRuleProcessorSQL(ops),
              })
            ).toBe(expected);
          });
        }
      });
    }
  });
}
