import type { RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSPARQL } from '../getDatetimeRuleProcessorSPARQL';
import type { IsDateField } from '../types';

const now = new Date().toISOString();

// SPARQL fields use ?-prefix naming convention
const sparqlFields = fields.map(f => Object.assign({}, f, { name: `?${f.name}` }));

const testCases: Record<string, [RuleGroupType, string]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: '?birthdate', operator: '>', value: '1957-01-01' },
        { field: '?birthdate', operator: 'between', value: ['1957-01-01', '1969-01-01'] },
        { field: '?birthdate', operator: 'notBetween', value: ['1969-01-01', '1957-01-01'] },
        { field: '?birthdate', operator: 'in', value: ['1954-10-03', '1960-06-06'] },
        { field: '?birthdate', operator: 'notIn', value: ['1957-01-01'] },
        { field: '?created_at', operator: '<', value: now },
      ],
    },
    `?birthdate > "1957-01-01"^^xsd:date && ?birthdate >= "1957-01-01"^^xsd:date && ?birthdate <= "1969-01-01"^^xsd:date && (?birthdate < "1957-01-01"^^xsd:date || ?birthdate > "1969-01-01"^^xsd:date) && ?birthdate = "1954-10-03"^^xsd:date || ?birthdate = "1960-06-06"^^xsd:date && ?birthdate != "1957-01-01"^^xsd:date && ?created_at < "${now}"^^xsd:dateTime`,
  ],
  duration: [
    {
      combinator: 'and',
      rules: [
        { field: '?created_at', operator: 'olderThanDuration', value: 'P30D' },
        { field: '?created_at', operator: 'withinDuration', value: 'P7D' },
      ],
    },
    `NOW() - ?created_at > "P30D"^^xsd:duration && NOW() - ?created_at <= "P7D"^^xsd:duration`,
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: '?firstName', operator: '!=', value: '?lastName', valueSource: 'field' },
        { field: '?firstName', operator: 'beginsWith', value: 'Stev' },
        { field: '?birthdate', operator: 'custom_op', value: null },
      ],
    },
    `?firstName != ?lastName && STRSTARTS(?firstName, "Stev")`,
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: '?birthdate', operator: 'between', value: '1957-01-01' },
        { field: '?birthdate', operator: 'in', value: 'Stev' },
      ],
    },
    `1 = 1`,
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCase, [query, expectation]] of Object.entries(testCases)) {
      test(`case: ${testCase}`, () => {
        expect(
          formatQuery(query, {
            format: 'sparql',
            fields: sparqlFields,
            ruleProcessor: getDatetimeRuleProcessorSPARQL(apiFns),
          })
        ).toBe(expectation);
      });
    }
  });
}

describe('isDateField', () => {
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: '?birthdate', operator: '=', value: '1954-10-03' }],
  };

  const isDateFieldOptions: [string, IsDateField][] = [
    ['function', (rule, _opts) => /^\d\d\d\d-\d\d-\d\d$/.test(rule.value)],
    ['boolean', true],
    ['object', { name: '?birthdate', label: 'Birthdate' }],
    ['array', [{ name: '?birthdate' }, { name: 'invalidField' }]],
  ];

  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          format: 'sparql',
          fields: sparqlFields,
          ruleProcessor: getDatetimeRuleProcessorSPARQL(apiFns),
          context: { isDateField },
        })
      ).toBe(`?birthdate = "1954-10-03"^^xsd:date`);
    });
  }
});
