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

  describe('prefixed names', () => {
    const ageGt30 = [{ field: '?age', operator: '>', value: 30 }];

    it('handles undeclared empty prefix', () => {
      expect(parseSPARQL('SELECT ?p WHERE { ?p :age ?age . FILTER(?age > 30) }').rules).toEqual(
        ageGt30
      );
    });

    it('handles declared empty prefix', () => {
      expect(
        parseSPARQL('PREFIX : <http://x/> SELECT ?p WHERE { ?p :age ?age . FILTER(?age > 30) }')
          .rules
      ).toEqual(ageGt30);
    });

    it('preserves empty prefix in values', () => {
      expect(parseSPARQL('?x = :foo').rules).toEqual([
        { field: '?x', operator: '=', value: ':foo' },
      ]);
      expect(parseSPARQL('SELECT * WHERE { FILTER(?x = :foo) }').rules).toEqual([
        { field: '?x', operator: '=', value: ':foo' },
      ]);
    });

    it('preserves named prefix and full IRI in values', () => {
      expect(parseSPARQL('?x = ex:foo').rules).toEqual([
        { field: '?x', operator: '=', value: 'ex:foo' },
      ]);
      expect(parseSPARQL('?x = <http://x/foo>').rules).toEqual([
        { field: '?x', operator: '=', value: 'http://x/foo' },
      ]);
    });

    it('does not treat blank nodes as prefixed names', () => {
      expect(parseSPARQL('SELECT * WHERE { ?s ?p _:b . FILTER(?age > 30) }').rules).toEqual(
        ageGt30
      );
    });

    it('handles prefixes containing hyphens and dots', () => {
      expect(
        parseSPARQL('SELECT * WHERE { ?s my-ns:a ?x . ?s a.b:c ?age . FILTER(?age > 30) }').rules
      ).toEqual(ageGt30);
    });

    it('treats prefix names as case-sensitive', () => {
      // `ex` undeclared despite `EX` declaration → needs stub
      expect(
        parseSPARQL(
          'PREFIX EX: <http://x/> SELECT * WHERE { ?s EX:a ?t . ?s ex:b ?age . FILTER(?age > 30) }'
        ).rules
      ).toEqual(ageGt30);
      // lowercase `prefix` keyword still recognized as a declaration (no duplicate stub)
      expect(
        parseSPARQL('prefix ex: <http://x/> SELECT * WHERE { ?s ex:b ?age . FILTER(?age > 30) }')
          .rules
      ).toEqual(ageGt30);
    });

    it('ignores colons in IRIs and string literals', () => {
      expect(
        parseSPARQL('SELECT * WHERE { ?s <urn:a:b> ?t . FILTER(?t = "12:30" && ?age > 30) }').rules
      ).toEqual([{ field: '?t', operator: '=', value: '12:30' }, ...ageGt30]);
    });
  });
});
