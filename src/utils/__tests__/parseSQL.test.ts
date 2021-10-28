import { RuleGroupType, RuleType } from '../../types';
import parseSQL from '../parseSQL';

const singleRuleGroup = (rule?: RuleType): RuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : []
});

describe('parseSQL', () => {
  it('handles SELECT statement without WHERE clause', () => {
    expect(parseSQL('SELECT * FROM t')).toEqual(singleRuleGroup());
  });
  it('handles SELECT statement with semicolon', () => {
    expect(parseSQL('SELECT * FROM t;')).toEqual(singleRuleGroup());
  });
  it('handles SELECT statement with multiple fields and tables', () => {
    expect(parseSQL('SELECT t1.this, t2.that FROM t1 INNER JOIN t2 ON t1.this = t2.that;')).toEqual(
      singleRuleGroup()
    );
  });
  it('ignores invalid/complex clauses', () => {
    expect(parseSQL(`firstName = CASE x WHEN y THEN z ELSE a END`)).toEqual(singleRuleGroup());
  });
  it('handles basic comparisons of strings and numbers', () => {
    expect(parseSQL(`firstName = 'Steve'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName != 'Steve'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '!=', value: 'Steve' })
    );
    expect(parseSQL(`firstName <> 'Steve'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '!=', value: 'Steve' })
    );
    expect(parseSQL(`age >= 14`)).toEqual(
      singleRuleGroup({ field: 'age', operator: '>=', value: 14 })
    );
    expect(parseSQL(`age > 14`)).toEqual(
      singleRuleGroup({ field: 'age', operator: '>', value: 14 })
    );
    expect(parseSQL(`age <= 14`)).toEqual(
      singleRuleGroup({ field: 'age', operator: '<=', value: 14 })
    );
    expect(parseSQL(`age < 14`)).toEqual(
      singleRuleGroup({ field: 'age', operator: '<', value: 14 })
    );
  });
  it('handles booleans', () => {
    expect(parseSQL(`isMusician = TRUE`)).toEqual(
      singleRuleGroup({ field: 'isMusician', operator: '=', value: true })
    );
    expect(parseSQL(`isMusician = FALSE`)).toEqual(
      singleRuleGroup({ field: 'isMusician', operator: '=', value: false })
    );
  });
  it('handles null/notNull', () => {
    expect(parseSQL(`firstName is null`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'null', value: null })
    );
    expect(parseSQL(`firstName is not null`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'notNull', value: null })
    );
  });
  it('handles in/notIn', () => {
    expect(parseSQL(`firstName IN ('Test', 12, true, lastName)`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'in', value: 'Test, 12, true' })
    );
    expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'notIn', value: 'Test, 12, true' })
    );
  });
  it('handles like/not like', () => {
    expect(parseSQL(`firstName LIKE '%Steve%'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'contains', value: 'Steve' })
    );
    expect(parseSQL(`firstName LIKE 'Steve%'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'beginsWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName LIKE '%Steve'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'endsWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE '%Steve%'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'doesNotContain', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE 'Steve%'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'doesNotBeginWith', value: 'Steve' })
    );
    expect(parseSQL(`firstName NOT LIKE '%Steve'`)).toEqual(
      singleRuleGroup({ field: 'firstName', operator: 'doesNotEndWith', value: 'Steve' })
    );
  });
  it('handles between/notBetween', () => {
    expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual(
      singleRuleGroup({ field: 'age', operator: 'between', value: '12,14' })
    );
  });
  it('handles params as array', () => {
    expect(parseSQL(`firstName = ?`, { params: ['Steve'] })).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`age = ?`, { params: [12] })).toEqual(
      singleRuleGroup({ field: 'age', operator: '=', value: 12 })
    );
    expect(parseSQL(`isMusician = ?`, { params: [true] })).toEqual(
      singleRuleGroup({ field: 'isMusician', operator: '=', value: true })
    );
  });
  it('handles params as object', () => {
    expect(parseSQL(`firstName = :p1`, { params: { p1: 'Steve' } })).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '=', value: 'Steve' })
    );
    expect(parseSQL(`firstName = $p1`, { params: { p1: 'Steve' }, paramPrefix: '$' })).toEqual(
      singleRuleGroup({ field: 'firstName', operator: '=', value: 'Steve' })
    );
  });
});
