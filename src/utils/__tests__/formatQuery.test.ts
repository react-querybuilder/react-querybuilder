import { formatQuery } from '..';
import { ParameterizedSQL, RuleGroupType, ValueProcessor } from '../../types';

const query: RuleGroupType = {
  id: 'g-root',
  rules: [
    {
      field: 'firstName',
      value: '',
      operator: 'null'
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull'
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'in'
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn'
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in'
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'between'
    },
    {
      field: 'firstName',
      value: ['Test', 'This'],
      operator: 'between'
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notBetween'
    },
    {
      field: 'firstName',
      value: 'MissingComma',
      operator: 'between'
    },
    {
      field: 'age',
      value: '26',
      operator: '='
    },
    {
      field: 'isMusician',
      value: true,
      operator: '='
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'gender',
          value: 'M',
          operator: '='
        },
        {
          field: 'job',
          value: 'Programmer',
          operator: '!='
        },
        {
          field: 'email',
          value: '@',
          operator: 'contains'
        }
      ],
      not: true
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        {
          field: 'lastName',
          value: 'ab',
          operator: 'doesNotContain'
        },
        {
          field: 'job',
          value: 'Prog',
          operator: 'beginsWith'
        },
        {
          field: 'email',
          value: 'com',
          operator: 'endsWith'
        },
        {
          field: 'job',
          value: 'Man',
          operator: 'doesNotBeginWith'
        },
        {
          field: 'email',
          value: 'fr',
          operator: 'doesNotEndWith'
        }
      ],
      not: false
    }
  ],
  combinator: 'and',
  not: false
};
const mongoQuery: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    {
      field: 'invalid',
      value: '',
      operator: 'invalid'
    },
    {
      field: 'firstName',
      value: '',
      operator: 'null'
    },
    {
      field: 'lastName',
      value: '',
      operator: 'notNull'
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'in'
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notIn'
    },
    {
      field: 'firstName',
      value: false,
      operator: 'in'
    },
    {
      field: 'firstName',
      value: 'Test,This',
      operator: 'between'
    },
    {
      field: 'firstName',
      value: ['Test', 'This'],
      operator: 'between'
    },
    {
      field: 'lastName',
      value: 'Test,This',
      operator: 'notBetween'
    },
    {
      field: 'firstName',
      value: '',
      operator: 'between'
    },
    {
      field: 'firstName',
      value: false,
      operator: 'between'
    },
    {
      field: 'age',
      value: '26',
      operator: '='
    },
    {
      field: 'isMusician',
      value: true,
      operator: '='
    },
    {
      field: 'email',
      value: '@',
      operator: 'contains'
    },
    {
      field: 'email',
      value: 'ab',
      operator: 'beginsWith'
    },
    {
      field: 'email',
      value: 'com',
      operator: 'endsWith'
    },
    {
      field: 'hello',
      value: 'com',
      operator: 'doesNotContain'
    },
    {
      field: 'job',
      value: 'Man',
      operator: 'doesNotBeginWith'
    },
    {
      field: 'job',
      value: 'ger',
      operator: 'doesNotEndWith'
    },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        {
          field: 'job',
          value: 'Sales Executive',
          operator: '='
        }
      ],
      not: false
    }
  ],
  not: false
};

const sqlString = `(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age = '26' and isMusician = TRUE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))`;
const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and firstName between ? and ? and lastName not between ? and ? and age = ? and isMusician = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
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
  '26',
  true,
  'M',
  'Programmer',
  '%@%',
  '%ab%',
  'Prog%',
  '%com',
  'Man%',
  '%fr'
];
const mongoQueryString =
  '{$and:[{firstName:null},{lastName:{$ne:null}},{firstName:{$in:["Test","This"]}},{lastName:{$nin:["Test","This"]}},{$and:[{firstName:{$gte:"Test"}},{firstName:{$lte:"This"}}]},{$and:[{firstName:{$gte:"Test"}},{firstName:{$lte:"This"}}]},{$or:[{lastName:{$lt:"Test"}},{lastName:{$gt:"This"}}]},{age:{$eq:"26"}},{isMusician:{$eq:true}},{email:/@/},{email:/^ab/},{email:/com$/},{hello:{$not:/com/}},{job:{$not:/^Man/}},{job:{$not:/ger$/}},{$or:[{job:{$eq:"Sales Executive"}}]}]}';

