import type { DefaultRuleGroupType, DefaultRuleType } from '../../types';
import { formatQuery } from '../formatQuery';
import { parseCypher, parseGQL } from './parseCypher';

describe('parseCypher', () => {
  it('parses a full MATCH + WHERE query (extracts only WHERE conditions)', () => {
    const result = parseCypher('MATCH (a:Person) WHERE a.age > 30');
    expect(result.combinator).toBe('and');
    // Should NOT contain pattern rules — only filter conditions
    expect(result.rules.length).toBe(1);
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.field).toBe('a.age');
    expect(rule.operator).toBe('>');
    expect(rule.value).toBe(30);
  });

  it('parses a WHERE clause without MATCH', () => {
    const result = parseCypher('WHERE a.age > 30');
    expect(result.rules.length).toBe(1);
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.field).toBe('a.age');
    expect(rule.operator).toBe('>');
    expect(rule.value).toBe(30);
  });

  it('parses a bare expression (auto-detect)', () => {
    const result = parseCypher("a.age > 30 AND a.name = 'Alice'");
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(2);
  });

  it('parses relationship patterns and only returns WHERE conditions', () => {
    const result = parseCypher("MATCH (a:Person)-[:KNOWS]->(b:Person) WHERE a.name = 'Alice'");
    expect(result.rules.length).toBe(1);
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.field).toBe('a.name');
    expect(rule.operator).toBe('=');
    expect(rule.value).toBe('Alice');
  });

  it('parses multiple WHERE conditions with AND', () => {
    const result = parseCypher("MATCH (a:Person) WHERE a.age > 25 AND a.name = 'Alice'");
    expect(result.rules.length).toBe(2);
    expect((result.rules[0] as DefaultRuleType).field).toBe('a.age');
    expect((result.rules[1] as DefaultRuleType).field).toBe('a.name');
  });

  it('parses string operators', () => {
    const result = parseCypher("MATCH (a:Person) WHERE a.name STARTS WITH 'J'");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('beginsWith');
    expect(rule.value).toBe('J');
  });

  it('parses ENDS WITH', () => {
    const result = parseCypher("a.name ENDS WITH 'son'");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('endsWith');
    expect(rule.value).toBe('son');
  });

  it('parses CONTAINS', () => {
    const result = parseCypher("a.name CONTAINS 'test'");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('contains');
    expect(rule.value).toBe('test');
  });

  it('parses IS NULL', () => {
    const result = parseCypher('MATCH (a:Person) WHERE a.email IS NULL');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('null');
    expect(rule.field).toBe('a.email');
  });

  it('parses IS NOT NULL', () => {
    const result = parseCypher('a.email IS NOT NULL');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notNull');
  });

  it('parses IN lists', () => {
    const result = parseCypher("MATCH (a:Person) WHERE a.status IN ['active', 'pending']");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('in');
    expect(rule.value).toEqual(['active', 'pending']);
  });

  it('parses NOT IN lists', () => {
    const result = parseCypher("a.status NOT IN ['inactive']");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notIn');
    expect(rule.value).toEqual(['inactive']);
  });

  it('parses OR groups', () => {
    const result = parseCypher("a.age > 25 OR a.name = 'Alice'");
    expect(result.rules.length).toBe(1);
    const group = result.rules[0];
    expect('combinator' in group && group.combinator).toBe('or');
  });

  it('parses NOT groups', () => {
    const result = parseCypher('NOT (a.age < 18)');
    expect(result.rules.length).toBe(1);
    const group = result.rules[0];
    expect('not' in group && group.not).toBe(true);
  });

  it('handles empty query', () => {
    const result = parseCypher('');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });

  it('handles invalid syntax gracefully', () => {
    const result = parseCypher('NOT A VALID CYPHER %%%');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });

  it('ignores MATCH and RETURN clauses', () => {
    const result = parseCypher('MATCH (a:Person) WHERE a.age > 30 RETURN a');
    expect(result.rules.length).toBe(1);
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.field).toBe('a.age');
  });

  it('returns empty rules when no WHERE clause', () => {
    const result = parseCypher('MATCH (a:Person) RETURN a');
    expect(result.rules.length).toBe(0);
  });
});

describe('parseGQL', () => {
  it('parses the same as parseCypher', () => {
    const cypher = parseCypher('MATCH (a:Person) WHERE a.age > 30');
    const gql = parseGQL('MATCH (a:Person) WHERE a.age > 30');
    expect(gql.rules.length).toBe(cypher.rules.length);
    expect((gql.rules[0] as DefaultRuleType).field).toBe(
      (cypher.rules[0] as DefaultRuleType).field
    );
  });
});

