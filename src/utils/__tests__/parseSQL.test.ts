import parseSQL from '../parseSQL';

describe('parseSQL', () => {
  it('handles SELECT statement without WHERE clause', () => {
    expect(parseSQL('SELECT * FROM t')).toEqual({
      combinator: 'and',
      rules: []
    });
  });
  it('handles SELECT statement with semicolon', () => {
    expect(parseSQL('SELECT * FROM t;')).toEqual({
      combinator: 'and',
      rules: []
    });
  });
  it('handles SELECT statement with multiple fields and tables', () => {
    expect(parseSQL('SELECT t1.this, t2.that FROM t1 INNER JOIN t2 ON t1.this = t2.that;')).toEqual(
      {
        combinator: 'and',
        rules: []
      }
    );
  });
  it('ignores invalid/complex clauses', () => {
    expect(parseSQL(`firstName = CASE x WHEN y THEN z ELSE a END`)).toEqual({
      combinator: 'and',
      rules: []
    });
  });
  it('handles basic comparisons of strings and numbers', () => {
    expect(parseSQL(`firstName = 'Steve'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
    });
    expect(parseSQL(`firstName != 'Steve'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '!=', value: 'Steve' }]
    });
    expect(parseSQL(`firstName <> 'Steve'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '!=', value: 'Steve' }]
    });
    expect(parseSQL(`age >= 14`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: '>=', value: 14 }]
    });
    expect(parseSQL(`age > 14`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: '>', value: 14 }]
    });
    expect(parseSQL(`age <= 14`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: '<=', value: 14 }]
    });
    expect(parseSQL(`age < 14`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: '<', value: 14 }]
    });
  });
  it('handles booleans', () => {
    expect(parseSQL(`isMusician = TRUE`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'isMusician', operator: '=', value: true }]
    });
    expect(parseSQL(`isMusician = FALSE`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'isMusician', operator: '=', value: false }]
    });
  });
  it('handles null/notNull', () => {
    expect(parseSQL(`firstName is null`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'null', value: null }]
    });
    expect(parseSQL(`firstName is not null`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'notNull', value: null }]
    });
  });
  it('handles in/notIn', () => {
    expect(parseSQL(`firstName IN ('Test', 12, true, lastName)`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'in', value: 'Test, 12, true' }]
    });
    expect(parseSQL(`firstName NOT IN ('Test', 12, true, lastName)`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'notIn', value: 'Test, 12, true' }]
    });
  });
  it('handles like/not like', () => {
    expect(parseSQL(`firstName LIKE '%Steve%'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'contains', value: 'Steve' }]
    });
    expect(parseSQL(`firstName LIKE 'Steve%'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'beginsWith', value: 'Steve' }]
    });
    expect(parseSQL(`firstName LIKE '%Steve'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'endsWith', value: 'Steve' }]
    });
    expect(parseSQL(`firstName NOT LIKE '%Steve%'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'doesNotContain', value: 'Steve' }]
    });
    expect(parseSQL(`firstName NOT LIKE 'Steve%'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'doesNotBeginWith', value: 'Steve' }]
    });
    expect(parseSQL(`firstName NOT LIKE '%Steve'`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: 'doesNotEndWith', value: 'Steve' }]
    });
  });
  it('handles between/notBetween', () => {
    expect(parseSQL(`age BETWEEN 12 AND 14`)).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: 'between', value: '12,14' }]
    });
  });
  it('handles params as array', () => {
    expect(parseSQL(`firstName = ?`, { params: ['Steve'] })).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
    });
    expect(parseSQL(`age = ?`, { params: [12] })).toEqual({
      combinator: 'and',
      rules: [{ field: 'age', operator: '=', value: 12 }]
    });
    expect(parseSQL(`isMusician = ?`, { params: [true] })).toEqual({
      combinator: 'and',
      rules: [{ field: 'isMusician', operator: '=', value: true }]
    });
  });
  it('handles params as object', () => {
    expect(parseSQL(`firstName = :p1`, { params: { p1: 'Steve' } })).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
    });
    expect(parseSQL(`firstName = $p1`, { params: { p1: 'Steve' }, paramPrefix: '$' })).toEqual({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Steve' }]
    });
  });
});
