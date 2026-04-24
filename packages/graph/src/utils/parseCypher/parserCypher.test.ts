import type { RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { CypherPatternMeta } from '../../types';
import { parseCypher, parseGQL } from './parseCypher';

describe('parseCypher', () => {
  it('should parse a simple MATCH + WHERE query', () => {
    const result = parseCypher(`MATCH (a:Person) WHERE a.age > 30`);
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBeGreaterThanOrEqual(2);

    // Should have a pattern rule and a filter rule
    const patternRule = result.rules.find(
      r => 'meta' in r && r.meta?.graphRole === 'pattern'
    ) as RuleType;
    expect(patternRule).toBeDefined();
    expect((patternRule.meta as CypherPatternMeta).nodeAlias).toBe('a');
    expect((patternRule.meta as CypherPatternMeta).nodeLabel).toBe('Person');

    const filterRule = result.rules.find(
      r => 'meta' in r && r.meta?.graphRole === 'filter' && r.field === 'a.age'
    ) as RuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.operator).toBe('>');
    expect(filterRule.value).toBe(30);
  });

  it('should parse relationship patterns', () => {
    const result = parseCypher(`MATCH (a:Person)-[:KNOWS]->(b:Person) WHERE a.name = 'Alice'`);
    const patternRule = result.rules.find(
      r => 'meta' in r && r.meta?.graphRole === 'pattern'
    ) as RuleType;
    expect(patternRule).toBeDefined();
    const meta = patternRule.meta as CypherPatternMeta;
    expect(meta.nodeAlias).toBe('a');
    expect(meta.relType).toBe('KNOWS');
    expect(meta.targetAlias).toBe('b');
  });

  it('should parse OPTIONAL MATCH', () => {
    const result = parseCypher(
      `MATCH (a:Person) OPTIONAL MATCH (a)-[:KNOWS]->(b:Person) WHERE a.age > 25`
    );
    const optionalRule = result.rules.find(r => {
      if (!('meta' in r)) return false;
      const meta = r.meta as CypherPatternMeta;
      return meta?.optional === true;
    }) as RuleType;
    expect(optionalRule).toBeDefined();
  });

  it('should parse multiple WHERE conditions with AND', () => {
    const result = parseCypher(`MATCH (a:Person) WHERE a.age > 25 AND a.name = 'Alice'`);
    const filterRules = result.rules.filter(
      r => 'meta' in r && r.meta?.graphRole === 'filter'
    ) as RuleType[];
    expect(filterRules.length).toBe(2);
  });

  it('should parse string operators', () => {
    const result = parseCypher(`MATCH (a:Person) WHERE a.name STARTS WITH 'J'`);
    const filterRule = result.rules.find(
      r => 'operator' in r && r.operator === 'beginsWith'
    ) as RuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.value).toBe('J');
  });

  it('should parse IS NULL and IS NOT NULL', () => {
    const result = parseCypher(`MATCH (a:Person) WHERE a.email IS NULL`);
    const filterRule = result.rules.find(r => 'operator' in r && r.operator === 'null') as RuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.field).toBe('a.email');
  });

  it('should parse IN lists', () => {
    const result = parseCypher(`MATCH (a:Person) WHERE a.status IN ['active', 'pending']`);
    const filterRule = result.rules.find(r => 'operator' in r && r.operator === 'in') as RuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.value).toEqual(['active', 'pending']);
  });

  it('should handle empty query', () => {
    const result = parseCypher('');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });
});

describe('parseGQL', () => {
  it('should parse the same as parseCypher for basic queries', () => {
    const cypher = parseCypher(`MATCH (a:Person) WHERE a.age > 30`);
    const gql = parseGQL(`MATCH (a:Person) WHERE a.age > 30`);
    expect(gql.rules.length).toBe(cypher.rules.length);
  });
});
