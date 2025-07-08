import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleProcessor,
} from '../../../types';
import { add } from '../../queryTools';
import { defaultRuleProcessorSpEL } from '../defaultRuleProcessorSpEL';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryForRuleProcessor,
  queryIC,
  queryWithMatchModes,
  queryWithValueSourceField,
  testQuerySQ,
} from '../formatQueryTestUtils';
import { defaultSpELValueProcessor } from '../index';

const spelString =
  "firstName == null and lastName != null and (firstName == 'Test' or firstName == 'This') and !(lastName == 'Test' or lastName == 'This') and (firstName >= 'Test' and firstName <= 'This') and (firstName >= 'Test' and firstName <= 'This') and (lastName < 'Test' or lastName > 'This') and (age >= 12 and age <= 14) and age == '26' and isMusician == true and isLucky == false and !(gender == 'M' or job != 'Programmer' or email matches '@') and (!(lastName matches 'ab') or job matches '^Prog' or email matches 'com$' or !(job matches '^Man') or !(email matches 'fr$'))";
const spelStringForValueSourceField =
  "firstName == null and lastName != null and (firstName == middleName or firstName == lastName) and !(lastName == middleName or lastName == lastName) and (firstName >= middleName and firstName <= lastName) and (firstName >= middleName and firstName <= lastName) and (lastName < middleName or lastName > lastName) and age == iq and isMusician == isCreative and !(gender == someLetter or job != isBetweenJobs or email matches atSign) and (!(lastName matches firstName) or job matches '^'.concat(jobPrefix) or email matches dotCom.concat('$') or !(job matches '^'.concat(hasNoJob)) or !(email matches isInvalid.concat('$')))";
const spelStringForMatchModes =
  "fs.?[#this matches 'S'].size() == fs.size() and fs.?[fv matches 'S'].size() == fs.size() and fs.?[#this matches 'S'].size() == 0 and fs.?[#this matches 'S'].size() >= 1 and fs.?[#this matches 'S'].size() >= 1 and fs.?[#this matches 'S'].size() == 0 and fs.?[#this matches 'S'].size() >= 2 and fs.?[fv matches 'S'].size() >= 2 and fs.?[#this matches 'S'].size() >= (fs.size() * 0.5) and fs.?[#this matches 'S'].size() <= 2 and fs.?[#this matches 'S'].size() <= (fs.size() * 0.5) and fs.?[#this matches 'S'].size() == 2 and fs.?[#this matches 'S'].size() == (fs.size() * 0.5) and fs.?[#this matches 'S' and #this matches 'S'].size() == fs.size() and fs.?[#this matches 'S' and #this matches 'S'].size() >= 2";

it('formats SpEL correctly', () => {
  const spelQuery = add(query, { field: 'invalid', operator: 'invalid', value: '' }, []);
  expect(formatQuery(spelQuery, 'spel')).toBe(spelString);
  expect(formatQuery(queryWithValueSourceField, 'spel')).toBe(spelStringForValueSourceField);
  expect(
    formatQuery(queryWithValueSourceField, {
      format: 'spel',
      valueProcessor: defaultSpELValueProcessor,
    })
  ).toBe(spelStringForValueSourceField);
  expect(
    formatQuery(
      { combinator: 'and', rules: [{ field: 'f', operator: 'between', value: [14, 12] }] },
      'spel'
    )
  ).toBe('(f >= 12 and f <= 14)');
  expect(formatQuery(queryWithMatchModes, 'spel')).toBe(spelStringForMatchModes);
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'spel')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'spel')
  );
});

it('escapes quotes when appropriate', () => {
  expect(formatQuery(testQuerySQ, 'spel')).toEqual(`f1 == 'Te\\'st'`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'spel')).toBe(
    `firstName == 'Test' and middleName == 'Test' or lastName == 'Test'`
  );
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate spel': '1 == 1',
    'should invalidate spel even if fields are valid': '1 == 1',
    'should invalidate spel rule by validator function': `field2 == ''`,
    'should invalidate spel rule specified by validationMap': `field2 == ''`,
    'should invalidate spel outermost group': '1 == 1',
    'should invalidate spel inner group': '1 == 1',
    'should convert spel inner group with no rules to fallbackExpression': `field == '' and 1 == 1`,
  };

  for (const vtd of getValidationTestData('spel')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  }
});

it('ruleProcessor', () => {
  const ruleProcessor: RuleProcessor = r =>
    r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSpEL(r);
  expect(formatQuery(queryForRuleProcessor, { format: 'spel', ruleProcessor })).toBe(
    "custom_operator and f2 == 'v2'"
  );
  expect(
    formatQuery(queryForRuleProcessor, { format: 'spel', valueProcessor: ruleProcessor })
  ).toBe("custom_operator and f2 == 'v2'");
});

it('parseNumbers', () => {
  const allNumbersParsed =
    "f > 'NaN' and f == 0 and f == 0 and f == 0 and (f < 1.5 or f > 1.5) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 'abc' or f == 2) and (f >= 0 and f <= 1) and (f >= 0 and f <= 1) and (f >= 0 and f <= 'abc') and (f >= '[object Object]' and f <= '[object Object]')";
  for (const opts of [
    { parseNumbers: true },
    { parseNumbers: 'strict' },
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ] as FormatQueryOptions[]) {
    expect(formatQuery(queryForNumberParsing, { ...opts, format: 'spel' })).toBe(allNumbersParsed);
  }
  const queryForNumberParsingSpEL: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: 'beginsWith', value: 1 },
      { field: 'f', operator: 'beginsWith', value: '^hasCaret' },
      { field: 'f', operator: 'endsWith', value: 1 },
      { field: 'f', operator: 'endsWith', value: 'hasDollarSign$' },
    ],
  };
  expect(
    formatQuery(queryForNumberParsingSpEL, {
      format: 'spel',
      parseNumbers: true,
    })
  ).toBe(
    `f matches '^1' and f matches '^hasCaret' and f matches '1$' and f matches 'hasDollarSign$'`
  );
});

it('preserveValueOrder', () => {
  expect(formatQuery(queryForPreserveValueOrder, { format: 'spel', parseNumbers: true })).toBe(
    `(f1 >= 12 and f1 <= 14) and (f2 >= 12 and f2 <= 14)`
  );
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'spel',
      parseNumbers: true,
      preserveValueOrder: true,
    })
  ).toBe(`(f1 >= 12 and f1 <= 14) and (f2 >= 14 and f2 <= 12)`);
});

it('parseNumbers with between operators', () => {
  const betweenQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'age', operator: 'between', value: '22,34' },
      { field: 'score', operator: 'notBetween', value: ['10', '20'] },
    ],
  };

  // Default behavior (backwards compatibility) - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'spel' })).toBe(
    '(age >= 22 and age <= 34) and (score < 10 or score > 20)'
  );

  // Explicit parseNumbers: true - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'spel', parseNumbers: true })).toBe(
    '(age >= 22 and age <= 34) and (score < 10 or score > 20)'
  );

  // parseNumbers: false - should NOT parse numbers (keep as strings)
  expect(formatQuery(betweenQuery, { format: 'spel', parseNumbers: false })).toBe(
    "(age >= '22' and age <= '34') and (score < '10' or score > '20')"
  );
});
