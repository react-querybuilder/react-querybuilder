import type { DefaultRuleType } from '../../types';
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
