import type { FullField, RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorGremlin } from '../getDatetimeRuleProcessorGremlin';
import { getDatetimeRuleProcessorLDAP } from '../getDatetimeRuleProcessorLDAP';
import { getDatetimeRuleProcessorMongoDB } from '../getDatetimeRuleProcessorMongoDB';
import { getDatetimeRuleProcessorParameterized } from '../getDatetimeRuleProcessorParameterized';
import { getDatetimeRuleProcessorPrisma } from '../getDatetimeRuleProcessorPrisma';
import { getDatetimeRuleProcessorSpEL } from '../getDatetimeRuleProcessorSpEL';
import type { IsDateField } from '../types';

// `birthdate` is a date-only field, so materialized values are timezone-independent
// ISO date strings; absolute values pass through unchanged.
const validQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'birthdate', operator: '>', value: '1957-01-01' },
    // Reversed operands exercise the chronological-reorder branch.
    { field: 'birthdate', operator: 'between', value: ['1969-01-01', '1957-01-01'] },
    { field: 'birthdate', operator: 'notBetween', value: ['1957-01-01', '1969-01-01'] },
    { field: 'birthdate', operator: 'in', value: ['1954-10-03', '1960-06-06'] },
    { field: 'birthdate', operator: 'notIn', value: ['1957-01-01'] },
  ],
};

// The expected output of each delegating processor equals the default processor's output
// for the same query with `between`/`notBetween` operands already ordered chronologically.
const orderedAbsoluteQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'birthdate', operator: '>', value: '1957-01-01' },
    { field: 'birthdate', operator: 'between', value: ['1957-01-01', '1969-01-01'] },
    { field: 'birthdate', operator: 'notBetween', value: ['1957-01-01', '1969-01-01'] },
    { field: 'birthdate', operator: 'in', value: ['1954-10-03', '1960-06-06'] },
    { field: 'birthdate', operator: 'notIn', value: ['1957-01-01'] },
  ],
};

// Non-date field (gate via `processIsDateField`) and a date field with `valueSource: 'field'`
// (gate via `valueSource === 'field'`) must both fall back to the default processor.
const fallbackQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve' },
    { field: 'birthdate', operator: '=', value: 'created_at', valueSource: 'field' },
  ],
};

const stringFormats = [
  ['parameterized', getDatetimeRuleProcessorParameterized],
  ['spel', getDatetimeRuleProcessorSpEL],
  ['ldap', getDatetimeRuleProcessorLDAP],
  ['gremlin', getDatetimeRuleProcessorGremlin],
] as const;

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [format, getProcessor] of stringFormats) {
      describe(format, () => {
        const ruleProcessor = getProcessor(apiFns);

        test('materializes and delegates (reordering between operands)', () => {
          expect(formatQuery(validQuery, { format, fields, ruleProcessor })).toEqual(
            formatQuery(orderedAbsoluteQuery, { format, fields })
          );
        });

        test('falls back to the default processor for non-date and field-source rules', () => {
          expect(formatQuery(fallbackQuery, { format, fields, ruleProcessor })).toEqual(
            formatQuery(fallbackQuery, { format, fields })
          );
        });
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
    ['function', (rule, _opts) => /^\d\d\d\d-\d\d-\d\d/.test(rule.value)],
    ['boolean', true],
    ['object', { name: 'firstName', label: 'First Name' }],
    ['array', [{ name: 'firstName' }, { name: 'invalidField' }]],
  ];
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];

  for (const [idfName, isDateField] of isDateFieldOptions) {
    test(`as ${idfName}`, () => {
      expect(
        formatQuery(query, {
          format: 'spel',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSpEL(apiFns),
          context: { isDateField },
        })
      ).toBe(`firstName == '1954-10-03'`);
    });
  }
});

describe('prisma (date objects)', () => {
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'Day.js')![1];
  const ruleProcessor = getDatetimeRuleProcessorPrisma(apiFns);

  test('converts values to Date objects and orders between operands', () => {
    const result = formatQuery(validQuery, { format: 'prisma', fields, ruleProcessor }) as {
      AND: { birthdate: Record<string, unknown> }[];
    };
    const between = result.AND[1].birthdate;
    expect(between.gte).toBeInstanceOf(Date);
    expect(between.lte).toBeInstanceOf(Date);
    expect((between.gte as Date).getTime()).toBeLessThan((between.lte as Date).getTime());
  });

  test('keeps an unparseable value as-is (invalid Date conversion)', () => {
    const result = ruleProcessor(
      { field: 'birthdate', operator: '=', value: 'not-a-date' },
      {
        fieldData: fields.find(f => f.name === 'birthdate')! as unknown as FullField,
        context: { isDateField: true },
      }
    ) as { birthdate: string };
    expect(result.birthdate).toBe('not-a-date');
  });
});

describe('mongodb (deprecated string format)', () => {
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'Day.js')![1];
  const ruleProcessor = getDatetimeRuleProcessorMongoDB(apiFns);

  test('serializes the mongodb_query object to a string', () => {
    const out = ruleProcessor(
      { field: 'birthdate', operator: '=', value: '1957-01-01' },
      {
        fieldData: fields.find(f => f.name === 'birthdate')! as unknown as FullField,
        context: { isDateField: true },
      }
    );
    expect(typeof out).toBe('string');
    expect(out).toContain('birthdate');
  });

  test('returns an empty string when the query object is falsy', () => {
    // `between` with a single operand yields an empty mongodb_query result.
    const out = ruleProcessor(
      { field: 'birthdate', operator: 'between', value: ['1957-01-01'] },
      {
        fieldData: fields.find(f => f.name === 'birthdate')! as unknown as FullField,
        context: { isDateField: true },
      }
    );
    expect(out).toBe('');
  });
});
