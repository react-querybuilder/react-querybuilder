import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../../defaults';
import type { RuleGroupType, RuleProcessor } from '../../../types';
import { add } from '../../queryTools';
import { defaultRuleProcessorSPARQL } from '../defaultRuleProcessorSPARQL';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryIC,
  queryWithValueSourceField,
  testQueryDQ,
  testQuerySQ,
} from '../formatQueryTestUtils';
import {
  caseInsensitiveBeginsWithQuery,
  caseInsensitiveContainsQuery,
  caseInsensitiveEqualsQuery,
  regexNegationQuery,
  regexQuery,
  sparqlGraphProcessor,
  sparqlTypedLiteralProcessor,
} from './graphTestUtils';

const sparqlString = `!BOUND(firstName) && BOUND(lastName) && firstName = "Test" || firstName = "This" && lastName != "Test" && lastName != "This" && firstName >= "Test" && firstName <= "This" && firstName >= "Test" && firstName <= "This" && (lastName < "Test" || lastName > "This") && age >= "12" && age <= "14" && age = "26" && isMusician = "true"^^xsd:boolean && isLucky = "false"^^xsd:boolean && !(gender = "M" || job != "Programmer" || CONTAINS(email, "@")) && (!CONTAINS(lastName, "ab") || STRSTARTS(job, "Prog") || STRENDS(email, "com") || !STRSTARTS(job, "Man") || !STRENDS(email, "fr")) && invalid invalid ""`;
const sparqlStringForValueSourceField = `!BOUND(firstName) && BOUND(lastName) && firstName = middleName || firstName = lastName && lastName != middleName && lastName != lastName && firstName >= middleName && firstName <= lastName && firstName >= middleName && firstName <= lastName && (lastName < middleName || lastName > lastName) && age = iq && isMusician = isCreative && !(gender = someLetter || job != isBetweenJobs || CONTAINS(email, atSign)) && (!CONTAINS(lastName, firstName) || STRSTARTS(job, jobPrefix) || STRENDS(email, dotCom) || !STRSTARTS(job, hasNoJob) || !STRENDS(email, isInvalid))`;

it('formats SPARQL correctly', () => {
  const sparqlQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(sparqlQuery, 'sparql')).toBe(sparqlString);
  expect(formatQuery(queryWithValueSourceField, 'sparql')).toBe(sparqlStringForValueSourceField);
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'sparql')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'sparql')
  );
});

it('escapes quotes when appropriate', () => {
  expect(formatQuery(testQuerySQ, 'sparql')).toBe(`f1 = "Te'st"`);
  expect(formatQuery(testQueryDQ, 'sparql')).toBe(`f1 = "Te\\"st"`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'sparql')).toBe(
    `firstName = "Test" && middleName = "Test" || lastName = "Test"`
  );

  expect(
    formatQuery(
      { rules: [{ field: 'field', operator: '=', value: '' }, 'and', { rules: [] }] },
      'sparql'
    )
  ).toBe(`field = "" && 1 = 1`);
});

it('handles parseNumbers', () => {
  expect(formatQuery(queryForNumberParsing, { format: 'sparql', parseNumbers: true })).toBe(
    `f > "NaN" && f = 0 && f = 0 && f = 0 && (f < 1.5 || f > 1.5) && f = 0 || f = 1 || f = 2 && f = 0 || f = 1 || f = 2 && f = 0 || f = "abc" || f = 2 && f >= 0 && f <= 1 && f >= 0 && f <= 1 && f >= 0 && f <= "abc" && f >= "{}" && f <= "{}"`
  );
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate sparql': '1 = 1',
    'should invalidate sparql even if fields are valid': '1 = 1',
    'should invalidate sparql rule by validator function': `field2 = ""`,
    'should invalidate sparql rule specified by validationMap': `field2 = ""`,
    'should invalidate sparql outermost group': '1 = 1',
    'should invalidate sparql inner group': '1 = 1',
    'should convert sparql inner group with no rules to fallbackExpression': `field = "" && 1 = 1`,
    'should invalidate sparql following combinator of first rule': `field2 = "" || field3 = ""`,
    'should invalidate sparql preceding combinator of non-first rule': `field = "" || field3 = ""`,
  };

  for (const vtd of getValidationTestData('sparql')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  }
});

it('handles null, bigint, and <> operator values', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f', operator: '=', value: null },
          { field: 'f', operator: '<>', value: 'x' },
          { field: 'f', operator: '=', value: BigInt(42) },
        ],
      },
      'sparql'
    )
  ).toBe(`f = "" && f != "x" && f = 42`);
});

it('handles SPARQL variable refs, URIs, and prefixed names', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f', operator: '=', value: '?x' },
          { field: 'f', operator: '=', value: '<http://example.org>' },
          { field: 'f', operator: '=', value: 'rdf:type' },
        ],
      },
      'sparql'
    )
  ).toBe(`f = ?x && f = <http://example.org> && f = rdf:type`);
});

