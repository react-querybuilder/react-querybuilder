import type { DefaultRuleType } from '../../types';
import { parseSPARQL } from './parseSPARQL';

describe('parseSPARQL', () => {
  it('parses a full SPARQL query (extracts only FILTER conditions)', () => {
    const result = parseSPARQL(`
      SELECT ?person ?age
      WHERE {
        ?person foaf:age ?age .
        FILTER (?age > 30)
      }
    `);
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBeGreaterThanOrEqual(1);
    const filterRule = result.rules.find(
      r => 'operator' in r && r.operator === '>'
    ) as DefaultRuleType;
    expect(filterRule).toBeDefined();
    expect(filterRule.value).toBe(30);
  });

  it('parses a bare expression (auto-detect)', () => {
    const result = parseSPARQL('?age > 30 && ?name != "Alice"');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(2);
  });

  it('parses comparison operators', () => {
    const ops: [string, string][] = [
      ['?x = 42', '='],
      ['?x != 42', '!='],
      ['?x < 42', '<'],
      ['?x > 42', '>'],
      ['?x <= 42', '<='],
      ['?x >= 42', '>='],
    ];

    for (const [expr, expectedOp] of ops) {
      const result = parseSPARQL(expr);
      expect(result.rules.length).toBe(1);
      expect((result.rules[0] as DefaultRuleType).operator).toBe(expectedOp);
    }
  });

  it('parses CONTAINS function', () => {
    const result = parseSPARQL('CONTAINS(?name, "Smith")');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('contains');
    expect(rule.value).toBe('Smith');
  });

  it('parses STRSTARTS function', () => {
    const result = parseSPARQL('STRSTARTS(?name, "J")');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('beginsWith');
    expect(rule.value).toBe('J');
  });

  it('parses STRENDS function', () => {
    const result = parseSPARQL('STRENDS(?name, "son")');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('endsWith');
    expect(rule.value).toBe('son');
  });

  it('parses BOUND function (notNull)', () => {
    const result = parseSPARQL('BOUND(?x)');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('notNull');
  });

  it('parses !BOUND function (null)', () => {
    const result = parseSPARQL('!BOUND(?x)');
    const rule = result.rules[0] as DefaultRuleType;
    expect(rule.operator).toBe('null');
  });

  it('parses && as AND', () => {
    const result = parseSPARQL('?age > 25 && ?name = "Alice"');
    expect(result.rules.length).toBe(2);
  });

  it('parses || as OR', () => {
    const result = parseSPARQL('?age > 25 || ?name = "Alice"');
    expect(result.rules.length).toBe(1);
    const group = result.rules[0];
    expect('combinator' in group && group.combinator).toBe('or');
  });

  it('skips triple patterns (BGPs) and returns only FILTERs', () => {
    const result = parseSPARQL(`
      SELECT ?person ?name
      WHERE {
        ?person rdf:type foaf:Person .
        ?person foaf:name ?name .
      }
    `);
    // BGPs should be skipped — no rules returned
    expect(result.rules.length).toBe(0);
  });

  it('handles empty query', () => {
    const result = parseSPARQL('');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });

  it('handles parse errors gracefully', () => {
    const result = parseSPARQL('NOT VALID SPARQL @@@');
    expect(result.combinator).toBe('and');
    expect(result.rules.length).toBe(0);
  });

  it('handles empty WHERE block', () => {
    const result = parseSPARQL('SELECT ?x WHERE { }');
    expect(result.rules.length).toBe(0);
  });
});
