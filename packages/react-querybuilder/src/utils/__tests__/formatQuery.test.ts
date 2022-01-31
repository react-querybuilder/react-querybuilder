import type { RuleGroupType, ValueProcessor } from '../../types';
import { formatQuery } from '../formatQuery';

const query: RuleGroupType = {
  id: 'g-root',
  rules: [
    {
      field: 'firstName',
      value: '',
      operator: 'null',
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'in',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'between',
    },
    {
      field: 'firstName',
      value: ['Test', 'This'],
      operator: 'between',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notBetween',
    },
    {
      field: 'firstName',
      value: 'MissingComma',
      operator: 'between',
    },
    {
      field: 'age',
      value: '12,14',
      operator: 'between',
    },
    {
      field: 'age',
      value: '26',
      operator: '=',
    },
    {
      field: 'isMusician',
      value: true,
      operator: '=',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'gender',
          value: 'M',
          operator: '=',
        },
        {
          field: 'job',
          value: 'Programmer',
          operator: '!=',
        },
        {
          field: 'email',
          value: '@',
          operator: 'contains',
        },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        {
          field: 'lastName',
          value: 'ab',
          operator: 'doesNotContain',
        },
        {
          field: 'job',
          value: 'Prog',
          operator: 'beginsWith',
        },
        {
          field: 'email',
          value: 'com',
          operator: 'endsWith',
        },
        {
          field: 'job',
          value: 'Man',
          operator: 'doesNotBeginWith',
        },
        {
          field: 'email',
          value: 'fr',
          operator: 'doesNotEndWith',
        },
      ],
      not: false,
    },
  ],
  combinator: 'and',
  not: false,
};
const mongoQuery: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    {
      field: 'invalid',
      value: '',
      operator: 'invalid',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'null',
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'in',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in',
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'between',
    },
    {
      field: 'firstName',
      value: ['Test', 'This'],
      operator: 'between',
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notBetween',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'between',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'between',
    },
    {
      field: 'age',
      value: '12,14',
      operator: 'between',
    },
    {
      field: 'age',
      value: '26',
      operator: '=',
    },
    {
      field: 'isMusician',
      value: true,
      operator: '=',
    },
    {
      field: 'email',
      value: '@',
      operator: 'contains',
    },
    {
      field: 'email',
      value: 'ab',
      operator: 'beginsWith',
    },
    {
      field: 'email',
      value: 'com',
      operator: 'endsWith',
    },
    {
      field: 'hello',
      value: 'com',
      operator: 'doesNotContain',
    },
    {
      field: 'job',
      value: 'Man',
      operator: 'doesNotBeginWith',
    },
    {
      field: 'job',
      value: 'ger',
      operator: 'doesNotEndWith',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'job',
          value: 'Sales Executive',
          operator: '=',
        },
        {
          field: 'job',
          value: [],
          operator: 'in',
        },
        {
          field: 'job',
          value: ['just one value'],
          operator: 'between',
        },
      ],
      not: false,
    },
  ],
  not: false,
};
const queryWithValueSourceField: RuleGroupType = {
  combinator: 'and',
  rules: [
    {
      field: 'firstName',
      value: '',
      operator: 'null',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: 'middleName,lastName',
      operator: 'in',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: 'middleName,lastName',
      operator: 'notIn',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: 'middleName,lastName',
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: ['middleName', 'lastName'],
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: 'middleName,lastName',
      operator: 'notBetween',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: 'MissingComma',
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'age',
      value: 'iq',
      operator: '=',
      valueSource: 'field',
    },
    {
      field: 'isMusician',
      value: 'isCreative',
      operator: '=',
      valueSource: 'field',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'gender',
          value: 'someLetter',
          operator: '=',
          valueSource: 'field',
        },
        {
          field: 'job',
          value: 'isBetweenJobs',
          operator: '!=',
          valueSource: 'field',
        },
        {
          field: 'email',
          value: 'atSign',
          operator: 'contains',
          valueSource: 'field',
        },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        {
          field: 'lastName',
          value: 'firstName',
          operator: 'doesNotContain',
          valueSource: 'field',
        },
        {
          field: 'job',
          value: 'jobPrefix',
          operator: 'beginsWith',
          valueSource: 'field',
        },
        {
          field: 'email',
          value: 'dotCom',
          operator: 'endsWith',
          valueSource: 'field',
        },
        {
          field: 'job',
          value: 'hasNoJob',
          operator: 'doesNotBeginWith',
          valueSource: 'field',
        },
        {
          field: 'email',
          value: 'isInvalid',
          operator: 'doesNotEndWith',
          valueSource: 'field',
        },
      ],
      not: false,
    },
  ],
};
const mongoQueryWithValueSourceField: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    {
      field: 'invalid',
      value: '',
      operator: 'invalid',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'null',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: 'middleName,lastName',
      operator: 'in',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: 'middleName,lastName',
      operator: 'notIn',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: 'middleName,lastName',
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: ['middleName', 'lastName'],
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'lastName',
      value: 'middleName,lastName',
      operator: 'notBetween',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: '',
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'firstName',
      value: false,
      operator: 'between',
      valueSource: 'field',
    },
    {
      field: 'age',
      value: 'iq',
      operator: '=',
      valueSource: 'field',
    },
    {
      field: 'isMusician',
      value: 'isCreative',
      operator: '=',
      valueSource: 'field',
    },
    {
      field: 'email',
      value: 'atSign',
      operator: 'contains',
      valueSource: 'field',
    },
    {
      field: 'email',
      value: 'name',
      operator: 'beginsWith',
      valueSource: 'field',
    },
    {
      field: 'email',
      value: 'dotCom',
      operator: 'endsWith',
      valueSource: 'field',
    },
    {
      field: 'hello',
      value: 'dotCom',
      operator: 'doesNotContain',
      valueSource: 'field',
    },
    {
      field: 'job',
      value: 'noJob',
      operator: 'doesNotBeginWith',
      valueSource: 'field',
    },
    {
      field: 'job',
      value: 'noJob',
      operator: 'doesNotEndWith',
      valueSource: 'field',
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'job',
          value: 'executiveJobName',
          operator: '=',
          valueSource: 'field',
        },
      ],
      not: false,
    },
  ],
  not: false,
};

