import type {
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { add } from '../queryTools';
import { defaultRuleProcessorSpEL } from './defaultRuleProcessorSpEL';
import { formatQuery } from './formatQuery';
import { query, queryWithValueSourceField } from './formatQueryTestUtils';
import { defaultSpELValueProcessor, defaultValueProcessorByRule } from './index';

const spelString =
  "firstName == null and lastName != null and (firstName == 'Test' or firstName == 'This') and !(lastName == 'Test' or lastName == 'This') and (firstName >= 'Test' and firstName <= 'This') and (firstName >= 'Test' and firstName <= 'This') and (lastName < 'Test' or lastName > 'This') and (age >= 12 and age <= 14) and age == '26' and isMusician == true and isLucky == false and !(gender == 'M' or job != 'Programmer' or email matches '@') and (!(lastName matches 'ab') or job matches '^Prog' or email matches 'com$' or !(job matches '^Man') or !(email matches 'fr$'))";
const spelStringForValueSourceField =
  "firstName == null and lastName != null and (firstName == middleName or firstName == lastName) and !(lastName == middleName or lastName == lastName) and (firstName >= middleName and firstName <= lastName) and (firstName >= middleName and firstName <= lastName) and (lastName < middleName or lastName > lastName) and age == iq and isMusician == isCreative and !(gender == someLetter or job != isBetweenJobs or email matches atSign) and (!(lastName matches firstName) or job matches '^'.concat(jobPrefix) or email matches dotCom.concat('$') or !(job matches '^'.concat(hasNoJob)) or !(email matches isInvalid.concat('$')))";

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
});

it('handles invalid type correctly', () => {
  // @ts-expect-error 'null' is not a valid format
  expect(formatQuery(query, 'null')).toBe('');
});

it('handles custom valueProcessors correctly', () => {
  const queryWithArrayValue: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: ['Guitar', 'Vocals'], operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
    ],
    not: false,
  };

  const valueProcessorLegacy: ValueProcessorLegacy = (_field, operator, value) => {
    if (operator === 'in') {
      return `(${value.map((v: string) => `'${v.trim()}'`).join(', /* and */ ')})`;
    } else {
      return `'${value}'`;
    }
  };

  expect(
    formatQuery(queryWithArrayValue, {
      format: 'sql',
      valueProcessor: valueProcessorLegacy,
    })
  ).toBe(`(instrument in ('Guitar', /* and */ 'Vocals') and lastName = 'Vai')`);

  const queryForNewValueProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `v'1`, valueSource: 'value' }],
  };

  const valueProcessor: ValueProcessorByRule = (
    { field, operator, value, valueSource },
    opts = {}
  ) => `${field}-${operator}-${value}-${valueSource}-${!!opts.parseNumbers}-${!!opts.escapeQuotes}`;

  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      parseNumbers: true,
      valueProcessor,
    })
  ).toBe(`(f1 = f1-=-v'1-value-true-true)`);

  const valueProcessorAsPassThrough: ValueProcessorByRule = (r, opts) =>
    defaultValueProcessorByRule(r, opts);

  // handles escapeQuotes correctly
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(`(f1 = 'v''1')`);
  // handles escapeQuotes exactly the same as defaultValueProcessorByRule
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(formatQuery(queryForNewValueProcessor, 'sql'));
});

it('handles quoteFieldNamesWith correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: 'Guitar, Vocals', operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
      { field: 'lastName', value: 'firstName', operator: '!=', valueSource: 'field' },
    ],
    not: false,
  };

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
    "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai' and `lastName` != `firstName`)"
  );

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: ['[', ']'] })).toBe(
    "([instrument] in ('Guitar', 'Vocals') and [lastName] = 'Vai' and [lastName] != [firstName])"
  );
});

it('handles custom fallbackExpression correctly', () => {
  const fallbackExpression = 'fallbackExpression';
  const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };

  expect(formatQuery(queryToTest, { format: 'sql', fallbackExpression })).toBe(fallbackExpression);
});

