import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../defaults';
import type {
  RuleGroupType,
  RuleGroupTypeIC,
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { convertToIC } from '../convertQuery';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { defaultRuleProcessorSQL } from './defaultRuleProcessorSQL';
import { formatQuery } from './formatQuery';
import {
  parameterizedNamedSQLString,
  parameterizedSQLString,
  params,
  params_named,
  query,
  queryWithValueSourceField,
  sqlString,
  sqlStringForValueSourceField,
} from './formatQueryTestUtils';
import { defaultValueProcessor, defaultValueProcessorByRule } from './index';
import { quoteFieldNamesWithArray } from './utils';

it('formats JSON correctly', () => {
  expect(formatQuery(query)).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, {})).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(query, 'json')).toBe(JSON.stringify(query, null, 2));
  expect(formatQuery(queryWithValueSourceField)).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, {})).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
  expect(formatQuery(queryWithValueSourceField, 'json')).toBe(
    JSON.stringify(queryWithValueSourceField, null, 2)
  );
});

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
  const queryIC: RuleGroupTypeIC = {
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'middleName', operator: '=', value: 'Test' },
      'or',
      { field: 'lastName', operator: '=', value: 'Test' },
    ],
  };

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
    it('should invalidate sql', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'sql', validator: () => false }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'sql',
            validator: () => false,
            fields: [{ name: 'field', label: 'field', validator: () => true }],
          }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql rule by validator function', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'field2', operator: '=', value: '' },
            ],
          },
          {
            format: 'sql',
            fields: [
              { name: 'field', label: 'field', validator: () => false },
              { name: 'field3', label: 'field3', validator: () => false },
            ],
          }
        )
      ).toBe(`(field2 = '')`);
    });

    it('should invalidate sql rule specified by validationMap', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { id: 'f1', field: 'field', operator: '=', value: '' },
              { id: 'f2', field: 'field2', operator: '=', value: '' },
            ],
          },
          { format: 'sql', validator: () => ({ f1: false }) }
        )
      ).toBe(`(field2 = '')`);
    });

    it('should invalidate sql outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [],
          },
          { format: 'sql', validator: () => ({ root: false }) }
        )
      ).toBe('(1 = 1)');
    });

    it('should invalidate sql inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }],
          },
          { format: 'sql', validator: () => ({ inner: false }) }
        )
      ).toBe('()');
    });

    it('should convert sql inner group with no rules to (1 = 1)', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { id: 'inner', combinator: 'and', rules: [] },
            ],
          },
          'sql'
        )
      ).toBe(`(field = '' and (1 = 1))`);
    });
  });

  describe('parameterized', () => {
    it('should invalidate parameterized rule', () => {
      const queryToTest: RuleGroupType = {
        id: 'root',
        combinator: 'and',
        rules: [
          { id: 'r1', field: 'field', operator: '=', value: '' },
          { id: 'r2', field: 'field2', operator: '=', value: '' },
        ],
      };
      const fields = [{ name: 'field', label: 'field', validator: () => false }];
      expect(formatQuery(queryToTest, { format: 'parameterized', fields })).toEqual({
        sql: `(field2 = ?)`,
        params: [''],
      });
      expect(formatQuery(queryToTest, { format: 'parameterized_named', fields })).toEqual({
        sql: '(field2 = :field2_1)',
        params: { field2_1: '' },
      });
    });

    it('should invalidate parameterized', () => {
      const queryToTest: RuleGroupType = { id: 'root', combinator: 'and', rules: [] };
      expect(formatQuery(queryToTest, { format: 'parameterized' })).toEqual({
        sql: '(1 = 1)',
        params: [],
      });
      expect(
        formatQuery(
          {
            ...queryToTest,
            rules: [
              { field: 'f1', operator: '=', value: 'v1' },
              { ...queryToTest, id: 'not_root' },
            ],
          },
          { format: 'parameterized', validator: () => ({ not_root: false }) }
        )
      ).toEqual({ sql: '(f1 = ?)', params: ['v1'] });
      expect(formatQuery(queryToTest, { format: 'parameterized', validator: () => false })).toEqual(
        {
          sql: '(1 = 1)',
          params: [],
        }
      );
      expect(
        formatQuery(queryToTest, { format: 'parameterized', validator: () => ({ root: false }) })
      ).toEqual({
        sql: '(1 = 1)',
        params: [],
      });
      expect(
        formatQuery(queryToTest, { format: 'parameterized_named', validator: () => false })
      ).toEqual({ sql: '(1 = 1)', params: {} });
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

  it('handles custom SQL rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorSQL(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'sql', ruleProcessor })).toBe(
      "(custom_operator and f2 = 'v2')"
    );
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

  it('parses numbers for json', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'json', parseNumbers: true })).toBe(
      `{
  "combinator": "and",
  "rules": [
    {
      "field": "f",
      "operator": ">",
      "value": "NaN"
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "field": "f",
      "operator": "=",
      "value": 0
    },
    {
      "combinator": "or",
      "rules": [
        {
          "field": "f",
          "operator": "<",
          "value": 1.5
        },
        {
          "field": "f",
          "operator": ">",
          "value": 1.5
        }
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": "0, 1, 2"
    },
    {
      "field": "f",
      "operator": "in",
      "value": [
        0,
        1,
        2
      ]
    },
    {
      "field": "f",
      "operator": "in",
      "value": "0, abc, 2"
    },
    {
      "field": "f",
      "operator": "between",
      "value": "0, 1"
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        0,
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": "0, abc"
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": 1
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        1
      ]
    },
    {
      "field": "f",
      "operator": "between",
      "value": [
        {},
        {}
      ]
    }
  ]
}`
    );
  });

  it('parses numbers for json_without_ids', () => {
    expect(
      JSON.parse(
        formatQuery(prepareRuleGroup(queryForNumberParsing), {
          format: 'json_without_ids',
          parseNumbers: true,
        })
      )
    ).toEqual(
      JSON.parse(
        '{"rules":[{"field":"f","value":"NaN","operator":">"},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"field":"f","value":0,"operator":"="},{"rules":[{"field":"f","value":1.5,"operator":"<"},{"field":"f","value":1.5,"operator":">"}],"combinator":"or"},{"field":"f","value":"0, 1, 2","operator":"in"},{"field":"f","value":[0,1,2],"operator":"in"},{"field":"f","value":"0, abc, 2","operator":"in"},{"field":"f","value":"0, 1","operator":"between"},{"field":"f","value":[0,1],"operator":"between"},{"field":"f","value":"0, abc","operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":1,"operator":"between"},{"field":"f","value":[1],"operator":"between"},{"field":"f","value":[{},{}],"operator":"between"}],"combinator":"and"}'
      )
    );
  });

  it('parses numbers for json_without_ids with independentCombinators', () => {
    expect(
      JSON.parse(
        formatQuery(prepareRuleGroup(convertToIC(queryForNumberParsing)), {
          format: 'json_without_ids',
          parseNumbers: true,
        })
      )
    ).toEqual(
      JSON.parse(
        '{"rules":[{"field":"f","value":"NaN","operator":">"},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"field":"f","value":0,"operator":"="},"and",{"rules":[{"field":"f","value":1.5,"operator":"<"},"or",{"field":"f","value":1.5,"operator":">"}]},"and",{"field":"f","value":"0, 1, 2","operator":"in"},"and",{"field":"f","value":[0,1,2],"operator":"in"},"and",{"field":"f","value":"0, abc, 2","operator":"in"},"and",{"field":"f","value":"0, 1","operator":"between"},"and",{"field":"f","value":[0,1],"operator":"between"},"and",{"field":"f","value":"0, abc","operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":1,"operator":"between"},"and",{"field":"f","value":[1],"operator":"between"},"and",{"field":"f","value":[{},{}],"operator":"between"}]}'
      )
    );
  });

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
  const queryForXor: RuleGroupType = {
    combinator: 'xor',
    rules: [
      { field: 'f1', operator: '=', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles XOR operator', () => {
    expect(formatQuery(queryForXor, 'sql')).toBe(`(f1 = 'v1' xor f2 = 'v2')`);
  });
});

describe('misc', () => {
  it('quoteFieldNamesWithArray handles null', () => {
    expect(quoteFieldNamesWithArray(null)).toEqual(['', '']);
  });
});