const sqlString =
  "(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age between '12' and '14' and age = '26' and isMusician = TRUE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))";
const sqlStringForValueSourceField =
  "(firstName is null and lastName is not null and firstName in (middleName, lastName) and lastName not in (middleName, lastName) and firstName between middleName and lastName and firstName between middleName and lastName and lastName not between middleName and lastName and age = iq and isMusician = isCreative and NOT (gender = someLetter or job != isBetweenJobs or email like '%' || atSign || '%') and (lastName not like '%' || firstName || '%' or job like jobPrefix || '%' or email like '%' || dotCom or job not like hasNoJob || '%' or email not like '%' || isInvalid))";
const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and firstName between ? and ? and lastName not between ? and ? and age between ? and ? and age = ? and isMusician = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
const parameterizedNamedSQLString =
  '(firstName is null and lastName is not null and firstName in (:firstName_1, :firstName_2) and lastName not in (:lastName_1, :lastName_2) and firstName between :firstName_3 and :firstName_4 and firstName between :firstName_5 and :firstName_6 and lastName not between :lastName_3 and :lastName_4 and age between :age_1 and :age_2 and age = :age_3 and isMusician = :isMusician_1 and NOT (gender = :gender_1 or job != :job_1 or email like :email_1) and (lastName not like :lastName_5 or job like :job_2 or email like :email_2 or job not like :job_3 or email not like :email_3))';
const params = [
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
  'M',
  'Programmer',
  '%@%',
  '%ab%',
  'Prog%',
  '%com',
  'Man%',
  '%fr',
];
const params_named = {
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
  gender_1: 'M',
  job_1: 'Programmer',
  email_1: '%@%',
  lastName_5: '%ab%',
  job_2: 'Prog%',
  email_2: '%com',
  job_3: 'Man%',
  email_3: '%fr',
};
const mongoQueryString =
  '{"$and":[{"firstName":null},{"lastName":{"$ne":null}},{"firstName":{"$in":["Test","This"]}},{"lastName":{"$nin":["Test","This"]}},{"$and":[{"firstName":{"$gte":"Test"}},{"firstName":{"$lte":"This"}}]},{"$and":[{"firstName":{"$gte":"Test"}},{"firstName":{"$lte":"This"}}]},{"$or":[{"lastName":{"$lt":"Test"}},{"lastName":{"$gt":"This"}}]},{"$and":[{"age":{"$gte":12}},{"age":{"$lte":14}}]},{"age":{"$eq":"26"}},{"isMusician":{"$eq":true}},{"email":{"$regex":"@"}},{"email":{"$regex":"^ab"}},{"email":{"$regex":"com$"}},{"hello":{"$not":{"$regex":"com"}}},{"job":{"$not":{"$regex":"^Man"}}},{"job":{"$not":{"$regex":"ger$"}}},{"$or":[{"job":{"$eq":"Sales Executive"}}]}]}';
