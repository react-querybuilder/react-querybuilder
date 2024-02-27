import type { RuleGroupType, RuleProcessor } from '../../types/index.noReact';
import { add } from '../queryTools';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  query,
  queryForNumberParsing,
  queryIC,
  queryWithValueSourceField,
  testQueryDQ,
} from './formatQueryTestUtils';
import { defaultCELValueProcessor } from './index';

const celString =
  'firstName == null && lastName != null && firstName in ["Test", "This"] && !(lastName in ["Test", "This"]) && (firstName >= "Test" && firstName <= "This") && (firstName >= "Test" && firstName <= "This") && (lastName < "Test" || lastName > "This") && (age >= 12 && age <= 14) && age == "26" && isMusician == true && isLucky == false && !(gender == "M" || job != "Programmer" || email.contains("@")) && (!lastName.contains("ab") || job.startsWith("Prog") || email.endsWith("com") || !job.startsWith("Man") || !email.endsWith("fr"))';
const celStringForValueSourceField =
  'firstName == null && lastName != null && firstName in [middleName, lastName] && !(lastName in [middleName, lastName]) && (firstName >= middleName && firstName <= lastName) && (firstName >= middleName && firstName <= lastName) && (lastName < middleName || lastName > lastName) && age == iq && isMusician == isCreative && !(gender == someLetter || job != isBetweenJobs || email.contains(atSign)) && (!lastName.contains(firstName) || job.startsWith(jobPrefix) || email.endsWith(dotCom) || !job.startsWith(hasNoJob) || !email.endsWith(isInvalid))';

it('formats CEL correctly', () => {
  const celQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(celQuery, 'cel')).toBe(celString);
  expect(formatQuery(queryWithValueSourceField, 'cel')).toBe(celStringForValueSourceField);
  expect(
    formatQuery(queryWithValueSourceField, {
      format: 'cel',
      valueProcessor: defaultCELValueProcessor,
    })
  ).toBe(celStringForValueSourceField);
  expect(
    formatQuery(
      { combinator: 'and', rules: [{ field: 'f', operator: 'between', value: [14, 12] }] },
      'cel'
    )
  ).toBe('(f >= 12 && f <= 14)');
});

describe('escapes quotes when appropriate', () => {
  it(`escapes double quotes (if appropriate) for "cel" export`, () => {
    expect(formatQuery(testQueryDQ, 'cel')).toEqual(`f1 == "Te\\"st"`);
  });
});

describe('independent combinators', () => {
  it('handles independent combinators for cel', () => {
    expect(formatQuery(queryIC, 'cel')).toBe(
      `firstName == "Test" && middleName == "Test" || lastName == "Test"`
    );
  });
});

describe('validation', () => {
  describe('cel', () => {
    const validationResults: Record<string, string> = {
      'should invalidate cel': '1 == 1',
      'should invalidate cel even if fields are valid': '1 == 1',
      'should invalidate cel rule by validator function': `field2 == ""`,
      'should invalidate cel rule specified by validationMap': `field2 == ""`,
      'should invalidate cel outermost group': '1 == 1',
      'should invalidate cel inner group': '1 == 1',
      'should convert cel inner group with no rules to fallbackExpression': 'field == "" && 1 == 1',
    };

    for (const vtd of getValidationTestData('cel')) {
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

  it('handles custom CEL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorCEL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'cel', ruleProcessor })).toBe(
      'custom_operator && f2 == "v2"'
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'cel', valueProcessor: ruleProcessor })
    ).toBe('custom_operator && f2 == "v2"');
  });
});

describe('parseNumbers', () => {
  it('parses numbers for cel', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'cel', parseNumbers: true })).toBe(
      'f > "NaN" && f == 0 && f == 0 && f == 0 && (f < 1.5 || f > 1.5) && f in [0, 1, 2] && f in [0, 1, 2] && f in [0, "abc", 2] && (f >= 0 && f <= 1) && (f >= 0 && f <= "abc") && (f >= "[object Object]" && f <= "[object Object]")'
    );
    const queryForNumberParsingCEL: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f', operator: 'beginsWith', value: 1 },
        { field: 'f', operator: 'endsWith', value: 1 },
      ],
    };
    expect(formatQuery(queryForNumberParsingCEL, { format: 'cel', parseNumbers: true })).toBe(
      `f.startsWith("1") && f.endsWith("1")`
    );
  });
});
