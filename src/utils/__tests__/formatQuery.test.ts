import { formatQuery } from '..';
import { RuleGroupType, ValueProcessor } from '../../types';

// Utility type from https://github.com/typeorm/typeorm/blob/master/src/common/DeepPartial.ts
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T[P] extends ReadonlyArray<infer U>
    ? ReadonlyArray<DeepPartial<U>>
    : DeepPartial<T[P]> | T[P];
};

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

const sqlString = `(firstName is null and lastName is not null and firstName in ('Test', 'This') and lastName not in ('Test', 'This') and firstName between 'Test' and 'This' and lastName not between 'Test' and 'This' and age = '26' and isMusician = TRUE and NOT (gender = 'M' or job != 'Programmer' or email like '%@%') and (lastName not like '%ab%' or job like 'Prog%' or email like '%com' or job not like 'Man%' or email not like '%fr'))`;
const parameterizedSQLString =
  '(firstName is null and lastName is not null and firstName in (?, ?) and lastName not in (?, ?) and firstName between ? and ? and lastName not between ? and ? and age = ? and isMusician = ? and NOT (gender = ? or job != ? or email like ?) and (lastName not like ? or job like ? or email like ? or job not like ? or email not like ?))';
const params = [
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  'Test',
  'This',
  '26',
  'TRUE',
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
  '{$and:[{firstName:null},{lastName:{$ne:null}},{firstName:{$in:["Test","This"]}},{lastName:{$nin:["Test","This"]}},{$and:[{firstName:{$gte:"Test"}},{firstName:{$lte:"This"}}]},{$or:[{lastName:{$lt:"Test"}},{lastName:{$gt:"This"}}]},{age:{$eq:"26"}},{isMusician:{$eq:true}},{email:/@/},{email:/^ab/},{email:/com$/},{hello:{$not:/com/}},{job:{$not:/^Man/}},{job:{$not:/ger$/}},{$or:[{job:{$eq:"Sales Executive"}}]}]}';

describe('formatQuery', () => {
  it('formats JSON correctly', () => {
    expect(formatQuery(query)).toBe(JSON.stringify(query, null, 2));
    expect(formatQuery(query, 'json')).toBe(JSON.stringify(query, null, 2));
  });

  it('formats SQL correctly', () => {
    expect(formatQuery(query, 'sql')).toBe(sqlString);
  });

  it('formats parameterized SQL correctly', () => {
    const parameterized = formatQuery(query, 'parameterized') as { sql: string; params: string[] };
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
    const queryWithArrayValue: RuleGroupType = {
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

    expect(formatQuery(queryWithArrayValue, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
      "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai')"
    );
  });

  it('handles json_without_ids correctly', () => {
    const example_without_ids: DeepPartial<RuleGroupType> = {
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
          combinator: 'or',
          not: true
        },
        {
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
          combinator: 'or',
          not: false
        }
      ],
      combinator: 'and',
      not: false
    };
    expect(formatQuery(query, 'json_without_ids')).toBe(JSON.stringify(example_without_ids));
  });
});