const mongoQueryStringForValueSourceField =
  '{"$and":[{"firstName":null},{"lastName":{"$ne":null}},{"$where":"[this.middleName,this.lastName].includes(this.firstName)"},{"$where":"![this.middleName,this.lastName].includes(this.lastName)"},{"$and":[{"$expr":{"$gte":["$firstName","$middleName"]}},{"$expr":{"$lte":["$firstName","$lastName"]}}]},{"$and":[{"$expr":{"$gte":["$firstName","$middleName"]}},{"$expr":{"$lte":["$firstName","$lastName"]}}]},{"$or":[{"$expr":{"$lt":["$lastName","$middleName"]}},{"$expr":{"$gt":["$lastName","$lastName"]}}]},{"$expr":{"$eq":["$age","$iq"]}},{"$expr":{"$eq":["$isMusician","$isCreative"]}},{"$where":"this.email.includes(this.atSign)"},{"$where":"this.email.startsWith(this.name)"},{"$where":"this.email.endsWith(this.dotCom)"},{"$where":"!this.hello.includes(this.dotCom)"},{"$where":"!this.job.startsWith(this.noJob)"},{"$where":"!this.job.endsWith(this.noJob)"},{"$or":[{"$expr":{"$eq":["$job","$executiveJobName"]}}]}]}';

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

it('formats to mongo query correctly', () => {
  expect(formatQuery(mongoQuery, 'mongodb')).toBe(mongoQueryString);
  expect(formatQuery(mongoQueryWithValueSourceField, 'mongodb')).toBe(
    mongoQueryStringForValueSourceField
  );
});

it('handles invalid type correctly', () => {
  expect(formatQuery(query, 'null' as any)).toBe('');
});

it('handles custom valueProcessor correctly', () => {
  const queryWithArrayValue: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      {
        field: 'instrument',
        value: ['Guitar', 'Vocals'],
        operator: 'in',
      },
      {
        field: 'lastName',
        value: 'Vai',
        operator: '=',
      },
    ],
    not: false,
  };

  const valueProcessor: ValueProcessor = (_field, operator, value) => {
    if (operator === 'in') {
      return `(${value.map((v: string) => `'${v.trim()}'`).join(',')})`;
    } else {
      return `'${value}'`;
    }
  };

  expect(formatQuery(queryWithArrayValue, { format: 'sql', valueProcessor })).toBe(
    `(instrument in ('Guitar','Vocals') and lastName = 'Vai')`
  );
});

it('handles quoteFieldNamesWith correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      {
        field: 'instrument',
        value: 'Guitar, Vocals',
        operator: 'in',
      },
      {
        field: 'lastName',
        value: 'Vai',
        operator: '=',
      },
    ],
    not: false,
  };

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
    "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai')"
  );
});

it('handles custom fallbackExpression correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [],
  };

  expect(
    formatQuery(queryToTest, { format: 'sql', fallbackExpression: 'fallbackExpression' })
  ).toBe('fallbackExpression');
});

it('handles json_without_ids correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'root',
    combinator: 'and',
    rules: [
      {
        field: 'firstName',
        value: '',
        operator: 'null',
        valueSource: 'value',
      },
    ],
    not: false,
  };
  const expectedResult =
    '{"rules":[{"field":"firstName","value":"","operator":"null","valueSource":"value"}],"combinator":"and","not":false}';
  expect(formatQuery(queryToTest, 'json_without_ids')).toBe(expectedResult);
});

it('uses paramPrefix correctly', () => {
  const queryToTest: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'firstName', operator: '=', value: 'Test' }],
  };
  expect(formatQuery(queryToTest, { format: 'parameterized_named', paramPrefix: '$' })).toEqual({
    sql: '(firstName = $firstName_1)',
    params: { firstName_1: 'Test' },
  });
});

