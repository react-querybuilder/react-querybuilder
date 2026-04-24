import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { CypherFilterMeta, CypherPatternMeta, SparqlPatternMeta } from '../../../types';
import { formatGraphQuery } from '../formatGraphQuery';

const filterMeta: CypherFilterMeta = { graphRole: 'filter' };

const patternMeta = (
  overrides: Partial<CypherPatternMeta> & { nodeAlias: string }
): CypherPatternMeta => ({ graphRole: 'pattern', ...overrides });

describe('formatGraphQuery', () => {
  // ── Format dispatching ────────────────────────────────────────────────

  describe('dispatching', () => {
    const simpleQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta }],
    };

    it('should dispatch to Cypher format', () => {
      const result = formatGraphQuery(simpleQuery, { format: 'cypher' });
      expect(result).toContain("WHERE a.name = 'Alice'");
    });

    it('should dispatch to GQL format', () => {
      const result = formatGraphQuery(simpleQuery, { format: 'gql' });
      expect(result).toContain("WHERE a.name = 'Alice'");
    });

    it('should dispatch to SPARQL format', () => {
      const sparqlQuery: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: '?name', operator: '=', value: 'Alice', meta: filterMeta }],
      };
      const result = formatGraphQuery(sparqlQuery, { format: 'sparql' });
      expect(result).toContain('FILTER (?name = "Alice")');
    });

    it('should dispatch to Gremlin format', () => {
      const result = formatGraphQuery(simpleQuery, { format: 'gremlin' });
      expect(result).toContain("g.V().has('name', 'Alice')");
    });
  });

  // ── Format-specific options ───────────────────────────────────────────

  describe('format-specific options', () => {
    it('should pass includeReturn to Cypher', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: '_type',
            operator: 'is',
            value: 'Person',
            meta: patternMeta({ nodeAlias: 'a', nodeLabel: 'Person' }),
          },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher', includeReturn: false });
      expect(result).not.toContain('RETURN');
    });

    it('should pass prefixes to SPARQL', () => {
      const sparqlQuery: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: 'rdf:type',
            operator: 'binds',
            value: 'foaf:Person',
            meta: {
              graphRole: 'pattern',
              graphLang: 'sparql',
              subject: '?person',
            } satisfies SparqlPatternMeta,
          },
        ],
      };
      const result = formatGraphQuery(sparqlQuery, {
        format: 'sparql',
        prefixes: { foaf: 'http://xmlns.com/foaf/0.1/' },
      });
      expect(result).toContain('PREFIX foaf: <http://xmlns.com/foaf/0.1/>');
    });

    it('should pass traversalSource to Gremlin', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'name', operator: '=', value: 'Alice', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'gremlin', traversalSource: 'myGraph' });
      expect(result).toMatch(/^myGraph\.V\(\)/);
    });
  });

  // ── parseNumbers ──────────────────────────────────────────────────────

  describe('parseNumbers', () => {
    it('should convert string values to numbers for Cypher', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: '>', value: '30', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('WHERE a.age > 30');
      expect(result).not.toContain("'30'");
    });

    it('should convert string values to numbers for Gremlin', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'age', operator: '>', value: '30', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'gremlin', parseNumbers: true });
      expect(result).toContain(".has('age', gt(30))");
    });

    it('should convert string values to numbers for SPARQL', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: '?age', operator: '>', value: '30', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'sparql', parseNumbers: true });
      expect(result).toContain('FILTER (?age > 30)');
    });

    it('should convert between values to numbers', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: 'between', value: ['10', '30'], meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('10 <= a.age AND a.age <= 30');
    });

    it('should sort between values ascending by default when parseNumbers is enabled', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: 'between', value: [100, 0], meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('0 <= a.age AND a.age <= 100');
    });

    it('should preserve value order when preserveValueOrder is true', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: 'between', value: [100, 0], meta: filterMeta }],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        parseNumbers: true,
        preserveValueOrder: true,
      });
      expect(result).toContain('100 <= a.age AND a.age <= 0');
    });

    it('should convert in/notIn string values to numbers', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.count', operator: 'in', value: ['1', '2', '3'], meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('a.count IN [1, 2, 3]');
    });

    it('should handle comma-separated string between values', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: 'between', value: '10,30', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('10 <= a.age AND a.age <= 30');
    });

    it('should not convert values when parseNumbers is not set', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: '>', value: '30', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher' });
      expect(result).toContain("a.age > '30'");
    });

    it('should not process pattern rules with parseNumbers', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: '_type',
            operator: 'is',
            value: '123',
            meta: patternMeta({ nodeAlias: 'a', nodeLabel: '123' }),
          },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('MATCH (a:123)');
    });

    it('should not convert null/notNull values', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.age', operator: 'null', value: null, meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('a.age IS NULL');
    });
  });

  // ── Validation ────────────────────────────────────────────────────────

  describe('validation', () => {
    it('should return fallbackExpression when validator returns false', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.name', operator: '=', value: '', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        validator: () => false,
        fallbackExpression: '/* invalid */',
      });
      expect(result).toBe('/* invalid */');
    });

    it('should return empty string as default fallback', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.name', operator: '=', value: '', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', validator: () => false });
      expect(result).toBe('');
    });

    it('should process normally when validator returns true', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, { format: 'cypher', validator: () => true });
      expect(result).toContain("a.name = 'Alice'");
    });

    it('should skip rules that fail validationMap check', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { id: 'r1', field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta },
          { id: 'r2', field: 'a.age', operator: '>', value: 30, meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        validator: () => ({ r1: false }),
      });
      expect(result).not.toContain('Alice');
      expect(result).toContain('a.age > 30');
    });

    it('should skip rules that fail field-level validation', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'a.age', operator: '>', value: 99, meta: filterMeta },
          { field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        fields: [
          { name: 'a.age', label: 'Age', validator: r => r.value !== 99 },
          { name: 'a.name', label: 'Name' },
        ],
      });
      expect(result).not.toContain('99');
      expect(result).toContain("a.name = 'Alice'");
    });
  });

  // ── Placeholder filtering ─────────────────────────────────────────────

  describe('placeholder filtering', () => {
    it('should exclude rules with placeholder field name', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: '~', operator: '=', value: 'nope', meta: filterMeta },
          { field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher' });
      expect(result).not.toContain('nope');
      expect(result).toContain("a.name = 'Alice'");
    });

    it('should exclude rules with placeholder operator name', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'a.name', operator: '~', value: 'nope', meta: filterMeta },
          { field: 'a.age', operator: '>', value: 30, meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher' });
      expect(result).not.toContain('nope');
      expect(result).toContain('a.age > 30');
    });

    it('should support custom placeholder names', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: '__NONE__', operator: '=', value: 'skip', meta: filterMeta },
          { field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        placeholderFieldName: '__NONE__',
      });
      expect(result).not.toContain('skip');
      expect(result).toContain("a.name = 'Alice'");
    });
  });

  // ── Nested groups ─────────────────────────────────────────────────────

  describe('nested groups', () => {
    it('should process rules in nested groups', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'a.age', operator: '>', value: '25', meta: filterMeta },
          {
            combinator: 'or',
            rules: [
              { field: 'a.name', operator: '=', value: '30', meta: filterMeta },
              { field: 'a.score', operator: '<', value: '100', meta: filterMeta },
            ],
          },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher', parseNumbers: true });
      expect(result).toContain('a.age > 25');
      expect(result).toContain('a.name = 30 OR a.score < 100');
    });

    it('should filter placeholders in nested groups', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            combinator: 'or',
            rules: [
              { field: '~', operator: '=', value: 'skip', meta: filterMeta },
              { field: 'a.name', operator: '=', value: 'Alice', meta: filterMeta },
            ],
          },
        ],
      };
      const result = formatGraphQuery(query, { format: 'cypher' });
      expect(result).not.toContain('skip');
      expect(result).toContain("a.name = 'Alice'");
    });
  });

  // ── Custom processors ──────────────────────────────────────────────────

  describe('custom ruleProcessor', () => {
    it('should use custom ruleProcessor for Cypher', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: '_type',
            operator: 'is',
            value: 'Person',
            meta: patternMeta({ nodeAlias: 'p', nodeLabel: 'Person' }),
          },
          { field: 'p.name', operator: '=', value: 'Alice', meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        ruleProcessor: rule => `CUSTOM(${rule.field}, '${rule.value}')`,
      });
      expect(result).toContain('MATCH (p:Person)');
      expect(result).toContain("WHERE CUSTOM(p.name, 'Alice')");
    });

    it('should use custom ruleProcessor for SPARQL', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: 'foaf:name',
            operator: 'has',
            value: '?name',
            meta: { graphRole: 'pattern', subject: '?person' } satisfies SparqlPatternMeta,
          },
          { field: '?name', operator: '=', value: 'Alice', meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'sparql',
        ruleProcessor: rule => `CUSTOM(${rule.field}, ${rule.value})`,
      });
      expect(result).toContain('?person foaf:name ?name .');
      expect(result).toContain('FILTER (CUSTOM(?name, Alice))');
    });

    it('should use custom ruleProcessor for Gremlin', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'name', operator: '=', value: 'Alice', meta: filterMeta }],
      };
      const result = formatGraphQuery(query, {
        format: 'gremlin',
        ruleProcessor: rule => `.custom('${rule.field}', '${rule.value}')`,
      });
      expect(result).toBe("g.V().custom('name', 'Alice')");
    });
  });

  describe('custom ruleGroupProcessor', () => {
    it('should use custom ruleGroupProcessor for Cypher', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'a.x', operator: '=', value: 1, meta: filterMeta },
          { field: 'a.y', operator: '=', value: 2, meta: filterMeta },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        ruleGroupProcessor: (rg, { ruleProcessor }) => {
          const parts = rg.rules
            .filter(r => typeof r !== 'string' && !('rules' in r))
            .map(r => ruleProcessor(r as RuleType));
          return `CUSTOM_GROUP(${parts.join('; ')})`;
        },
      });
      expect(result).toContain('WHERE CUSTOM_GROUP(a.x = 1; a.y = 2)');
    });

    it('should pass ruleGroupProcessor for recursion', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'a.x', operator: '=', value: 1, meta: filterMeta },
          {
            combinator: 'or',
            rules: [
              { field: 'a.y', operator: '=', value: 2, meta: filterMeta },
              { field: 'a.z', operator: '=', value: 3, meta: filterMeta },
            ],
          },
        ],
      };
      const result = formatGraphQuery(query, {
        format: 'cypher',
        ruleGroupProcessor: (rg, { ruleProcessor, ruleGroupProcessor: self }) => {
          const parts: string[] = [];
          for (const r of rg.rules) {
            if (typeof r === 'string') continue;
            if ('rules' in r) {
              parts.push(`[${self(r, { ruleProcessor, ruleGroupProcessor: self })}]`);
            } else {
              parts.push(ruleProcessor(r));
            }
          }
          return parts.join(' + ');
        },
      });
      expect(result).toContain('WHERE a.x = 1 + [a.y = 2 + a.z = 3]');
    });
  });
});
