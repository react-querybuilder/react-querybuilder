import type { FormatQueryOptions, RuleGroupType, RuleProcessor } from '../../../types';
import { add } from '../../queryTools';
import { defaultRuleProcessorCEL } from '../defaultRuleProcessorCEL';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryIC,
  queryWithMatchModes,
  queryWithValueSourceField,
  testQueryDQ,
} from '../formatQueryTestUtils';
import { defaultCELValueProcessor } from '../index';

const celString =
  'firstName == null && lastName != null && firstName in ["Test", "This"] && !(lastName in ["Test", "This"]) && firstName in [] && (firstName >= "Test" && firstName <= "This") && (firstName >= "Test" && firstName <= "This") && (lastName < "Test" || lastName > "This") && (age >= 12 && age <= 14) && age == "26" && isMusician == true && isLucky == false && !(gender == "M" || job != "Programmer" || email.contains("@")) && (!lastName.contains("ab") || job.startsWith("Prog") || email.endsWith("com") || !job.startsWith("Man") || !email.endsWith("fr"))';
const celStringForValueSourceField =
  'firstName == null && lastName != null && firstName in [middleName, lastName] && !(lastName in [middleName, lastName]) && firstName in [] && (firstName >= middleName && firstName <= lastName) && (firstName >= middleName && firstName <= lastName) && (lastName < middleName || lastName > lastName) && age == iq && isMusician == isCreative && !(gender == someLetter || job != isBetweenJobs || email.contains(atSign)) && (!lastName.contains(firstName) || job.startsWith(jobPrefix) || email.endsWith(dotCom) || !job.startsWith(hasNoJob) || !email.endsWith(isInvalid))';
const celStringForMatchModes =
  'fs.all(elem_alias, elem_alias.contains("S")) && fs.all(elem_alias, elem_alias.fv.contains("S")) && !fs.exists(elem_alias, elem_alias.contains("S")) && fs.exists(elem_alias, elem_alias.contains("S")) && fs.exists(elem_alias, elem_alias.contains("S")) && !fs.exists(elem_alias, elem_alias.contains("S")) && fs.filter(elem_alias, elem_alias.contains("S")).size() >= 2 && fs.filter(elem_alias, elem_alias.fv.contains("S")).size() >= 2 && fs.filter(elem_alias, elem_alias.contains("S")).size() >= (double(fs.size()) * 0.5) && fs.filter(elem_alias, elem_alias.contains("S")).size() <= 2 && fs.filter(elem_alias, elem_alias.contains("S")).size() <= (double(fs.size()) * 0.5) && fs.filter(elem_alias, elem_alias.contains("S")).size() == 2 && fs.filter(elem_alias, elem_alias.contains("S")).size() == (double(fs.size()) * 0.5) && fs.all(elem_alias, elem_alias.contains("S") && elem_alias.contains("S")) && fs.filter(elem_alias, elem_alias.contains("S") && elem_alias.contains("S")).size() >= 2';

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
  expect(formatQuery(queryWithMatchModes, 'cel')).toBe(celStringForMatchModes);
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'cel')).toBe(
    formatQuery(queryAllOperatorsRandomCase, 'cel')
  );
});

it('escapes quotes when appropriate', () => {
  expect(formatQuery(testQueryDQ, 'cel')).toEqual(`f1 == "Te\\"st"`);
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'cel')).toBe(
    `firstName == "Test" && middleName == "Test" || lastName == "Test"`
  );

  expect(
    formatQuery(
      { rules: [{ field: 'field', operator: '=', value: '' }, 'and', { rules: [] }] },
      'cel'
    )
  ).toBe(`field == "" && 1 == 1`);
});

describe('validation', () => {
  const validationResults: Record<string, string> = {
    'should invalidate cel': '1 == 1',
    'should invalidate cel even if fields are valid': '1 == 1',
    'should invalidate cel rule by validator function': `field2 == ""`,
    'should invalidate cel rule specified by validationMap': `field2 == ""`,
    'should invalidate cel outermost group': '1 == 1',
    'should invalidate cel inner group': '1 == 1',
    'should convert cel inner group with no rules to fallbackExpression': 'field == "" && 1 == 1',
    'should invalidate cel following combinator of first rule': 'field2 == "" || field3 == ""',
    'should invalidate cel preceding combinator of non-first rule': 'field == "" || field3 == ""',
  };

  for (const vtd of getValidationTestData('cel')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  }
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
    const allNumbersParsed =
      'f > "NaN" && f == 0 && f == 0 && f == 0 && (f < 1.5 || f > 1.5) && f in [0, 1, 2] && f in [0, 1, 2] && f in [0, "abc", 2] && (f >= 0 && f <= 1) && (f >= 0 && f <= 1) && (f >= 0 && f <= "abc") && (f >= "[object Object]" && f <= "[object Object]")';
    for (const opts of [
      { parseNumbers: true },
      { parseNumbers: 'strict' },
      { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
    ] as FormatQueryOptions[]) {
      expect(formatQuery(queryForNumberParsing, { ...opts, format: 'cel' })).toBe(allNumbersParsed);
    }
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

it('preserveValueOrder', () => {
  const queryForPreserveValueOrder: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'between', value: '12,14' },
      { field: 'f2', operator: 'between', value: '14,12' },
    ],
  };
  expect(formatQuery(queryForPreserveValueOrder, { format: 'cel' })).toBe(
    `(f1 >= 12 && f1 <= 14) && (f2 >= 12 && f2 <= 14)`
  );
  expect(formatQuery(queryForPreserveValueOrder, { format: 'cel', preserveValueOrder: true })).toBe(
    `(f1 >= 12 && f1 <= 14) && (f2 >= 14 && f2 <= 12)`
  );
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
  expect(formatQuery(betweenQuery, { format: 'cel' })).toBe(
    '(age >= 22 && age <= 34) && (score < 10 || score > 20)'
  );

  // Explicit parseNumbers: true - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'cel', parseNumbers: true })).toBe(
    '(age >= 22 && age <= 34) && (score < 10 || score > 20)'
  );

  // parseNumbers: false - should NOT parse numbers (keep as strings)
  expect(formatQuery(betweenQuery, { format: 'cel', parseNumbers: false })).toBe(
    '(age >= "22" && age <= "34") && (score < "10" || score > "20")'
  );
});
