import type { DefaultRuleType } from '../../types';
import { parseGremlin } from './parseGremlin';

describe('parseGremlin', () => {
  it('parses has() equality', () => {
    const result = parseGremlin("g.V().has('name', 'Alice')");
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(1);
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.field).toBe('name');
    expect(rule.operator).toBe('=');
    expect(rule.value).toBe('Alice');
  });

  it('parses predicate functions', () => {
    const predicates: [string, string, unknown][] = [
      ["has('age', gt(30))", '>', 30],
      ["has('age', lt(30))", '<', 30],
      ["has('age', gte(30))", '>=', 30],
      ["has('age', lte(30))", '<=', 30],
      ["has('age', neq(30))", '!=', 30],
    ];

    for (const [step, expectedOp, expectedValue] of predicates) {
      const result = parseGremlin(`g.V().${step}`);
      const rule = result.rules.find(r => 'field' in r && r.field === 'age') as DefaultRuleType;
      expect(rule).toBeDefined();
      expect(rule.operator).toBe(expectedOp);
      expect(rule.value).toBe(expectedValue);
    }
  });

  it('parses text predicates', () => {
    const ops: [string, string][] = [
      ['containing', 'contains'],
      ['notContaining', 'doesNotContain'],
      ['startingWith', 'beginsWith'],
      ['notStartingWith', 'doesNotBeginWith'],
      ['endingWith', 'endsWith'],
      ['notEndingWith', 'doesNotEndWith'],
    ];

    for (const [predicate, expectedOp] of ops) {
      const result = parseGremlin(`g.V().has('name', ${predicate}('test'))`);
      const rule = result.rules[0] as DefaultRuleType;
      expect(rule.operator).toBe(expectedOp);
      expect(rule.value).toBe('test');
    }
  });

  it('parses within (in)', () => {
    const result = parseGremlin("g.V().has('status', within('active', 'pending'))");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('in');
    expect(rule.value).toEqual(['active', 'pending']);
  });

  it('parses without (notIn)', () => {
    const result = parseGremlin("g.V().has('status', without('inactive'))");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notIn');
    expect(rule.value).toEqual(['inactive']);
  });

  it('parses between', () => {
    const result = parseGremlin("g.V().has('age', between(25, 65))");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('between');
    expect(rule.value).toEqual([25, 65]);
  });

  it('parses outside (notBetween)', () => {
    const result = parseGremlin("g.V().has('age', outside(25, 65))");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notBetween');
    expect(rule.value).toEqual([25, 65]);
  });

  it('parses hasNot (null check)', () => {
    const result = parseGremlin("g.V().hasNot('email')");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('null');
    expect(rule.field).toBe('email');
  });

  it('parses has() with single arg (notNull/exists)', () => {
    const result = parseGremlin("g.V().has('email')");
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notNull');
    expect(rule.field).toBe('email');
  });

  it('skips hasLabel steps (pattern)', () => {
    const result = parseGremlin("g.V().hasLabel('Person').has('age', gt(30))");
    // hasLabel should be skipped, only has() returned
    expect(result.rules.length).toBe(1);
    expect((result.rules[0] as DefaultRuleType).field).toBe('age');
  });

  it('skips out/in/both traversal steps', () => {
    const result = parseGremlin("g.V().hasLabel('Person').out('knows').has('name', 'Alice')");
    expect(result.rules.length).toBe(1);
    expect((result.rules[0] as DefaultRuleType).field).toBe('name');
  });

  it('skips as() steps', () => {
    const result = parseGremlin("g.V().hasLabel('Person').as('a').has('age', gt(30))");
    expect(result.rules.length).toBe(1);
    expect((result.rules[0] as DefaultRuleType).field).toBe('age');
  });

  it('parses bare .has() chain', () => {
    const result = parseGremlin(".has('age', gt(30)).has('name', 'Alice')");
    expect(result.rules.length).toBe(2);
  });

  it('handles empty traversal', () => {
    const result = parseGremlin('g.V()');
    expect(result.rules.length).toBe(0);
  });

  it('handles empty string', () => {
    const result = parseGremlin('');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });

  it('parses multiple has() steps as AND', () => {
    const result = parseGremlin("g.V().has('age', gt(30)).has('name', 'Alice')");
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(2);
  });
});
