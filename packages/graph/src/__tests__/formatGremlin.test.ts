import type { RuleGroupType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import { formatGremlin } from '../formatGremlin';
import type { GremlinPatternMeta, GremlinFilterMeta } from '../types';

const gremlinPattern = (overrides: Partial<GremlinPatternMeta> = {}): GremlinPatternMeta => ({
  graphRole: 'pattern',
  graphLang: 'gremlin',
  ...overrides,
});

const filterMeta: GremlinFilterMeta = { graphRole: 'filter', graphLang: 'gremlin' };

describe('formatGremlin', () => {
  it('should format a basic label + filter query', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          field: '_label',
          operator: 'hasLabel',
          value: 'Person',
          meta: gremlinPattern({ stepLabel: 'a' }),
        },
        { field: 'a.age', operator: '>', value: 30, meta: filterMeta },
      ],
    };
    const result = formatGremlin(query);
    expect(result).toContain('g.V()');
    expect(result).toContain(".hasLabel('Person')");
    expect(result).toContain(".as('a')");
    expect(result).toContain(".has('age', gt(30))");
  });

  it('should format edge traversals', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: '_label', operator: 'hasLabel', value: 'Person', meta: gremlinPattern() },
        {
          field: 'knows',
          operator: 'traverses',
          value: 'out',
          meta: gremlinPattern({ edgeLabel: 'knows', direction: 'out' }),
        },
      ],
    };
    const result = formatGremlin(query);
    expect(result).toContain(".hasLabel('Person')");
    expect(result).toContain(".out('knows')");
  });

  it('should format all comparison operators', () => {
    const ops: [string, string][] = [
      ['=', ".has('age', 30)"],
      ['!=', ".has('age', neq(30))"],
      ['<', ".has('age', lt(30))"],
      ['>', ".has('age', gt(30))"],
      ['<=', ".has('age', lte(30))"],
      ['>=', ".has('age', gte(30))"],
    ];

    for (const [operator, expected] of ops) {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'age', operator, value: 30, meta: filterMeta }],
      };
      const result = formatGremlin(query);
      expect(result).toContain(expected);
    }
  });

  it('should format string operators', () => {
    const ops: [string, string][] = [
      ['contains', "containing('test')"],
      ['doesNotContain', "notContaining('test')"],
      ['beginsWith', "startingWith('test')"],
      ['doesNotBeginWith', "notStartingWith('test')"],
      ['endsWith', "endingWith('test')"],
      ['doesNotEndWith', "notEndingWith('test')"],
    ];

    for (const [operator, expectedPredicate] of ops) {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'name', operator, value: 'test', meta: filterMeta }],
      };
      const result = formatGremlin(query);
      expect(result).toContain(expectedPredicate);
    }
  });

  it('should format null/notNull operators', () => {
    const queryNull: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'email', operator: 'null', value: null, meta: filterMeta }],
    };
    expect(formatGremlin(queryNull)).toContain(".hasNot('email')");

    const queryNotNull: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'email', operator: 'notNull', value: null, meta: filterMeta }],
    };
    expect(formatGremlin(queryNotNull)).toContain(".has('email')");
  });

  it('should format in/notIn with within/without', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'status', operator: 'in', value: ['active', 'pending'], meta: filterMeta }],
    };
    const result = formatGremlin(query);
    expect(result).toContain("within('active', 'pending')");
  });

  it('should format between/notBetween', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'age', operator: 'between', value: [25, 65], meta: filterMeta }],
    };
    const result = formatGremlin(query);
    expect(result).toContain('between(25, 65)');
  });

  it('should use custom traversal source', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: '_label', operator: 'hasLabel', value: 'Person', meta: gremlinPattern() }],
    };
    const result = formatGremlin(query, { traversalSource: 'myGraph' });
    expect(result).toMatch(/^myGraph\.V\(\)/);
  });

  it('should handle in/out/both directions', () => {
    const directions: ('out' | 'in' | 'both')[] = ['out', 'in', 'both'];
    for (const dir of directions) {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            field: 'knows',
            operator: 'traverses',
            value: dir,
            meta: gremlinPattern({ edgeLabel: 'knows', direction: dir }),
          },
        ],
      };
      const result = formatGremlin(query);
      expect(result).toContain(`.${dir}('knows')`);
    }
  });
});
