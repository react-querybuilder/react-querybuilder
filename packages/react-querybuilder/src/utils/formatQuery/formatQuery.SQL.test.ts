import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../defaults';
import type {
  ParameterizedNamedSQL,
  ParameterizedSQL,
  RuleGroupType,
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  query,
  queryForNumberParsing,
  queryForRuleProcessor,
  queryForXor,
  queryIC,
  queryWithValueSourceField,
} from './formatQueryTestUtils';
import { defaultValueProcessor, defaultValueProcessorByRule } from './index';
import { defaultRuleProcessorParameterized } from './defaultRuleProcessorParameterized';

export const sqlString =
  "(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age between '12' and '14' and age = '26' and isMusician = TRUE and isLucky = FALSE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))";
export const sqlStringForValueSourceField =
  "(firstName is null and lastName is not null and firstName in (middleName, lastName) and lastName not in (middleName, lastName) and firstName between middleName and lastName and firstName between middleName and lastName and lastName not between middleName and lastName and age = iq and isMusician = isCreative and NOT (gender = someLetter or job != isBetweenJobs or email like '%' || atSign || '%') and (lastName not like '%' || firstName || '%' or job like jobPrefix || '%' or email like '%' || dotCom or job not like hasNoJob || '%' or email not like '%' || isInvalid))";
export const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and firstName between ? and ? and lastName not between ? and ? and age between ? and ? and age = ? and isMusician = ? and isLucky = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
export const parameterizedNamedSQLString =
  '(firstName is null and lastName is not null and firstName in (:firstName_1, :firstName_2) and lastName not in (:lastName_1, :lastName_2) and firstName between :firstName_3 and :firstName_4 and firstName between :firstName_5 and :firstName_6 and lastName not between :lastName_3 and :lastName_4 and age between :age_1 and :age_2 and age = :age_3 and isMusician = :isMusician_1 and isLucky = :isLucky_1 and NOT (gender = :gender_1 or job != :job_1 or email like :email_1) and (lastName not like :lastName_5 or job like :job_2 or email like :email_2 or job not like :job_3 or email not like :email_3))';
export const params = [
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  '12',
  '14',
  '26',
  true,
  false,
  'M',
  'Programmer',
  '%@%',
  '%ab%',
  'Prog%',
  '%com',
  'Man%',
  '%fr',
];
export const params_named = {
  firstName_1: 'Test',
  firstName_2: 'This',
  lastName_1: 'Test',
  lastName_2: 'This',
  firstName_3: 'Test',
  firstName_4: 'This',
  firstName_5: 'Test',
  firstName_6: 'This',
  lastName_3: 'Test',
  lastName_4: 'This',
  age_1: '12',
  age_2: '14',
  age_3: '26',
  isMusician_1: true,
  isLucky_1: false,
  gender_1: 'M',
  job_1: 'Programmer',
  email_1: '%@%',
  lastName_5: '%ab%',
  job_2: 'Prog%',
  email_2: '%com',
  job_3: 'Man%',
  email_3: '%fr',
};

it('formats SQL correctly', () => {
  expect(formatQuery(query, 'sql')).toBe(sqlString);
  expect(formatQuery(queryWithValueSourceField, 'sql')).toBe(sqlStringForValueSourceField);
  expect(formatQuery(query, { format: 'sql', valueProcessor: defaultValueProcessor })).toBe(
    sqlString
  );
});

it('formats parameterized SQL correctly', () => {
  expect(formatQuery(query, 'parameterized')).toEqual({
    sql: parameterizedSQLString,
    params: params,
  });
  expect(formatQuery(queryWithValueSourceField, 'parameterized')).toEqual({
    sql: sqlStringForValueSourceField,
    params: [],
  });
});

