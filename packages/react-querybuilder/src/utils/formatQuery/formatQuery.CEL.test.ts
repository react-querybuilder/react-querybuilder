import type { RuleGroupType, RuleGroupTypeIC, RuleProcessor } from '../../types/index.noReact';
import { add } from '../queryTools';
import { defaultRuleProcessorCEL } from './defaultRuleProcessorCEL';
import { formatQuery } from './formatQuery';
import { query, queryWithValueSourceField } from './formatQueryTestUtils';
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
  const testQueryDQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te"st` }],
  };

  it(`escapes double quotes (if appropriate) for "cel" export`, () => {
    expect(formatQuery(testQueryDQ, 'cel')).toEqual(`f1 == "Te\\"st"`);
  });
});

describe('independent combinators', () => {
  const queryIC: RuleGroupTypeIC = {
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'middleName', operator: '=', value: 'Test' },
      'or',
      { field: 'lastName', operator: '=', value: 'Test' },
    ],
  };

  it('handles independent combinators for cel', () => {
    expect(formatQuery(queryIC, 'cel')).toBe(
      `firstName == "Test" && middleName == "Test" || lastName == "Test"`
    );
  });
});

describe('validation', () => {
  describe('cel', () => {
    it('should invalidate a cel query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'cel', validator: () => false }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate a cel rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          { format: 'cel', fields: [{ name: 'field', label: 'field', validator: () => false }] }
        )
      ).toBe('otherfield == ""');
    });

    it('should invalidate cel even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'cel',
            validator: () => false,
            fields: [{ name: 'field', label: 'field', validator: () => true }],
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate cel outermost group', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'cel', validator: () => ({ root: false }) }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate cel inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'cel',
            validator: () => ({ inner: false }),
          }
        )
      ).toBe('1 == 1');
    });
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
  const queryForNumberParsing: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: '>', value: 'NaN' },
      { field: 'f', operator: '=', value: '0' },
      { field: 'f', operator: '=', value: '    0    ' },
      { field: 'f', operator: '=', value: 0 },
      {
        combinator: 'or',
        rules: [
          { field: 'f', operator: '<', value: '1.5' },
          { field: 'f', operator: '>', value: 1.5 },
        ],
      },
      { field: 'f', operator: 'in', value: '0, 1, 2' },
      { field: 'f', operator: 'in', value: [0, 1, 2] },
      { field: 'f', operator: 'in', value: '0, abc, 2' },
      { field: 'f', operator: 'between', value: '0, 1' },
      { field: 'f', operator: 'between', value: [0, 1] },
      { field: 'f', operator: 'between', value: '0, abc' },
      { field: 'f', operator: 'between', value: '1' },
      { field: 'f', operator: 'between', value: 1 },
      { field: 'f', operator: 'between', value: [1] },
      { field: 'f', operator: 'between', value: [{}, {}] },
    ],
  };

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
