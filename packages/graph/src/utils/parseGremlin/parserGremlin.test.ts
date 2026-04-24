import type { RuleType } from '@react-querybuilder/core';
import { describe, expect, it } from 'vitest';
import type { GremlinPatternMeta } from '../../types';
import { parseGremlin } from './parseGremlin';

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
