import { defaultPlaceholderFieldName, defaultPlaceholderOperatorName } from '../../../defaults';
import type { RuleGroupType, RuleProcessor } from '../../../types';
import { add } from '../../queryTools';
import { defaultRuleProcessorGremlin } from '../defaultRuleProcessorGremlin';
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

const gremlinString = `.hasNot('firstName').has('lastName').has('firstName', within('Test', 'This')).has('lastName', without('Test', 'This')).has('firstName', between('Test', 'This')).has('firstName', between('Test', 'This')).has('lastName', outside('Test', 'This')).has('age', between('12', '14')).has('age', '26').has('isMusician', true).has('isLucky', false).not(__.has('gender', 'M'), __.has('job', neq('Programmer')), __.has('email', containing('@'))).or(__.has('lastName', notContaining('ab')), __.has('job', startingWith('Prog')), __.has('email', endingWith('com')), __.has('job', notStartingWith('Man')), __.has('email', notEndingWith('fr'))).has('invalid', '')`;
const gremlinStringForValueSourceField = `.hasNot('firstName').has('lastName').has('firstName', within(middleName, lastName)).has('lastName', without(middleName, lastName)).has('firstName', between(middleName, lastName)).has('firstName', between(middleName, lastName)).has('lastName', outside(middleName, lastName)).has('age', iq).has('isMusician', isCreative).not(__.has('gender', someLetter), __.has('job', neq(isBetweenJobs)), __.has('email', containing(atSign))).or(__.has('lastName', notContaining(firstName)), __.has('job', startingWith(jobPrefix)), __.has('email', endingWith(dotCom)), __.has('job', notStartingWith(hasNoJob)), __.has('email', notEndingWith(isInvalid)))`;

it('formats Gremlin correctly', () => {
  const gremlinQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(gremlinQuery, 'gremlin')).toBe(gremlinString);
  expect(formatQuery(queryWithValueSourceField, 'gremlin')).toBe(gremlinStringForValueSourceField);
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'gremlin')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'gremlin')
  );
});

it('escapes quotes when appropriate', () => {
  expect(formatQuery(testQuerySQ, 'gremlin')).toBe(`.has('f1', 'Te\\'st')`);
  expect(formatQuery(testQueryDQ, 'gremlin')).toBe(`.has('f1', 'Te"st')`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'gremlin')).toBe(
    `.has('firstName', 'Test').has('middleName', 'Test').has('lastName', 'Test')`
  );

  expect(
    formatQuery(
      { rules: [{ field: 'field', operator: '=', value: '' }, 'and', { rules: [] }] },
      'gremlin'
    )
  ).toBe(`.has('field', '')`);
});

it('handles parseNumbers', () => {
  expect(formatQuery(queryForNumberParsing, { format: 'gremlin', parseNumbers: true })).toBe(
    `.has('f', gt('NaN')).has('f', 0).has('f', 0).has('f', 0).or(__.has('f', lt(1.5)), __.has('f', gt(1.5))).has('f', within(0, 1, 2)).has('f', within(0, 1, 2)).has('f', within(0, 'abc', 2)).has('f', between(0, 1)).has('f', between(0, 1)).has('f', between(0, 'abc')).has('f', between('[object Object]', '[object Object]'))`
  );
});

it('strips dotted field names to last segment', () => {
  const q: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'a.b.name', operator: '=', value: 'test' }],
  };
  expect(formatQuery(q, 'gremlin')).toBe(`.has('name', 'test')`);
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate gremlin': '',
    'should invalidate gremlin even if fields are valid': '',
    'should invalidate gremlin rule by validator function': `.has('field2', '')`,
    'should invalidate gremlin rule specified by validationMap': `.has('field2', '')`,
    'should invalidate gremlin outermost group': '',
    'should invalidate gremlin inner group': '',
    'should convert gremlin inner group with no rules to fallbackExpression': `.has('field', '')`,
    'should invalidate gremlin following combinator of first rule': `.has('field2', '').has('field3', '')`,
    'should invalidate gremlin preceding combinator of non-first rule': `.has('field', '').has('field3', '')`,
  };

  for (const vtd of getValidationTestData('gremlin')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  }
});

it('handles null, bigint, empty notIn, and short notBetween values', () => {
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f', operator: '=', value: null },
          { field: 'f', operator: '=', value: BigInt(42) },
          { field: 'f', operator: 'notIn', value: '' },
          { field: 'f', operator: 'notBetween', value: 'a' },
        ],
      },
      'gremlin'
    )
  ).toBe(`.has('f', null).has('f', 42)`);
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom Gremlin rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorGremlin(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'gremlin', ruleProcessor })).toBe(
      `custom_operator.has('f2', 'v2')`
    );
  });

  it('handles custom Gremlin rule processor returning false', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? false : defaultRuleProcessorGremlin(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'gremlin', ruleProcessor })).toBe(
      `.has('f2', 'v2')`
    );
  });

  it('handles custom Gremlin rule processor returning empty string', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? '' : defaultRuleProcessorGremlin(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'gremlin', ruleProcessor })).toBe(
      `.has('f2', 'v2')`
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
          {
            combinator: 'and',
            rules: [
              { field: defaultPlaceholderFieldName, operator: '=', value: 'nested1' },
              { field: 'f5', operator: defaultPlaceholderOperatorName, value: 'nested2' },
              { field: 'f6', operator: '=', value: 'PLACEHOLDER' },
              { field: 'f7', operator: '=', value: 'v7' },
            ],
          },
        ],
      },
      { format: 'gremlin', placeholderValueName: 'PLACEHOLDER' }
    )
  ).toBe(`.has('f4', 'v4').has('f7', 'v7')`);
});
