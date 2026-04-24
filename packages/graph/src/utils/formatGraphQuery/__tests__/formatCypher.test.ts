import type { RuleGroupType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { CypherPatternMeta, CypherFilterMeta } from '../../../types';
import { formatCypher, formatGQL, formatCypherWhereClause } from '../formatCypher';

const patternMeta = (
  overrides: Partial<CypherPatternMeta> & { nodeAlias: string }
): CypherPatternMeta => ({ graphRole: 'pattern', ...overrides });

const filterMeta: CypherFilterMeta = { graphRole: 'filter' };

describe('formatCypher', () => {
  it('should format a simple single-node query', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: patternMeta({ nodeAlias: 'a', nodeLabel: 'Person' }),
        },
        { field: 'a.age', operator: '>', value: 30, meta: filterMeta },
      ],
    };
    const result = formatCypher(query);
    expect(result).toContain('MATCH (a:Person)');
    expect(result).toContain('WHERE a.age > 30');
    expect(result).toContain('RETURN a');
  });

  it('should format a two-node relationship pattern', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: 'KNOWS',
          operator: 'binds',
          value: 'b',
          meta: patternMeta({
            nodeAlias: 'a',
            nodeLabel: 'Person',
            relType: 'KNOWS',
            targetAlias: 'b',
            targetLabel: 'Person',
            direction: 'outgoing',
          }),
        },
        { field: 'a.age', operator: '>', value: 25, meta: filterMeta },
        { field: 'b.name', operator: 'beginsWith', value: 'J', meta: filterMeta },
      ],
    };
    const result = formatCypher(query);
    expect(result).toContain('MATCH (a:Person)-[:KNOWS]->(b:Person)');
    expect(result).toContain('a.age > 25');
    expect(result).toContain("b.name STARTS WITH 'J'");
    expect(result).toContain('RETURN a, b');
  });

  it('should handle OPTIONAL MATCH', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: patternMeta({ nodeAlias: 'a', nodeLabel: 'Person' }),
        },
        {
          field: 'HAS_EMAIL',
          operator: 'binds',
          value: 'e',
          meta: patternMeta({
            nodeAlias: 'a',
            relType: 'HAS_EMAIL',
            targetAlias: 'e',
            targetLabel: 'Email',
            direction: 'outgoing',
            optional: true,
          }),
        },
      ],
    };
    const result = formatCypher(query);
    expect(result).toContain('MATCH (a:Person)');
    expect(result).toContain('OPTIONAL MATCH (a)-[:HAS_EMAIL]->(e:Email)');
  });

  it('should handle incoming relationships', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: 'MANAGES',
          operator: 'binds',
          value: 'mgr',
          meta: patternMeta({
            nodeAlias: 'emp',
            nodeLabel: 'Employee',
            relType: 'MANAGES',
            targetAlias: 'mgr',
            targetLabel: 'Manager',
            direction: 'incoming',
          }),
        },
      ],
    };
    const result = formatCypher(query);
    expect(result).toContain('(emp:Employee)<-[:MANAGES]-(mgr:Manager)');
  });

  it('should format all standard operators', () => {
    const ops: [string, string, unknown, string][] = [
      ['=', '=', 'Alice', "a.name = 'Alice'"],
      ['!=', '<>', 'Bob', "a.name <> 'Bob'"],
      ['<', '<', 30, 'a.name < 30'],
      ['>', '>', 30, 'a.name > 30'],
      ['<=', '<=', 30, 'a.name <= 30'],
      ['>=', '>=', 30, 'a.name >= 30'],
      ['contains', 'CONTAINS', 'test', "a.name CONTAINS 'test'"],
      ['doesNotContain', 'NOT', 'test', "NOT a.name CONTAINS 'test'"],
      ['beginsWith', 'STARTS WITH', 'J', "a.name STARTS WITH 'J'"],
      ['doesNotBeginWith', 'NOT', 'J', "NOT a.name STARTS WITH 'J'"],
      ['endsWith', 'ENDS WITH', 'son', "a.name ENDS WITH 'son'"],
      ['doesNotEndWith', 'NOT', 'son', "NOT a.name ENDS WITH 'son'"],
      ['null', 'IS NULL', null, 'a.name IS NULL'],
      ['notNull', 'IS NOT NULL', null, 'a.name IS NOT NULL'],
    ];

    for (const [operator, , value, expected] of ops) {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'a.name', operator, value, meta: filterMeta }],
      };
      expect(formatCypherWhereClause(query)).toContain(expected);
    }
  });

  it('should format IN and NOT IN with arrays', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'a.status', operator: 'in', value: ['active', 'pending'], meta: filterMeta },
      ],
    };
    const result = formatCypherWhereClause(query);
    expect(result).toContain("a.status IN ['active', 'pending']");
  });

  it('should format BETWEEN', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'a.age', operator: 'between', value: [25, 65], meta: filterMeta }],
    };
    const result = formatCypherWhereClause(query);
    expect(result).toContain('25 <= a.age AND a.age <= 65');
  });

  it('should handle nested OR groups', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'a.age', operator: '>', value: 25, meta: filterMeta },
        {
          combinator: 'or',
          rules: [
            { field: 'a.name', operator: 'contains', value: 'Smith', meta: filterMeta },
            { field: 'a.name', operator: 'beginsWith', value: 'J', meta: filterMeta },
          ],
        },
      ],
    };
    const result = formatCypherWhereClause(query);
    expect(result).toContain("a.age > 25 AND (a.name CONTAINS 'Smith' OR a.name STARTS WITH 'J')");
  });

  it('should handle NOT groups', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          combinator: 'and',
          not: true,
          rules: [{ field: 'a.age', operator: '<', value: 18, meta: filterMeta }],
        },
      ],
    };
    const result = formatCypherWhereClause(query);
    expect(result).toContain('NOT (a.age < 18)');
  });

  it('should respect includeReturn=false', () => {
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
    const result = formatCypher(query, { includeReturn: false });
    expect(result).not.toContain('RETURN');
  });

  it('should handle rules without meta as filter rules', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'name', operator: '=', value: 'Alice' }],
    };
    const result = formatCypherWhereClause(query);
    expect(result).toBe("name = 'Alice'");
  });

  it('should produce empty output for empty query', () => {
    const query: RuleGroupType = { combinator: 'and', rules: [] };
    const result = formatCypher(query);
    expect(result).toBe('');
  });
});

describe('formatGQL', () => {
  it('should produce same output as formatCypher for basic queries', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: '_type',
          operator: 'is',
          value: 'Person',
          meta: patternMeta({ nodeAlias: 'a', nodeLabel: 'Person' }),
        },
        { field: 'a.age', operator: '>', value: 30, meta: filterMeta },
      ],
    };
    const cypherResult = formatCypher(query, { dialect: 'cypher' });
    const gqlResult = formatGQL(query);
    // GQL is ~95% compatible, basic queries should be identical
    expect(gqlResult).toBe(cypherResult);
  });
});
