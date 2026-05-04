import type { RuleGroupType, RuleProcessor } from '../../../types';
import { add } from '../../queryTools';
import { defaultRuleProcessorCypher } from '../defaultRuleProcessorCypher';
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
  cypherGraphProcessor,
  listContainsQuery,
  listDoesNotContainQuery,
  regexNegationQuery,
  regexQuery,
} from './graphTestUtils';

const cypherString = `firstName IS NULL AND lastName IS NOT NULL AND firstName IN ['Test', 'This'] AND NOT lastName IN ['Test', 'This'] AND 'Test' <= firstName AND firstName <= 'This' AND 'Test' <= firstName AND firstName <= 'This' AND NOT ('Test' <= lastName AND lastName <= 'This') AND '12' <= age AND age <= '14' AND age = '26' AND isMusician = true AND isLucky = false AND NOT (gender = 'M' OR job <> 'Programmer' OR email CONTAINS '@') AND (NOT lastName CONTAINS 'ab' OR job STARTS WITH 'Prog' OR email ENDS WITH 'com' OR NOT job STARTS WITH 'Man' OR NOT email ENDS WITH 'fr') AND invalid invalid ''`;
const cypherStringForValueSourceField = `firstName IS NULL AND lastName IS NOT NULL AND firstName IN [middleName, lastName] AND NOT lastName IN [middleName, lastName] AND middleName <= firstName AND firstName <= lastName AND middleName <= firstName AND firstName <= lastName AND NOT (middleName <= lastName AND lastName <= lastName) AND age = iq AND isMusician = isCreative AND NOT (gender = someLetter OR job <> isBetweenJobs OR email CONTAINS atSign) AND (NOT lastName CONTAINS firstName OR job STARTS WITH jobPrefix OR email ENDS WITH dotCom OR NOT job STARTS WITH hasNoJob OR NOT email ENDS WITH isInvalid)`;

it('formats Cypher correctly', () => {
  const cypherQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(cypherQuery, 'cypher')).toBe(cypherString);
  expect(formatQuery(queryWithValueSourceField, 'cypher')).toBe(cypherStringForValueSourceField);
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'cypher')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'cypher')
  );
});

it('escapes quotes when appropriate', () => {
  expect(formatQuery(testQuerySQ, 'cypher')).toBe(`f1 = 'Te\\'st'`);
  expect(formatQuery(testQueryDQ, 'cypher')).toBe(`f1 = 'Te"st'`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'cypher')).toBe(
    `firstName = 'Test' AND middleName = 'Test' OR lastName = 'Test'`
  );

  expect(
    formatQuery(
      { rules: [{ field: 'field', operator: '=', value: '' }, 'and', { rules: [] }] },
      'cypher'
    )
  ).toBe(`field = '' AND (1 = 1)`);
});

it('handles parseNumbers', () => {
  expect(formatQuery(queryForNumberParsing, { format: 'cypher', parseNumbers: true })).toBe(
    `f > 'NaN' AND f = 0 AND f = 0 AND f = 0 AND (f < 1.5 OR f > 1.5) AND f IN [0, 1, 2] AND f IN [0, 1, 2] AND f IN [0, 'abc', 2] AND 0 <= f AND f <= 1 AND 0 <= f AND f <= 1 AND 0 <= f AND f <= 'abc' AND '[object Object]' <= f AND f <= '[object Object]'`
  );
});

it('formats GQL identically to Cypher', () => {
  const cypherQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(cypherQuery, 'gql')).toBe(formatQuery(cypherQuery, 'cypher'));
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate cypher': '(1 = 1)',
    'should invalidate cypher even if fields are valid': '(1 = 1)',
    'should invalidate cypher rule by validator function': `field2 = ''`,
    'should invalidate cypher rule specified by validationMap': `field2 = ''`,
    'should invalidate cypher outermost group': '(1 = 1)',
    'should invalidate cypher inner group': '(1 = 1)',
    'should convert cypher inner group with no rules to fallbackExpression': `field = '' AND (1 = 1)`,
    'should invalidate cypher following combinator of first rule': `field2 = '' OR field3 = ''`,
    'should invalidate cypher preceding combinator of non-first rule': `field = '' OR field3 = ''`,
  };

  for (const vtd of getValidationTestData('cypher')) {
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
      'cypher'
    )
  ).toBe(`f = null AND f <> 'x' AND f = 42`);
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom Cypher rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorCypher(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'cypher', ruleProcessor })).toBe(
      "custom_operator AND f2 = 'v2'"
    );
  });

  it('handles custom Cypher rule processor returning false', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? false : defaultRuleProcessorCypher(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'cypher', ruleProcessor })).toBe(
      "f2 = 'v2'"
    );
  });
});

describe('regex (custom ruleProcessor)', () => {
  it('matchesRegex', () => {
    expect(
      formatQuery(regexQuery(), { format: 'cypher', ruleProcessor: cypherGraphProcessor })
    ).toBe(`madeUpName =~ '.*man$'`);
  });

  it('doesNotMatchRegex', () => {
    expect(
      formatQuery(regexNegationQuery(), { format: 'cypher', ruleProcessor: cypherGraphProcessor })
    ).toBe(`NOT madeUpName =~ '^S.*'`);
  });
});

describe('list containment (custom ruleProcessor)', () => {
  it('listContains', () => {
    expect(
      formatQuery(listContainsQuery(), { format: 'cypher', ruleProcessor: cypherGraphProcessor })
    ).toBe(`'Cap' IN nicknames`);
  });

  it('listDoesNotContain', () => {
    expect(
      formatQuery(listDoesNotContainQuery(), {
        format: 'cypher',
        ruleProcessor: cypherGraphProcessor,
      })
    ).toBe(`NOT 'Spidey' IN nicknames`);
  });
});

describe('case-insensitive (custom ruleProcessor)', () => {
  it('equalsIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveEqualsQuery(), {
        format: 'cypher',
        ruleProcessor: cypherGraphProcessor,
      })
    ).toBe(`toLower(firstName) = toLower('steve')`);
  });

  it('containsIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveContainsQuery(), {
        format: 'cypher',
        ruleProcessor: cypherGraphProcessor,
      })
    ).toBe(`toLower(madeUpName) CONTAINS toLower('spider')`);
  });

  it('beginsWithIgnoreCase', () => {
    expect(
      formatQuery(caseInsensitiveBeginsWithQuery(), {
        format: 'cypher',
        ruleProcessor: cypherGraphProcessor,
      })
    ).toBe(`toLower(madeUpName) STARTS WITH toLower('super')`);
  });
});