it('formats parameterized named SQL correctly', () => {
  expect(formatQuery(query, 'parameterized_named')).toEqual({
    sql: parameterizedNamedSQLString,
    params: params_named,
  });
  expect(formatQuery(queryWithValueSourceField, 'parameterized_named')).toEqual({
    sql: sqlStringForValueSourceField,
    params: {},
  });
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

it('handles numberedParams correctly', () => {
  const queryToTestNumberedParams: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'lastName', operator: 'in', value: 'Test1,Test2' },
      { field: 'firstName', operator: '=', value: 'Test' },
      { field: 'age', operator: 'between', value: [26, 52] },
      {
        combinator: 'or',
        rules: [
          { field: 'firstName', operator: '!=', value: 'Test' },
          { field: 'lastName', operator: 'notIn', value: 'Test1,Test2' },
          { field: 'age', operator: 'notBetween', value: [26, 52] },
        ],
      },
    ],
  };
  const sqlNumberedParams = `(lastName in (:1, :2) and firstName = :3 and age between :4 and :5 and (firstName != :6 or lastName not in (:7, :8) or age not between :9 and :10))`;

  expect(
    formatQuery(queryToTestNumberedParams, { format: 'parameterized', numberedParams: true })
  ).toEqual({
    sql: sqlNumberedParams,
    params: ['Test1', 'Test2', 'Test', 26, 52, 'Test', 'Test1', 'Test2', 26, 52],
  });

  const queryToTestNPaltPrefix: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      { field: 'lastName', operator: 'in', value: 'Test1,Test2' },
    ],
  };
  const sqlNPaltPrefix = `(firstName = $1 and lastName in ($2, $3))`;

  // Custom param prefixes
  expect(
    formatQuery(queryToTestNPaltPrefix, {
      format: 'parameterized',
      paramPrefix: '$',
      numberedParams: true,
    })
  ).toEqual({
    sql: sqlNPaltPrefix,
    params: ['Test', 'Test1', 'Test2'],
  });
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

  // Param prefixes retained
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

  for (const attempt of [
    { fmt: 'sql', result: `(f1 = 'Te''st')` },
    { fmt: 'parameterized', result: { sql: `(f1 = ?)`, params: [`Te'st`] } },
    { fmt: 'parameterized_named', result: { sql: `(f1 = :f1_1)`, params: { f1_1: `Te'st` } } },
  ]) {
    it(`escapes single quotes (if appropriate) for ${attempt.fmt} export`, () => {
      // @ts-expect-error Conflicting formatQuery overloads
      expect(formatQuery(testQuerySQ, attempt.fmt)).toEqual(attempt.result);
    });
  }
});

describe('independent combinators', () => {
  it('handles independent combinators for sql', () => {
    expect(formatQuery(queryIC, 'sql')).toBe(
      `(firstName = 'Test' and middleName = 'Test' or lastName = 'Test')`
    );
  });

  it('handles independent combinators for parameterized', () => {
    expect(formatQuery(queryIC, 'parameterized')).toEqual({
      sql: `(firstName = ? and middleName = ? or lastName = ?)`,
      params: ['Test', 'Test', 'Test'],
    });
  });

  it('handles independent combinators for parameterized_named', () => {
    expect(formatQuery(queryIC, 'parameterized_named')).toEqual({
      sql: `(firstName = :firstName_1 and middleName = :middleName_1 or lastName = :lastName_1)`,
      params: { firstName_1: 'Test', middleName_1: 'Test', lastName_1: 'Test' },
    });
  });
});

describe('validation', () => {
  describe('sql', () => {
    const validationResults: Record<string, string> = {
      'should invalidate sql': '(1 = 1)',
      'should invalidate sql even if fields are valid': '(1 = 1)',
      'should invalidate sql rule by validator function': `(field2 = '')`,
      'should invalidate sql rule specified by validationMap': `(field2 = '')`,
      'should invalidate sql outermost group': '(1 = 1)',
      'should invalidate sql inner group': '((1 = 1))',
      'should convert sql inner group with no rules to fallbackExpression': `(field = '' and (1 = 1))`,
    };

    for (const vtd of getValidationTestData('sql')) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toBe(validationResults[vtd.title]);
      });
    }
  });

  describe('parameterized', () => {
    const validationResults: Record<string, ParameterizedSQL> = {
      'should invalidate parameterized': { sql: '(1 = 1)', params: [] },
      'should invalidate parameterized even if fields are valid': { sql: '(1 = 1)', params: [] },
      'should invalidate parameterized rule by validator function': {
        sql: '(field2 = ?)',
        params: [''],
      },
      'should invalidate parameterized rule specified by validationMap': {
        sql: '(field2 = ?)',
        params: [''],
      },
      'should invalidate parameterized outermost group': { sql: '(1 = 1)', params: [] },
      'should invalidate parameterized inner group': { sql: '((1 = 1))', params: [] },
      'should convert parameterized inner group with no rules to fallbackExpression': {
        sql: '(field = ? and (1 = 1))',
        params: [''],
      },
    };

    for (const vtd of getValidationTestData('parameterized')) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
      });
    }
  });

  describe('parameterized_named', () => {
    const validationResults: Record<string, ParameterizedNamedSQL> = {
      'should invalidate parameterized_named': { sql: '(1 = 1)', params: {} },
      'should invalidate parameterized_named even if fields are valid': {
        sql: '(1 = 1)',
        params: {},
      },
      'should invalidate parameterized_named rule by validator function': {
        sql: '(field2 = :field2_1)',
        params: { field2_1: '' },
      },
      'should invalidate parameterized_named rule specified by validationMap': {
        sql: '(field2 = :field2_1)',
        params: { field2_1: '' },
      },
      'should invalidate parameterized_named outermost group': { sql: '(1 = 1)', params: {} },
      'should invalidate parameterized_named inner group': { sql: '((1 = 1))', params: {} },
      'should convert parameterized_named inner group with no rules to fallbackExpression': {
        sql: '(field = :field_1 and (1 = 1))',
        params: { field_1: '' },
      },
    };

    for (const vtd of getValidationTestData('parameterized_named')) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
      });
    }
  });
});

