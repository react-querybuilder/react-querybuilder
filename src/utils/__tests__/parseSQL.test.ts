import { RuleGroupType, RuleType } from '../../types';
import parseSQL from '../parseSQL';

const wrapRule = (rule?: RuleType): RuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : []
});

describe('parseSQL', () => {
  it('handles SELECT statement without WHERE clause', () => {
    expect(parseSQL('SELECT * FROM t')).toEqual(wrapRule());
  });
  it('handles SELECT statement with semicolon', () => {
    expect(parseSQL('SELECT * FROM t;')).toEqual(wrapRule());
  });
  it('handles SELECT statement with multiple fields and tables', () => {
    expect(parseSQL('SELECT t1.this, t2.that FROM t1 INNER JOIN t2 ON t1.this = t2.that;')).toEqual(
      wrapRule()
    );
  });
  it('ignores invalid/complex clauses', () => {
    expect(parseSQL(`firstName = CASE x WHEN y THEN z ELSE a END`)).toEqual(wrapRule());
    expect(parseSQL(`firstName = someFunc('Steve', 'Vai')`)).toEqual(wrapRule());
    expect(parseSQL(`firstName IN (SELECT val FROM otherTable WHERE name = 'Steve')`)).toEqual(
      wrapRule()
    );
  });
  it('handles basic comparisons of strings and numbers', () => {
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
  it('handles booleans', () => {
    expect(parseSQL(`isMusician = TRUE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
    expect(parseSQL(`isMusician = FALSE`)).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: false })
    );
  });
  it('handles null/notNull', () => {
    expect(parseSQL(`firstName is null`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'null', value: null })
    );
    expect(parseSQL(`firstName is not null`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'notNull', value: null })
    );
  });
  it('handles in/notIn', () => {
    expect(parseSQL(`firstName IN ('Test', 12, true, lastName)`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'in', value: 'Test, 12, true' })
    );
    expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual(
      wrapRule({ field: 'firstName', operator: 'notIn', value: 'Test, 12, true' })
    );
  });
  it('handles like/not like', () => {
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
  it('handles between/notBetween', () => {
    expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual(
      wrapRule({ field: 'age', operator: 'between', value: '12,14' })
    );
  });
  it('handles params as array', () => {
    expect(parseSQL(`firstName = ?`, { params: ['Steve'] })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`age = ?`, { params: [12] })).toEqual(
      wrapRule({ field: 'age', operator: '=', value: 12 })
    );
    expect(parseSQL(`isMusician = ?`, { params: [true] })).toEqual(
      wrapRule({ field: 'isMusician', operator: '=', value: true })
    );
  });
  it('handles params as object', () => {
    expect(parseSQL(`firstName = :p1`, { params: { p1: 'Steve' } })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName = $p1`, { params: { p1: 'Steve' }, paramPrefix: '$' })).toEqual(
      wrapRule({ field: 'firstName', operator: '=', value: 'Steve' })
    );
  });
});
