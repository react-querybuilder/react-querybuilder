import { describe, expect, it } from '@jest/globals';
import type { RuleGroupType, RuleProcessor } from '../../types/index.noReact';
import { add } from '../queryTools';
import { defaultRuleProcessorJSONata } from './defaultRuleProcessorJSONata';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  query,
  queryForNumberParsing,
  queryIC,
  queryWithValueSourceField,
  testQueryDQ,
} from './formatQueryTestUtils';

const jsonataString = `firstName = null and lastName != null and firstName in ["Test", "This"] and $not(lastName in ["Test", "This"]) and firstName in [] and (firstName >= "Test" and firstName <= "This") and (firstName >= "Test" and firstName <= "This") and $not(lastName >= "Test" and lastName <= "This") and (age >= "12" and age <= "14") and age = "26" and isMusician = true and isLucky = false and $not(gender = "M" or job != "Programmer" or $contains(email, "@")) and ($not($contains(lastName, "ab")) or $contains(job, /^Prog/) or $contains(email, /com$/) or $not($contains(job, /^Man/)) or $not($contains(email, /fr$/)))`;
const jsonataStringForValueSourceField = `firstName = null and lastName != null and firstName in [middleName, lastName] and $not(lastName in [middleName, lastName]) and firstName in [] and (firstName >= middleName and firstName <= lastName) and (firstName >= middleName and firstName <= lastName) and $not(lastName >= middleName and lastName <= lastName) and age = iq and isMusician = isCreative and $not(gender = someLetter or job != isBetweenJobs or $contains(email, atSign)) and ($not($contains(lastName, firstName)) or $substring(job, 0, $length(jobPrefix)) = jobPrefix or $substring(email, $length(email) - $length(dotCom)) = dotCom or $not($substring(job, 0, $length(hasNoJob)) = hasNoJob) or $not($substring(email, $length(email) - $length(isInvalid)) = isInvalid))`;

it('formats JSONata correctly', () => {
  const jsonataQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(jsonataQuery, 'jsonata')).toBe(jsonataString);
  expect(formatQuery(queryWithValueSourceField, 'jsonata')).toBe(jsonataStringForValueSourceField);
  expect(
    formatQuery(
      { combinator: 'and', rules: [{ field: 'f', operator: 'between', value: [14, 12] }] },
      'jsonata'
    )
  ).toBe('(f >= "12" and f <= "14")');
});

describe('escapes quotes when appropriate', () => {
  it(`escapes double quotes (if appropriate) for "jsonata" export`, () => {
    expect(formatQuery(testQueryDQ, 'jsonata')).toEqual(`f1 = "Te\\"st"`);
  });
});

describe('independent combinators', () => {
  it('handles independent combinators for jsonata', () => {
    expect(formatQuery(queryIC, 'jsonata')).toBe(
      `firstName = "Test" and middleName = "Test" or lastName = "Test"`
    );
  });
});

describe('validation', () => {
  describe('jsonata', () => {
    const validationResults: Record<string, string> = {
      'should invalidate jsonata': '(1 = 1)',
      'should invalidate jsonata even if fields are valid': '(1 = 1)',
      'should invalidate jsonata rule by validator function': `field2 = ""`,
      'should invalidate jsonata rule specified by validationMap': `field2 = ""`,
      'should invalidate jsonata outermost group': '(1 = 1)',
      'should invalidate jsonata inner group': '(1 = 1)',
      'should convert jsonata inner group with no rules to fallbackExpression':
        'field = "" and (1 = 1)',
    };

    for (const vtd of getValidationTestData('jsonata')) {
      if (typeof validationResults[vtd.title] !== 'undefined') {
        it(vtd.title, () => {
          expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
        });
      }
    }
  });
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom JSONata rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorJSONata(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'jsonata', ruleProcessor })).toBe(
      'custom_operator and f2 = "v2"'
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'jsonata', valueProcessor: ruleProcessor })
    ).toBe('custom_operator and f2 = "v2"');
  });
});

describe('parseNumbers', () => {
  it('parses numbers for jsonata', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'jsonata', parseNumbers: true })).toBe(
      'f > "NaN" and f = 0 and f = 0 and f = 0 and (f < 1.5 or f > 1.5) and f in [0, 1, 2] and f in [0, 1, 2] and f in [0, "abc", 2] and (f >= 0 and f <= 1) and (f >= 0 and f <= 1) and (f >= "0" and f <= "abc") and (f >= "[object Object]" and f <= "[object Object]")'
    );
    const queryForNumberParsingJSONata: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f', operator: 'beginsWith', value: 1 },
        { field: 'f', operator: 'endsWith', value: 1 },
      ],
    };
    expect(
      formatQuery(queryForNumberParsingJSONata, { format: 'jsonata', parseNumbers: true })
    ).toBe(`$contains(f, /^1/) and $contains(f, /1$/)`);
  });
});