describe('ruleProcessor', () => {
  describe('sql', () => {
    it('handles custom rule processor', () => {
      const ruleProcessor: RuleProcessor = r =>
        r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSQL(r);
      expect(formatQuery(queryForRuleProcessor, { format: 'sql', ruleProcessor })).toBe(
        "(custom_operator and f2 = 'v2')"
      );
    });
  });

  describe('parameterized', () => {
    it('handles custom rule processor', () => {
      const ruleProcessor: RuleProcessor = (r, opts) =>
        r.operator === 'custom_operator'
          ? { sql: r.operator, params: [] }
          : defaultRuleProcessorParameterized(r, opts);
      expect(
        formatQuery(queryForRuleProcessor, { format: 'parameterized', ruleProcessor })
      ).toEqual({ sql: '(custom_operator and f2 = ?)', params: ['v2'] });
    });

    it('handles invalid custom rule processor', () => {
      const ruleProcessor: RuleProcessor = () => 'invalid';
      expect(
        formatQuery(queryForRuleProcessor, { format: 'parameterized', ruleProcessor })
      ).toEqual({ sql: '()', params: [] }); // Is '()' right/acceptable?
    });
  });

  describe('parameterized_named', () => {
    it('handles custom rule processor with custom param names', () => {
      const ruleProcessor: RuleProcessor = (r, opts) =>
        r.operator === 'custom_operator'
          ? {
              sql: `test ${r.operator} = ${opts?.paramPrefix}custom_param`,
              params: { custom_param: 'v2' },
            }
          : defaultRuleProcessorParameterized(r, opts);
      expect(
        formatQuery(queryForRuleProcessor, { format: 'parameterized_named', ruleProcessor })
      ).toEqual({
        sql: '(test custom_operator = :custom_param and f2 = :f2_1)',
        params: { custom_param: 'v2', f2_1: 'v2' },
      });
    });

    it('handles invalid custom rule processor', () => {
      const ruleProcessor: RuleProcessor = () => 'invalid';
      expect(
        formatQuery(queryForRuleProcessor, { format: 'parameterized_named', ruleProcessor })
      ).toEqual({ sql: '()', params: {} }); // Is '()' right/acceptable?
    });
  });
});

describe('parseNumbers', () => {
  it('parses numbers for sql', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'sql', parseNumbers: true })).toBe(
      "(f > 'NaN' and f = 0 and f = 0 and f = 0 and (f < 1.5 or f > 1.5) and f in (0, 1, 2) and f in (0, 1, 2) and f in (0, 'abc', 2) and f between 0 and 1 and f between 0 and 1 and f between '0' and 'abc' and f between '[object Object]' and '[object Object]')"
    );
  });

  it('parses numbers for parameterized', () => {
    expect(
      formatQuery(queryForNumberParsing, { format: 'parameterized', parseNumbers: true })
    ).toHaveProperty('params', [
      'NaN',
      0,
      0,
      0,
      1.5,
      1.5,
      0,
      1,
      2,
      0,
      1,
      2,
      0,
      'abc',
      2,
      0,
      1,
      0,
      1,
      0,
      'abc',
      {},
      {},
    ]);
  });

  it('parses numbers for parameterized_named', () => {
    expect(
      formatQuery(queryForNumberParsing, { format: 'parameterized_named', parseNumbers: true })
    ).toHaveProperty('params', {
      f_1: 'NaN',
      f_2: 0,
      f_3: 0,
      f_4: 0,
      f_5: 1.5,
      f_6: 1.5,
      f_7: 0,
      f_8: 1,
      f_9: 2,
      f_10: 0,
      f_11: 1,
      f_12: 2,
      f_13: 0,
      f_14: 'abc',
      f_15: 2,
      f_16: 0,
      f_17: 1,
      f_18: 0,
      f_19: 1,
      f_20: 0,
      f_21: 'abc',
      f_22: {},
      f_23: {},
    });
  });
});

describe('placeholder names', () => {
  const placeholderFieldName = 'placeholderFieldName';
  const placeholderOperatorName = 'placeholderOperatorName';

  const queryForPlaceholders: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'v1' },
      { field: placeholderFieldName, operator: '=', value: 'v2' },
      { field: 'f3', operator: placeholderOperatorName, value: 'v3' },
      { field: placeholderFieldName, operator: placeholderOperatorName, value: 'v4' },
    ],
  };

  it('respects custom placeholder names', () => {
    expect(
      formatQuery(queryForPlaceholders, {
        format: 'sql',
        placeholderFieldName,
        placeholderOperatorName,
      })
    ).toBe(`(${defaultFieldPlaceholder} ${defaultOperatorPlaceholder} 'v1')`);
  });
});

describe('non-standard combinators', () => {
  it('handles XOR operator', () => {
    expect(formatQuery(queryForXor, 'sql')).toBe(`(f1 = 'v1' xor f2 = 'v2')`);
  });
});