describe('keyword-prefixed identifiers', () => {
  it.each([
    'notes',
    'order',
    'index',
    'android',
    'matches',
    'wherever',
    'returned',
    'contains_x',
    'nullable',
    'trueValue',
    'falsey',
    'isNullish',
  ])('parses field %s', field => {
    expect(parseCypher(`${field} = 1`)).toEqual({
      combinator: 'and',
      rules: [{ field, operator: '=', value: 1 }],
    });
  });

  it('does not split multi-word keywords', () => {
    expect(parseCypher('NOT index = 1')).toEqual({
      combinator: 'and',
      rules: [
        { combinator: 'and', not: true, rules: [{ field: 'index', operator: '=', value: 1 }] },
      ],
    });
    expect(parseCypher('a IS NULLx')).toEqual({ combinator: 'and', rules: [] });
  });

  it('parses literals case-insensitively', () => {
    expect(parseCypher('a = TRUE AND b = False AND c = NULL')).toEqual({
      combinator: 'and',
      rules: [
        { field: 'a', operator: '=', value: true },
        { field: 'b', operator: '=', value: false },
        { field: 'c', operator: '=', value: null },
      ],
    });
  });

  it('parses clause keywords as field names', () => {
    expect(parseCypher('match = 1 AND where = 2 AND p.return = 3')).toEqual({
      combinator: 'and',
      rules: [
        { field: 'match', operator: '=', value: 1 },
        { field: 'where', operator: '=', value: 2 },
        { field: 'p.return', operator: '=', value: 3 },
      ],
    });
    expect(parseCypher('WHERE where = 1')).toEqual({
      combinator: 'and',
      rules: [{ field: 'where', operator: '=', value: 1 }],
    });
  });

  it('round-trips formatQuery cypher output with bare fields', () => {
    const query: DefaultRuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
        { field: 'lastName', operator: 'endsWith', value: 'n' },
        { field: 'notes', operator: 'contains', value: 'x' },
        { field: 'order', operator: 'in', value: ['a', 'b'] },
        { field: 'index', operator: 'notIn', value: ['c'] },
        { field: 'age', operator: '>', value: 28 },
        { field: 'android', operator: '<=', value: 3 },
        { field: 'isMusician', operator: '=', value: true },
        { field: 'nullable', operator: 'null', value: null },
        { field: 'matches', operator: 'notNull', value: null },
      ],
    };
    expect(parseCypher(formatQuery(query, 'cypher'))).toEqual(query);
  });
});

describe('regex', () => {
  const query: DefaultRuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: 'matches', value: "a\\d'+", regexFlags: 'im' },
      { field: 'g', operator: 'doesNotMatch', value: 'x|y' },
    ],
  };

  it('round-trips w/ parseRegex', () => {
    expect(parseCypher(formatQuery(query, 'cypher'), { parseRegex: true })).toEqual(query);
  });

  it('uses field operators to decide', () => {
    const fields = [
      { name: 'f', label: 'F', operators: [{ name: 'matches', label: 'matches' }] },
      { name: 'g', label: 'G' },
    ];
    expect(parseCypher(formatQuery(query, 'cypher'), { fields }).rules).toEqual([
      query.rules[0],
      { field: 'g', operator: 'doesNotContain', value: '.*(?:x|y).*' },
    ]);
  });

  it('falls back to contains w/ raw pattern', () => {
    expect(parseCypher("n.x =~ '(?i)ab'").rules).toEqual([
      { field: 'n.x', operator: 'contains', value: '(?i)ab' },
    ]);
  });

  it('anchors unwrapped full-match patterns', () => {
    expect(parseCypher("n.x =~ 'ab.*' OR n.y =~ '.*(?:a)|(?:b).*'", { parseRegex: true })).toEqual({
      combinator: 'and',
      rules: [
        {
          combinator: 'or',
          rules: [
            { field: 'n.x', operator: 'matches', value: '^(?:ab.*)$' },
            { field: 'n.y', operator: 'matches', value: '^(?:.*(?:a)|(?:b).*)$' },
          ],
        },
      ],
    });
  });

  it('handles non-string literal', () => {
    expect(parseCypher('n.x =~ 12', { parseRegex: true }).rules).toEqual([
      { field: 'n.x', operator: 'matches', value: '^(?:12)$' },
    ]);
  });
});
