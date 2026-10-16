import type { FullField, RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorChroma } from '../getDatetimeRuleProcessorChroma';
import { getDatetimeRuleProcessorElasticSearch } from '../getDatetimeRuleProcessorElasticSearch';
import { getDatetimeRuleProcessorGremlin } from '../getDatetimeRuleProcessorGremlin';
import { getDatetimeRuleProcessorLDAP } from '../getDatetimeRuleProcessorLDAP';
import { getDatetimeRuleProcessorMilvus } from '../getDatetimeRuleProcessorMilvus';
import { getDatetimeRuleProcessorMongoDB } from '../getDatetimeRuleProcessorMongoDB';
import { getDatetimeRuleProcessorParameterized } from '../getDatetimeRuleProcessorParameterized';
import { getDatetimeRuleProcessorPinecone } from '../getDatetimeRuleProcessorPinecone';
import { getDatetimeRuleProcessorPrisma } from '../getDatetimeRuleProcessorPrisma';
import { getDatetimeRuleProcessorQdrant } from '../getDatetimeRuleProcessorQdrant';
import { getDatetimeRuleProcessorSpEL } from '../getDatetimeRuleProcessorSpEL';
import { getDatetimeRuleProcessorWeaviate } from '../getDatetimeRuleProcessorWeaviate';
import { getEpochMs } from '../getEpochMs';
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

// Non-date field (gate via `processIsDateField`), a date field with `valueSource: 'field'`,
// and a date field with `valueSource: 'parameter'` (both gated via `isNonDateValueSource`)
// must all fall back to the default processor.
const fallbackQuery: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'firstName', operator: '=', value: 'Steve' },
    { field: 'birthdate', operator: '=', value: 'created_at', valueSource: 'field' },
    { field: 'birthdate', operator: '=', value: 'startParam', valueSource: 'parameter' },
  ],
};

const stringFormats = [
  ['parameterized', getDatetimeRuleProcessorParameterized],
  ['spel', getDatetimeRuleProcessorSpEL],
  ['ldap', getDatetimeRuleProcessorLDAP],
  ['gremlin', getDatetimeRuleProcessorGremlin],
  ['elasticsearch', getDatetimeRuleProcessorElasticSearch],
  ['qdrant', getDatetimeRuleProcessorQdrant],
  ['weaviate', getDatetimeRuleProcessorWeaviate],
] as const;

// Vector DBs w/o a date type: values → epoch ms numbers
const epochFormats = [
  ['pinecone', getDatetimeRuleProcessorPinecone],
  ['chroma', getDatetimeRuleProcessorChroma],
  ['milvus', getDatetimeRuleProcessorMilvus],
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

    for (const [format, getProcessor] of epochFormats) {
      describe(format, () => {
        const ruleProcessor = getProcessor(apiFns);
        const ms = (v: string) => apiFns.toDate(v).getTime();
        const epochQuery: RuleGroupType = {
          ...orderedAbsoluteQuery,
          rules: orderedAbsoluteQuery.rules.map(r =>
            'value' in r
              ? Object.assign({}, r, {
                  value: Array.isArray(r.value) ? r.value.map(ms) : ms(r.value),
                })
              : r
          ),
        };

        test('materializes to epoch ms and delegates', () => {
          expect(formatQuery(validQuery, { format, fields, ruleProcessor })).toEqual(
            formatQuery(epochQuery, { format, fields })
          );
        });

        test('comma-separated list values', () => {
          expect(
            formatQuery(
              {
                combinator: 'and',
                rules: [{ field: 'birthdate', operator: 'in', value: '1954-10-03,1960-06-06' }],
              },
              { format, fields, ruleProcessor }
            )
          ).toEqual(
            formatQuery(
              {
                combinator: 'and',
                rules: [
                  {
                    field: 'birthdate',
                    operator: 'in',
                    value: [ms('1954-10-03'), ms('1960-06-06')],
                  },
                ],
              },
              { format, fields }
            )
          );
        });

        test('falls back to the default processor for non-date and field-source rules', () => {
          expect(formatQuery(fallbackQuery, { format, fields, ruleProcessor })).toEqual(
            formatQuery(fallbackQuery, { format, fields })
          );
        });

        test('unparseable values pass through', () => {
          const q: RuleGroupType = {
            combinator: 'and',
            rules: [{ field: 'birthdate', operator: '=', value: 'nope' }],
          };
          expect(formatQuery(q, { format, fields, ruleProcessor })).toEqual(
            formatQuery(q, { format, fields })
          );
        });
      });
    }
  });
}

describe('parameterized honors fieldIdentifierSeparator', () => {
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 't.birthdate', operator: '>', value: '1957-01-01' },
      { field: 't.birthdate', operator: '=', value: 'u.created_at', valueSource: 'field' },
    ],
  };
  test.each(['parameterized', 'parameterized_named'] as const)('%s', format => {
    expect(
      formatQuery(query, {
        format: format as 'parameterized',
        preset: 'mssql',
        ruleProcessor: getDatetimeRuleProcessorParameterized(apiFns),
        context: { isDateField: true },
      }).sql
    ).toMatch(/^\(\[t\]\.\[birthdate\] > \S+ and \[t\]\.\[birthdate\] = \[u\]\.\[created_at\]\)$/);
  });
});

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

describe('qdrant', () => {
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];
  const ruleProcessor = getDatetimeRuleProcessorQdrant(apiFns);
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'firstName', operator: '>', value: '1957-01-01' }],
  };

  test('forces RFC 3339 range for date fields w/o date inputType', () => {
    expect(
      formatQuery(query, { format: 'qdrant', ruleProcessor, context: { isDateField: true } })
    ).toEqual({ must: [{ key: 'firstName', range: { gt: '1957-01-01T00:00:00Z' } }] });
  });

  test('direct call w/o fieldData', () => {
    expect(
      ruleProcessor(
        { field: 'f', operator: '>', value: '1957-01-01' },
        { context: { isDateField: true } }
      )
    ).toEqual({ key: 'f', range: { gt: '1957-01-01T00:00:00Z' } });
  });

  test('preserves date inputType', () => {
    expect(
      formatQuery(query, {
        format: 'qdrant',
        ruleProcessor,
        fields: [{ name: 'firstName', label: 'First Name', inputType: 'date' }],
        context: { isDateField: true },
      })
    ).toEqual({ must: [{ key: 'firstName', range: { gt: '1957-01-01T00:00:00Z' } }] });
  });
});

describe('getEpochMs', () => {
  const apiFns = dateLibraryFunctions.find(([name]) => name === 'date-fns')![1];
  test('dates, strings, invalid', () => {
    expect(getEpochMs(apiFns, new Date(0))).toBe(0);
    expect(getEpochMs(apiFns, '1970-01-01T00:00:00Z')).toBe(0);
    expect(getEpochMs(apiFns, 'nope')).toBeUndefined();
    expect(getEpochMs(apiFns, 5)).toBeUndefined();
  });
});
