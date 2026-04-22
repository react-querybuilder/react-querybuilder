import type { RuleGroupType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import { formatSPARQL } from '../formatSPARQL';
import type { SparqlPatternMeta, SparqlFilterMeta } from '../types';

const sparqlPattern = (subject: string, optional = false): SparqlPatternMeta => ({
  graphRole: 'pattern',
  graphLang: 'sparql',
  subject,
  optional,
});

const filterMeta: SparqlFilterMeta = { graphRole: 'filter', graphLang: 'sparql' };

describe('formatSPARQL', () => {
  it('should format a basic query with triple patterns and filter', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: 'rdf:type',
          operator: 'binds',
          value: 'foaf:Person',
          meta: sparqlPattern('?person'),
        },
        { field: 'foaf:name', operator: 'binds', value: '?name', meta: sparqlPattern('?person') },
        { field: 'foaf:age', operator: 'binds', value: '?age', meta: sparqlPattern('?person') },
        { field: '?age', operator: '>', value: 30, meta: filterMeta },
      ],
    };
    const result = formatSPARQL(query);
    expect(result).toContain('SELECT ?person ?name ?age');
    expect(result).toContain('WHERE {');
    expect(result).toContain('?person rdf:type foaf:Person .');
    expect(result).toContain('?person foaf:name ?name .');
    expect(result).toContain('?person foaf:age ?age .');
    expect(result).toContain('FILTER (?age > 30)');
    expect(result).toContain('}');
  });

  it('should include PREFIX declarations', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: 'rdf:type',
          operator: 'binds',
          value: 'foaf:Person',
          meta: sparqlPattern('?person'),
        },
      ],
    };
    const result = formatSPARQL(query, {
      prefixes: {
        rdf: 'http://www.w3.org/1999/02/22-rdf-syntax-ns#',
        foaf: 'http://xmlns.com/foaf/0.1/',
      },
    });
    expect(result).toContain('PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>');
    expect(result).toContain('PREFIX foaf: <http://xmlns.com/foaf/0.1/>');
  });

  it('should handle OPTIONAL triples', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'foaf:name', operator: 'binds', value: '?name', meta: sparqlPattern('?person') },
        {
          field: 'schema:email',
          operator: 'binds',
          value: '?email',
          meta: sparqlPattern('?person', true),
        },
      ],
    };
    const result = formatSPARQL(query);
    expect(result).toContain('?person foaf:name ?name .');
    expect(result).toContain('OPTIONAL {');
    expect(result).toContain('schema:email');
    expect(result).toContain('}');
  });

  it('should format SPARQL filter functions correctly', () => {
    const operators: [string, string, string, string][] = [
      ['contains', 'Smith', 'CONTAINS', 'CONTAINS(?name, "Smith")'],
      ['beginsWith', 'J', 'STRSTARTS', 'STRSTARTS(?name, "J")'],
      ['endsWith', 'son', 'STRENDS', 'STRENDS(?name, "son")'],
      ['doesNotContain', 'test', '!CONTAINS', '!CONTAINS(?name, "test")'],
      ['null', '', '!BOUND', '!BOUND(?name)'],
      ['notNull', '', 'BOUND', 'BOUND(?name)'],
    ];

    for (const [operator, value, , expected] of operators) {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: '?name', operator, value, meta: filterMeta }],
      };
      const result = formatSPARQL(query);
      expect(result).toContain(expected);
    }
  });

  it('should handle nested OR groups in filters', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: '?age', operator: '>', value: 25, meta: filterMeta },
        {
          combinator: 'or',
          rules: [
            { field: '?name', operator: 'contains', value: 'Smith', meta: filterMeta },
            { field: '?name', operator: 'beginsWith', value: 'J', meta: filterMeta },
          ],
        },
      ],
    };
    const result = formatSPARQL(query);
    expect(result).toContain('?age > 25 && (CONTAINS(?name, "Smith") || STRSTARTS(?name, "J"))');
  });

  it('should allow custom SELECT variables', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'foaf:name', operator: 'binds', value: '?name', meta: sparqlPattern('?person') },
      ],
    };
    const result = formatSPARQL(query, { selectVariables: ['?name'] });
    expect(result).toContain('SELECT ?name');
    expect(result).not.toContain('SELECT ?person');
  });

  it('should produce minimal output for empty query', () => {
    const query: RuleGroupType = { combinator: 'and', rules: [] };
    const result = formatSPARQL(query);
    expect(result).toContain('SELECT');
    expect(result).toContain('WHERE {');
    expect(result).toContain('}');
  });

  it('should handle multiple subjects', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'foaf:name', operator: 'binds', value: '?name', meta: sparqlPattern('?person') },
        {
          field: 'foaf:knows',
          operator: 'binds',
          value: '?friend',
          meta: sparqlPattern('?person'),
        },
        {
          field: 'foaf:name',
          operator: 'binds',
          value: '?friendName',
          meta: sparqlPattern('?friend'),
        },
      ],
    };
    const result = formatSPARQL(query);
    expect(result).toContain('?person foaf:name ?name .');
    expect(result).toContain('?person foaf:knows ?friend .');
    expect(result).toContain('?friend foaf:name ?friendName .');
  });
});
