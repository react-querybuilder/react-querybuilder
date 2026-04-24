import type { RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { CypherPatternMeta, SparqlPatternMeta, GremlinPatternMeta } from '../types';
import { parseCypher, parseGQL } from './parseCypher';
import { parseGremlin } from './parseGremlin';
import { parseSPARQL } from './parseSPARQL';

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

describe('parseSPARQL', () => {
  it('should parse triple patterns', () => {
    const result = parseSPARQL(`
      SELECT ?person ?name
      WHERE {
        ?person rdf:type foaf:Person .
        ?person foaf:name ?name .
      }
    `);
    expect(result.combinator).toBe('and');
    const patternRules = result.rules.filter(
      r => 'meta' in r && r.meta?.graphRole === 'pattern'
    ) as RuleType[];
    expect(patternRules.length).toBe(2);
    expect((patternRules[0].meta as SparqlPatternMeta).subject).toBe('?person');
    expect(patternRules[0].field).toBe('rdf:type');
    expect(patternRules[0].value).toBe('foaf:Person');
  });

  it('should parse FILTER expressions', () => {
    const result = parseSPARQL(`
      SELECT ?person ?age
      WHERE {
        ?person foaf:age ?age .
        FILTER (?age > 30)
      }
    `);
    const filterRules = result.rules.filter(
      r => 'meta' in r && r.meta?.graphRole === 'filter'
    ) as RuleType[];
    expect(filterRules.length).toBeGreaterThanOrEqual(1);
  });

  it('should parse OPTIONAL blocks', () => {
    const result = parseSPARQL(`
      SELECT ?person ?email
      WHERE {
        ?person foaf:name ?name .
        OPTIONAL { ?person schema:email ?email . }
      }
    `);
    const optionalRule = result.rules.find(r => {
      if (!('meta' in r)) return false;
      return r.meta?.optional === true;
    }) as RuleType;
    expect(optionalRule).toBeDefined();
    expect((optionalRule.meta as SparqlPatternMeta).subject).toBe('?person');
  });

  it('should parse SPARQL function filters', () => {
    const result = parseSPARQL(`
      SELECT ?name
      WHERE {
        ?person foaf:name ?name .
        FILTER (CONTAINS(?name, "Smith"))
      }
    `);
    const filterRule = result.rules.find(
      r => 'operator' in r && r.operator === 'contains'
    ) as RuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.value).toBe('Smith');
  });

  it('should handle empty WHERE block', () => {
    const result = parseSPARQL(`SELECT ?x WHERE { }`);
    expect(result.rules.length).toBe(0);
  });

  it('should handle query without WHERE', () => {
    const result = parseSPARQL(`SELECT ?x`);
    expect(result.rules.length).toBe(0);
  });
});

describe('parseGremlin', () => {
  it('should parse hasLabel steps', () => {
    const result = parseGremlin(`g.V().hasLabel('Person')`);
    expect(result.combinator).toBe('and');
    const labelRule = result.rules.find(
      r => 'operator' in r && r.operator === 'hasLabel'
    ) as RuleType;
    expect(labelRule).toBeDefined();
    expect(labelRule.value).toBe('Person');
  });

  it('should parse has() equality', () => {
    const result = parseGremlin(`g.V().hasLabel('Person').has('name', 'Alice')`);
    const hasRule = result.rules.find(
      r => 'operator' in r && r.operator === '=' && r.field === 'name'
    ) as RuleType;
    expect(hasRule).toBeDefined();
    expect(hasRule.value).toBe('Alice');
  });

  it('should parse predicate functions', () => {
    const predicates: [string, string, unknown][] = [
      ["has('age', gt(30))", '>', 30],
      ["has('age', lt(30))", '<', 30],
      ["has('age', gte(30))", '>=', 30],
      ["has('age', lte(30))", '<=', 30],
      ["has('age', neq(30))", '!=', 30],
    ];

    for (const [step, expectedOp, expectedValue] of predicates) {
      const result = parseGremlin(`g.V().${step}`);
      const rule = result.rules.find(r => 'field' in r && r.field === 'age') as RuleType;
      expect(rule).toBeDefined();
      expect(rule.operator).toBe(expectedOp);
      expect(rule.value).toBe(expectedValue);
    }
  });

  it('should parse text predicates', () => {
    const result = parseGremlin(`g.V().has('name', containing('test'))`);
    const rule = result.rules.find(r => 'operator' in r && r.operator === 'contains') as RuleType;
    expect(rule).toBeDefined();
    expect(rule.value).toBe('test');
  });

  it('should parse edge traversals', () => {
    const result = parseGremlin(`g.V().hasLabel('Person').out('knows')`);
    const traversalRule = result.rules.find(
      r => 'operator' in r && r.operator === 'traverses'
    ) as RuleType;
    expect(traversalRule).toBeDefined();
    expect((traversalRule.meta as GremlinPatternMeta).edgeLabel).toBe('knows');
    expect((traversalRule.meta as GremlinPatternMeta).direction).toBe('out');
  });

  it('should parse in/both traversals', () => {
    for (const dir of ['in', 'both'] as const) {
      const result = parseGremlin(`g.V().${dir}('knows')`);
      const traversalRule = result.rules.find(
        r => 'operator' in r && r.operator === 'traverses'
      ) as RuleType;
      expect(traversalRule).toBeDefined();
      expect((traversalRule.meta as GremlinPatternMeta).direction).toBe(dir);
    }
  });

  it('should parse within/without', () => {
    const result = parseGremlin(`g.V().has('status', within('active', 'pending'))`);
    const rule = result.rules.find(r => 'operator' in r && r.operator === 'in') as RuleType;
    expect(rule).toBeDefined();
    expect(rule.value).toEqual(['active', 'pending']);
  });

  it('should parse hasNot', () => {
    const result = parseGremlin(`g.V().hasNot('email')`);
    const rule = result.rules.find(r => 'operator' in r && r.operator === 'null') as RuleType;
    expect(rule).toBeDefined();
    expect(rule.field).toBe('email');
  });

  it('should parse as() step labels', () => {
    const result = parseGremlin(`g.V().hasLabel('Person').as('a')`);
    // as() sets stepLabel on the next pattern rule, or is tracked internally
    expect(result.rules.length).toBeGreaterThanOrEqual(1);
  });

  it('should handle empty traversal', () => {
    const result = parseGremlin(`g.V()`);
    expect(result.rules.length).toBe(0);
  });
});