describe('formatQuery', () => {
  it('formats JSON correctly', () => {
    expect(formatQuery(query)).toBe(JSON.stringify(query, null, 2));
    expect(formatQuery(query, {})).toBe(JSON.stringify(query, null, 2));
    expect(formatQuery(query, 'json')).toBe(JSON.stringify(query, null, 2));
  });

  it('formats SQL correctly', () => {
    expect(formatQuery(query, 'sql')).toBe(sqlString);
  });

  it('formats parameterized SQL correctly', () => {
    const parameterized = formatQuery(query, 'parameterized') as ParameterizedSQL;
    expect(parameterized).toHaveProperty('sql', parameterizedSQLString);
    expect(parameterized).toHaveProperty('params');
    expect(parameterized.params).toEqual(params);
  });

  it('formats to mongo query correctly', () => {
    expect(formatQuery(mongoQuery, 'mongodb')).toBe(mongoQueryString);
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
          operator: 'in'
        },
        {
          field: 'lastName',
          value: 'Vai',
          operator: '='
        }
      ],
      not: false
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
          operator: 'in'
        },
        {
          field: 'lastName',
          value: 'Vai',
          operator: '='
        }
      ],
      not: false
    };

    expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
      "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai')"
    );
  });

  it('handles custom fallbackExpression correctly', () => {
    const queryToTest: RuleGroupType = {
      id: 'g-root',
      combinator: 'and',
      rules: []
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
          operator: 'null'
        }
      ],
      not: false
    };
    const expectedResult =
      '{"rules":[{"field":"firstName","value":"","operator":"null"}],"combinator":"and","not":false}';
    expect(formatQuery(queryToTest, 'json_without_ids')).toBe(expectedResult);
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
            fields: [{ name: 'field', validator: () => true }]
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
              { field: 'field2', operator: '=', value: '' }
            ]
          },
          {
            format: 'sql',
            fields: [
              { name: 'field', validator: () => false },
              { name: 'field3', validator: () => false }
            ]
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
              { id: 'f2', field: 'field2', operator: '=', value: '' }
            ]
          },
          {
            format: 'sql',
            validator: () => ({ f1: false })
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
            rules: []
          },
          {
            format: 'sql',
            validator: () => ({ root: false })
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
            rules: [{ id: 'inner', combinator: 'and', rules: [] }]
          },
          {
            format: 'sql',
            validator: () => ({ inner: false })
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
              { id: 'inner', combinator: 'and', rules: [] }
            ]
          },
          'sql'
        )
      ).toBe(`(field = '' and (1 = 1))`);
    });

    it('should invalidate parameterized rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'field2', operator: '=', value: '' }
            ]
          },
          {
            format: 'parameterized',
            fields: [{ name: 'field', validator: () => false }]
          }
        )
      ).toEqual({ sql: `(field2 = ?)`, params: [''] } as ParameterizedSQL);
    });

    it('should invalidate parameterized', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'parameterized', validator: () => false }
        )
      ).toEqual({ sql: '(1 = 1)', params: [] } as ParameterizedSQL);
    });

    it('should invalidate a mongob query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'mongodb', validator: () => false }
        )
      ).toBe('{$and:[{$expr:true}]}');
    });

    it('should invalidate a mongob rule', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [{ field: 'field', operator: '=', value: '' }] },
          { format: 'mongodb', fields: [{ name: 'field', validator: () => false }] }
        )
      ).toBe('{$and:[{field:{$eq:""}}]}');
    });

    it('should invalidate mongoedb even if fields are valid', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [{ field: 'field', operator: '=', value: '' }] },
          {
            format: 'mongodb',
            validator: () => false,
            fields: [{ name: 'field', validator: () => true }]
          }
        )
      ).toBe('{$and:[{$expr:true}]}');
    });

    it('should invalidate mongodb outermost group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: []
          },
          {
            format: 'mongodb',
            validator: () => ({ root: false })
          }
        )
      ).toBe('{$and:[{$expr:true}]}');
    });

    it('should invalidate mongodb inner group', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ id: 'inner', combinator: 'and', rules: [] }]
          },
          {
            format: 'mongodb',
            validator: () => ({ inner: false })
          }
        )
      ).toBe('{$and:[{$expr:true}]}');
    });
  });
});