it('handles empty notin and short notBetween', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f', operator: 'notin', value: [] },
          { field: 'f', operator: 'notBetween', value: 'a' },
          { field: 'g', operator: '=', value: 'ok' },
        ],
      },
      'sparql'
    )
  ).toBe(`g = "ok"`);
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom SPARQL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSPARQL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'sparql', ruleProcessor })).toBe(
      `custom_operator && f2 = "v2"`
    );
  });

  it('handles custom SPARQL rule processor returning false', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? false : defaultRuleProcessorSPARQL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'sparql', ruleProcessor })).toBe(
      `f2 = "v2"`
    );
  });

  it('handles custom SPARQL rule processor returning empty string', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? '' : defaultRuleProcessorSPARQL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'sparql', ruleProcessor })).toBe(
      `f2 = "v2"`
    );
  });
});

it('skips rules with placeholder field, operator, or value', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: defaultPlaceholderFieldName, operator: '=', value: 'v1' },
          { field: 'f2', operator: defaultPlaceholderOperatorName, value: 'v2' },
          { field: 'f3', operator: '=', value: 'PLACEHOLDER' },
          { field: 'f4', operator: '=', value: 'v4' },
        ],
      },
      { format: 'sparql', placeholderValueName: 'PLACEHOLDER' }
    )
  ).toBe(`f4 = "v4"`);
});

it('returns empty string for invalid inner group', () => {
  expect(
    formatQuery(
      {
        id: 'root',
        combinator: 'and',
        rules: [
          { field: 'f1', operator: '=', value: 'v1' },
          { id: 'inner', combinator: 'and', rules: [{ field: 'f2', operator: '=', value: 'v2' }] },
        ],
      },
      { format: 'sparql', validator: () => ({ inner: false }) }
    )
  ).toBe(`f1 = "v1"`);
});

describe('regex (custom ruleProcessor)', () => {
  it('matchesRegex', () => {
    expect(
      formatQuery(regexQuery('?'), { format: 'sparql', ruleProcessor: sparqlGraphProcessor })
    ).toBe(`REGEX(?madeUpName, ".*man$")`);
  });

  it('doesNotMatchRegex', () => {
    expect(
      formatQuery(regexNegationQuery('?'), {
        format: 'sparql',
        ruleProcessor: sparqlGraphProcessor,
      })
    ).toBe(`!REGEX(?madeUpName, "^S.*")`);
  });
});

describe('typed literals (custom ruleProcessor)', () => {
  const fields = [
    { name: '?age', label: 'Age', inputType: 'number' as const },
    { name: '?birthDate', label: 'Birth Date', inputType: 'date' as const },
    { name: '?timestamp', label: 'Timestamp', inputType: 'datetime-local' as const },
  ];

  it('emits xsd:integer for integer values', () => {
    expect(
      formatQuery(
        { combinator: 'and', rules: [{ field: '?age', operator: '>', value: '42' }] },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor, fields }
      )
    ).toBe(`?age > "42"^^xsd:integer`);
  });

  it('emits xsd:decimal for decimal values', () => {
    expect(
      formatQuery(
        { combinator: 'and', rules: [{ field: '?age', operator: '=', value: '3.14' }] },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor, fields }
      )
    ).toBe(`?age = "3.14"^^xsd:decimal`);
  });

  it('emits xsd:date for date fields', () => {
    expect(
      formatQuery(
        {
          combinator: 'and',
          rules: [{ field: '?birthDate', operator: '>=', value: '2000-01-15' }],
        },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor, fields }
      )
    ).toBe(`?birthDate >= "2000-01-15"^^xsd:date`);
  });

  it('emits xsd:dateTime for datetime-local fields', () => {
    expect(
      formatQuery(
        {
          combinator: 'and',
          rules: [{ field: '?timestamp', operator: '<', value: '2024-01-15T10:30:00' }],
        },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor, fields }
      )
    ).toBe(`?timestamp < "2024-01-15T10:30:00"^^xsd:dateTime`);
  });

  it('falls back to default for string fields', () => {
    expect(
      formatQuery(
        { combinator: 'and', rules: [{ field: '?name', operator: '=', value: 'Steve' }] },
        { format: 'sparql', ruleProcessor: sparqlTypedLiteralProcessor }
      )
    ).toBe(`?name = "Steve"`);
  });
});

describe('case-insensitive (custom ruleProcessor)', () => {
  it('equalsIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveEqualsQuery('?'), {
        format: 'sparql',
        ruleProcessor: sparqlGraphProcessor,
      })
    ).toBe(`LCASE(?firstName) = LCASE("steve")`);
  });

  it('containsIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveContainsQuery('?'), {
        format: 'sparql',
        ruleProcessor: sparqlGraphProcessor,
      })
    ).toBe(`CONTAINS(LCASE(?madeUpName), LCASE("spider"))`);
  });

  it('beginsWithIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveBeginsWithQuery('?'), {
        format: 'sparql',
        ruleProcessor: sparqlGraphProcessor,
      })
    ).toBe(`STRSTARTS(LCASE(?madeUpName), LCASE("super"))`);
  });
});