it('handles json_without_ids correctly', () => {
  const queryToTest: RuleGroupType & { extraProperty: string } = {
    id: 'root',
    combinator: 'and',
    rules: [{ field: 'firstName', value: '', operator: 'null', valueSource: 'value' }],
    not: false,
    extraProperty: 'extraProperty',
  };
  const expectedResult = JSON.parse(
    '{"rules":[{"field":"firstName","value":"","operator":"null","valueSource":"value"}],"combinator":"and","not":false,"extraProperty":"extraProperty"}'
  );
  expect(JSON.parse(formatQuery(prepareRuleGroup(queryToTest), 'json_without_ids'))).toEqual(
    expectedResult
  );
});

it('uses paramPrefix correctly', () => {
  const queryToTest: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      { field: 'lastName', operator: 'in', value: 'Test1,Test2' },
      { field: 'age', operator: 'between', value: [26, 52] },
    ],
  };
  const sql = `(firstName = $firstName_1 and lastName in ($lastName_1, $lastName_2) and age between $age_1 and $age_2)`;
  const paramPrefix = '$';

  // Control (default) - param prefixes removed
  expect(formatQuery(queryToTest, { format: 'parameterized_named', paramPrefix })).toEqual({
    sql,
    params: {
      firstName_1: 'Test',
      lastName_1: 'Test1',
      lastName_2: 'Test2',
      age_1: 26,
      age_2: 52,
    },
  });

  // Experimental - param prefixes retained
  expect(
    formatQuery(queryToTest, {
      format: 'parameterized_named',
      paramPrefix,
      paramsKeepPrefix: true,
    })
  ).toEqual({
    sql,
    params: {
      [`${paramPrefix}firstName_1`]: 'Test',
      [`${paramPrefix}lastName_1`]: 'Test1',
      [`${paramPrefix}lastName_2`]: 'Test2',
      [`${paramPrefix}age_1`]: 26,
      [`${paramPrefix}age_2`]: 52,
    },
  });
});

describe('escapes quotes when appropriate', () => {
  const testQuerySQ: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `Te'st` }],
  };

  it(`escapes single quotes (if appropriate) for spel export`, () => {
    expect(formatQuery(testQuerySQ, 'spel')).toEqual(`f1 == 'Te\\'st'`);
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

  it('handles independent combinators for spel', () => {
    expect(formatQuery(queryIC, 'spel')).toBe(
      `firstName == 'Test' and middleName == 'Test' or lastName == 'Test'`
    );
  });
});

describe('validation', () => {
  describe('spel', () => {
    it('should invalidate a spel query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'spel', validator: () => false }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate a spel rule', () => {
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
          {
            format: 'spel',
            fields: [{ name: 'field', label: 'field', validator: () => false }],
          }
        )
      ).toBe("otherfield == ''");
    });

    it('should invalidate spel even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'spel',
            validator: () => false,
            fields: [{ name: 'field', label: 'field', validator: () => true }],
          }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate spel outermost group', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'spel', validator: () => ({ root: false }) }
        )
      ).toBe('1 == 1');
    });

    it('should invalidate spel inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          {
            format: 'spel',
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

  it('handles custom SpEL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSpEL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'spel', ruleProcessor })).toBe(
      "custom_operator and f2 == 'v2'"
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'spel', valueProcessor: ruleProcessor })
    ).toBe("custom_operator and f2 == 'v2'");
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

  it('parses numbers for spel', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'spel', parseNumbers: true })).toBe(
      "f > 'NaN' and f == 0 and f == 0 and f == 0 and (f < 1.5 or f > 1.5) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 1 or f == 2) and (f == 0 or f == 'abc' or f == 2) and (f >= 0 and f <= 1) and (f >= 0 and f <= 'abc') and (f >= '[object Object]' and f <= '[object Object]')"
    );
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
});
