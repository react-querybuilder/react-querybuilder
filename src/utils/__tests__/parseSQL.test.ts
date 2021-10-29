import { DefaultRuleGroupType, DefaultRuleType } from '../../types';
import parseSQL from '../parseSQL';

const wrapRule = (rule?: DefaultRuleType): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : []
});

describe('parseSQL', () => {
  describe('ignored/missing WHERE clauses', () => {
    it('SELECT statement without WHERE clause', () => {
      expect(parseSQL('SELECT * FROM t')).toEqual(wrapRule());
    });
    it('SELECT statement with semicolon', () => {
      expect(parseSQL('SELECT * FROM t;')).toEqual(wrapRule());
    });
    it('SELECT statement with multiple fields and tables', () => {
      expect(
        parseSQL('SELECT t1.this, t2.that FROM t1 INNER JOIN t2 ON t1.this = t2.that;')
      ).toEqual(wrapRule());
    });
    it('invalid/complex clauses', () => {
      expect(parseSQL(`firstName = CASE x WHEN y THEN z ELSE a END`)).toEqual(wrapRule());
      expect(parseSQL(`firstName = someFunc('Steve', 'Vai')`)).toEqual(wrapRule());
      expect(parseSQL(`firstName IN (SELECT val FROM otherTable WHERE name = 'Steve')`)).toEqual(
        wrapRule()
      );
    });
    it('UNIONs', () => {
      expect(parseSQL(`SELECT * FROM t WHERE x = 1 UNION ALL SELECT * FROM u WHERE y = 2`)).toEqual(
        wrapRule()
      );
    });
  });

  describe('boolean operators', () => {
    it('basic comparisons of strings and numbers', () => {
      expect(parseSQL(`firstName = 'Steve'`)).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
      expect(parseSQL(`firstName != 'Steve'`)).toEqual(
        wrapRule({ field: 'firstName', operator: '!=', value: 'Steve' })
      );
      expect(parseSQL(`firstName <> 'Steve'`)).toEqual(
        wrapRule({ field: 'firstName', operator: '!=', value: 'Steve' })
      );
      expect(parseSQL(`age >= 14`)).toEqual(wrapRule({ field: 'age', operator: '>=', value: 14 }));
      expect(parseSQL(`age > 14`)).toEqual(wrapRule({ field: 'age', operator: '>', value: 14 }));
      expect(parseSQL(`age <= 14`)).toEqual(wrapRule({ field: 'age', operator: '<=', value: 14 }));
      expect(parseSQL(`age < 14`)).toEqual(wrapRule({ field: 'age', operator: '<', value: 14 }));
    });
    it('reversed identifier and value', () => {
      expect(parseSQL(`'Steve' = firstName`)).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
    });
    it('booleans', () => {
      expect(parseSQL(`isMusician = TRUE`)).toEqual(
        wrapRule({ field: 'isMusician', operator: '=', value: true })
      );
      expect(parseSQL(`isMusician = FALSE`)).toEqual(
        wrapRule({ field: 'isMusician', operator: '=', value: false })
      );
    });
    it('quoted field names', () => {
      expect(parseSQL('`isMusician` = TRUE')).toEqual(
        wrapRule({ field: 'isMusician', operator: '=', value: true })
      );
    });
    it('null/notNull', () => {
      expect(parseSQL(`firstName is null`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'null', value: null })
      );
      expect(parseSQL(`firstName is not null`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'notNull', value: null })
      );
    });
    it('in/notIn', () => {
      expect(parseSQL(`firstName IN ('Test', 12, true, lastName)`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'in', value: 'Test, 12, true' })
      );
      expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'notIn', value: 'Test, 12, true' })
      );
    });
    it('like/not like', () => {
      expect(parseSQL(`firstName LIKE '%Steve%'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'contains', value: 'Steve' })
      );
      expect(parseSQL(`firstName LIKE 'Steve%'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'beginsWith', value: 'Steve' })
      );
      expect(parseSQL(`firstName LIKE '%Steve'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'endsWith', value: 'Steve' })
      );
      expect(parseSQL(`firstName NOT LIKE '%Steve%'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'doesNotContain', value: 'Steve' })
      );
      expect(parseSQL(`firstName NOT LIKE 'Steve%'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'doesNotBeginWith', value: 'Steve' })
      );
      expect(parseSQL(`firstName NOT LIKE '%Steve'`)).toEqual(
        wrapRule({ field: 'firstName', operator: 'doesNotEndWith', value: 'Steve' })
      );
    });
    it('between/notBetween', () => {
      expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual(
        wrapRule({ field: 'age', operator: 'between', value: '12, 14' })
      );
      expect(parseSQL(`age NOT BETWEEN 12 AND 14`)).toEqual(
        wrapRule({ field: 'age', operator: 'notBetween', value: '12, 14' })
      );
    });
    it('params as array', () => {
      expect(parseSQL(`firstName = ?`, { params: ['Steve'] })).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
      expect(parseSQL(`age = ?`, { params: [12] })).toEqual(
        wrapRule({ field: 'age', operator: '=', value: 12 })
      );
      expect(parseSQL(`isMusician = ?`, { params: [true] })).toEqual(
        wrapRule({ field: 'isMusician', operator: '=', value: true })
      );
      expect(parseSQL(`isMusician = ?`, { params: [false] })).toEqual(
        wrapRule({ field: 'isMusician', operator: '=', value: false })
      );
    });
    it('params as object', () => {
      expect(parseSQL(`firstName = :p1`, { params: { p1: 'Steve' } })).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
      expect(parseSQL(`firstName = $p1`, { params: { p1: 'Steve' }, paramPrefix: '$' })).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
    });
  });

  describe('AND/OR expressions', () => {
    it('AND', () => {
      expect(parseSQL(`firstName = 'Steve' AND lastName = 'Vai' AND middleName IS NULL`)).toEqual({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
          { field: 'middleName', operator: 'null', value: null }
        ]
      });
    });
    it('OR', () => {
      expect(parseSQL(`firstName = 'Steve' OR lastName = 'Vai' OR middleName IS NULL`)).toEqual({
        combinator: 'or',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
          { field: 'middleName', operator: 'null', value: null }
        ]
      });
    });
    it('mixed AND/OR', () => {
      expect(parseSQL(`firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL`)).toEqual({
        combinator: 'or',
        rules: [
          {
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              { field: 'lastName', operator: '=', value: 'Vai' }
            ]
          },
          { field: 'middleName', operator: 'null', value: null }
        ]
      });
      expect(
        parseSQL(
          `firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL OR isMusician = TRUE`
        )
      ).toEqual({
        combinator: 'or',
        rules: [
          {
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              { field: 'lastName', operator: '=', value: 'Vai' }
            ]
          },
          { field: 'middleName', operator: 'null', value: null },
          { field: 'isMusician', operator: '=', value: true }
        ]
      });
      expect(
        parseSQL(
          `firstName = 'Steve' AND lastName = 'Vai' OR middleName IS NULL OR isMusician = TRUE OR fieldName = 'Test'`
        )
      ).toEqual({
        combinator: 'or',
        rules: [
          {
            combinator: 'and',
            rules: [
              { field: 'firstName', operator: '=', value: 'Steve' },
              { field: 'lastName', operator: '=', value: 'Vai' }
            ]
          },
          { field: 'middleName', operator: 'null', value: null },
          { field: 'isMusician', operator: '=', value: true },
          { field: 'fieldName', operator: '=', value: 'Test' }
        ]
      });
      expect(parseSQL(`firstName = 'Steve' OR lastName = 'Vai' AND middleName IS NULL`)).toEqual({
        combinator: 'or',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          {
            combinator: 'and',
            rules: [
              { field: 'lastName', operator: '=', value: 'Vai' },
              { field: 'middleName', operator: 'null', value: null }
            ]
          }
        ]
      });
    });
  });

  describe('NOT expressions', () => {
    const expectedRuleGroup: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }],
      not: true
    };
    it('NOT expressions', () => {
      expect(parseSQL(`NOT firstName = 'Steve'`)).toEqual(expectedRuleGroup);
      expect(parseSQL(`NOT (firstName = 'Steve')`)).toEqual(expectedRuleGroup);
      expect(parseSQL(`NOT (firstName = someFunc('Steve'))`)).toEqual(wrapRule());
      expect(parseSQL(`NOT (firstName = 'Steve' OR lastName = 'Vai')`)).toEqual({
        combinator: 'or',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' }
        ],
        not: true
      });
    });
  });

  describe('parenthetical groups', () => {
    it('opening parentheses', () => {
      expect(parseSQL(`(firstName = 'Steve')`)).toEqual(
        wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
      );
    });
    it('non-opening parentheses', () => {
      expect(parseSQL(`firstName = 'Steve' AND (lastName = 'Vai' AND middleName IS NULL)`)).toEqual(
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            {
              combinator: 'and',
              rules: [
                { field: 'lastName', operator: '=', value: 'Vai' },
                { field: 'middleName', operator: 'null', value: null }
              ]
            }
          ]
        }
      );
    });
    it('nested parentheses', () => {
      expect(
        parseSQL(
          `firstName = 'Steve' AND ((testField = 'TestValue' AND (lastName = 'Vai')) AND middleName IS NULL)`
        )
      ).toEqual({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          {
            combinator: 'and',
            rules: [
              {
                combinator: 'and',
                rules: [
                  { field: 'testField', operator: '=', value: 'TestValue' },
                  { combinator: 'and', rules: [{ field: 'lastName', operator: '=', value: 'Vai' }] }
                ]
              },
              { field: 'middleName', operator: 'null', value: null }
            ]
          }
        ]
      });
    });
    it('parentheses with AND', () => {
      expect(parseSQL(`(firstName = 'Steve' AND lastName = 'Vai')`)).toEqual({
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' }
        ]
      });
    });
    it('nested parentheses with ignored expressions', () => {
      expect(parseSQL(`((((firstName = CASE x WHEN y THEN z END))))`)).toEqual(wrapRule());
    });
  });

  describe('errors', () => {
    it('throws on bad SQL', () => {
      expect(() => parseSQL(`SELECT blah blah blah`)).toThrow();
    });
  });
});