describe('independent combinators', () => {
  it('handles independent combinators', () => {
    expect(
      formatQuery(
        {
          rules: [
            { field: 'firstName', value: 'Test', operator: '=' },
            'and',
            { field: 'lastName', value: 'Test', operator: '=' },
          ],
        },
        'sql'
      )
    ).toBe(`(firstName = 'Test' and lastName = 'Test')`);
  });

  it('does not support independent combinators for mongodb', () => {
    expect(
      formatQuery(
        { id: 'root', rules: [{ field: 'firstName', value: 'Test', operator: '=' }] },
        'mongodb'
      )
    ).toBe('{"$and":[{"$expr":true}]}');
  });
});

describe('validation', () => {
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
        { id: 'root', combinator: 'and', rules: [{ field: 'field', operator: '=', value: '' }] },
        {
          format: 'sql',
          validator: () => false,
          fields: [{ name: 'field', validator: () => true }],
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
            { name: 'field', validator: () => false },
            { name: 'field3', validator: () => false },
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
        {
          format: 'sql',
          validator: () => ({ f1: false }),
        }
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
        {
          format: 'sql',
          validator: () => ({ root: false }),
        }
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
        {
          format: 'sql',
          validator: () => ({ inner: false }),
        }
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

  it('should invalidate parameterized rule', () => {
    const queryToTest: RuleGroupType = {
      id: 'root',
      combinator: 'and',
      rules: [
        { field: 'field', operator: '=', value: '' },
        { field: 'field2', operator: '=', value: '' },
      ],
    };
    const fields = [{ name: 'field', validator: () => false }];
    expect(
      formatQuery(queryToTest, {
        format: 'parameterized',
        fields,
      })
    ).toEqual({ sql: `(field2 = ?)`, params: [''] });
    expect(
      formatQuery(queryToTest, {
        format: 'parameterized_named',
        fields,
      })
    ).toEqual({ sql: '(field2 = :field2_1)', params: { field2_1: '' } });
  });

  it('should invalidate parameterized', () => {
    const queryToTest: RuleGroupType = { id: 'root', combinator: 'and', rules: [] };
    expect(formatQuery(queryToTest, { format: 'parameterized', validator: () => false })).toEqual({
      sql: '(1 = 1)',
      params: [],
    });
    expect(
      formatQuery(queryToTest, { format: 'parameterized_named', validator: () => false })
    ).toEqual({ sql: '(1 = 1)', params: {} });
  });

  it('should invalidate a mongob query', () => {
    expect(
      formatQuery(
        { id: 'root', combinator: 'and', rules: [] },
        { format: 'mongodb', validator: () => false }
      )
    ).toBe('{"$and":[{"$expr":true}]}');
  });

  it('should invalidate a mongob rule', () => {
    expect(
      formatQuery(
        { id: 'root', combinator: 'and', rules: [{ field: 'field', operator: '=', value: '' }] },
        { format: 'mongodb', fields: [{ name: 'field', validator: () => false }] }
      )
    ).toBe('{"$and":[{"field":{"$eq":""}}]}');
  });

  it('should invalidate mongoedb even if fields are valid', () => {
    expect(
      formatQuery(
        { id: 'root', combinator: 'and', rules: [{ field: 'field', operator: '=', value: '' }] },
        {
          format: 'mongodb',
          validator: () => false,
          fields: [{ name: 'field', validator: () => true }],
        }
      )
    ).toBe('{"$and":[{"$expr":true}]}');
  });

  it('should invalidate mongodb outermost group', () => {
    expect(
      formatQuery(
        {
          id: 'root',
          combinator: 'and',
          rules: [],
        },
        {
          format: 'mongodb',
          validator: () => ({ root: false }),
        }
      )
    ).toBe('{"$and":[{"$expr":true}]}');
  });

  it('should invalidate mongodb inner group', () => {
    expect(
      formatQuery(
        {
          id: 'root',
          combinator: 'and',
          rules: [{ id: 'inner', combinator: 'and', rules: [] }],
        },
        {
          format: 'mongodb',
          validator: () => ({ inner: false }),
        }
      )
    ).toBe('{"$and":[{"$expr":true}]}');
  });
});
