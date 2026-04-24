import type { RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { SparqlPatternMeta } from '../../types';
import { parseSPARQL } from './parseSPARQL';

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
