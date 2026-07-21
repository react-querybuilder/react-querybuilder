import type { RuleGroupType, RuleType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import {
  expressionRuleProcessorCEL,
  expressionRuleProcessorCypher,
  expressionRuleProcessorJSONata,
  expressionRuleProcessorSPARQL,
  expressionRuleProcessorSpEL,
  getExpressionRuleProcessorCEL,
} from '../index';
import type { ExpressionNode, ResolvedExpressions } from '../types';

const field = (f: string): ExpressionNode => ({ kind: 'field', field: f });
const value = (v: unknown, valueType?: string): ExpressionNode => ({
  kind: 'value',
  value: v,
  valueType,
});
const fn = (name: string, ...args: ExpressionNode[]): ExpressionNode => ({
  kind: 'func',
  fn: name,
  args,
});

const exprRule = (
  rule: Partial<RuleType> & { operator: string },
  { lhs, rhs, rhs2 }: ResolvedExpressions = {}
): RuleType => {
  const result = { field: '(expression)', value: '', ...rule } as RuleType;
  if (lhs) result.lhs = lhs;
  if (rhs || rhs2) {
    result.value = rhs2 ? [rhs, rhs2] : rhs;
    result.valueSource = 'expression';
  }
  return result;
};

const group = (...rules: RuleType[]): RuleGroupType => ({ combinator: 'and', rules });

describe('CEL processor', () => {
  const f = (q: RuleGroupType) =>
    formatQuery(q, { format: 'cel', ruleProcessor: expressionRuleProcessorCEL });

  it('serializes arithmetic on both sides', () => {
    expect(
      f(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toBe('(price * qty) == 100');
  });

  it('serializes abs/min/max/mod and string funcs', () => {
    expect(
      f(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('abs', field('discount')), rhs: value(5, 'number') }
          )
        )
      )
    ).toBe('(discount < 0 ? -discount : discount) >= 5');
    expect(
      f(
        group(
          exprRule(
            { operator: '>=' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toBe('(a < b ? a : b) >= 1');
    expect(
      f(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('max', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toBe('(a > b ? a : b) > 1');
    expect(
      f(
        group(
          exprRule(
            { field: 'name', operator: '=', value: 'ACME' },
            { lhs: fn('upper', field('name')) }
          )
        )
      )
    ).toBe(`name.upperAscii() == "ACME"`);
    expect(
      f(
        group(
          exprRule(
            { field: 'name', operator: '=', value: 'acme' },
            { lhs: fn('lower', field('name')) }
          )
        )
      )
    ).toBe(`name.lowerAscii() == "acme"`);
    expect(
      f(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
          )
        )
      )
    ).toBe('(n % 2) == 0');
  });

  it('handles null, between, and notBetween', () => {
    expect(
      f(
        group(
          exprRule({ field: 'rating', operator: 'null', value: null }, { lhs: field('rating') })
        )
      )
    ).toBe('rating == null');
    expect(
      f(
        group(
          exprRule({ field: 'rating', operator: 'notNull', value: null }, { lhs: field('rating') })
        )
      )
    ).toBe('rating != null');
    expect(
      f(
        group(
          exprRule(
            { field: 'qty', operator: 'between' },
            { rhs: value(1, 'number'), rhs2: fn('abs', field('d')) }
          )
        )
      )
    ).toBe('(qty >= 1 && qty <= (d < 0 ? -d : d))');
    expect(
      f(
        group(
          exprRule(
            { field: 'qty', operator: 'notBetween' },
            { rhs: value(1, 'number'), rhs2: value(10, 'number') }
          )
        )
      )
    ).toBe('(qty < 1 || qty > 10)');
  });

  it('renders field-source and plain-value RHS', () => {
    expect(
      f(
        group(
          exprRule(
            { operator: '<', value: 'other', valueSource: 'field' },
            { lhs: fn('abs', field('price')) }
          )
        )
      )
    ).toBe('(price < 0 ? -price : price) < other');
    expect(
      f(
        group(
          exprRule(
            { field: 'price', operator: '<', value: '5' },
            { lhs: fn('abs', field('price')) }
          )
        )
      )
    ).toBe('(price < 0 ? -price : price) < "5"');
  });

  it('falls back / omits appropriately', () => {
    const noExpr = group({ field: 'x', operator: '=', value: '1' } as RuleType);
    expect(f(noExpr)).toBe(formatQuery(noExpr, { format: 'cel' }));
    const emptyExpr = group(exprRule({ field: 'x', operator: '=', value: '1' }, {}));
    expect(f(emptyExpr)).toBe(formatQuery(emptyExpr, { format: 'cel' }));
    const invalid = exprRule({ operator: '=' }, { lhs: fn('add', field('a')) });
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(f(group(invalid, plain))).toBe(`x == "1"`);
    const incompleteBetween = exprRule(
      { field: 'q', operator: 'between' },
      { rhs: value(1, 'number') }
    );
    expect(f(group(incompleteBetween, plain))).toBe(`x == "1"`);
    // Unsupported operator with an expression defers to the stock processor.
    const unsupported = group(
      exprRule({ field: 'q', operator: 'in', value: '1,2' }, { lhs: fn('abs', field('q')) })
    );
    expect(f(unsupported)).toBe(formatQuery(unsupported, { format: 'cel' }));
  });

  it('supports custom serializers and default options', () => {
    const proc = getExpressionRuleProcessorCEL({ pow: (_o, a, b) => `pow(${a}, ${b})` });
    expect(
      proc(
        exprRule(
          { operator: '=' },
          { lhs: fn('pow', field('x'), value(2, 'number')), rhs: value(9, 'number') }
        )
      )
    ).toBe('pow(x, 2) == 9');
    expect(expressionRuleProcessorCEL({ field: 'x', operator: '=', value: '1' } as RuleType)).toBe(
      `x == "1"`
    );
  });

  it('escapes quotes when requested', () => {
    const rule = exprRule({ operator: '=' }, { lhs: field('name'), rhs: value('a"b') });
    expect(getExpressionRuleProcessorCEL()(rule, { escapeQuotes: true })).toBe(`name == "a\\"b"`);
  });

  it('omits a between whose lower bound is missing (rhs2-only)', () => {
    // lhs present (so we pass the early guard) + value=[null, node]: rhs falsy, rhs2 truthy →
    // covers the `expr.rhs || expr.rhs2` guard's right operand.
    const r = {
      field: 'q',
      operator: 'between',
      valueSource: 'expression',
      lhs: fn('abs', field('d')),
      value: [null, fn('abs', field('e'))],
    } as unknown as RuleType;
    const plain = { field: 'x', operator: '=', value: '1' } as RuleType;
    expect(f(group(r, plain))).toBe(`x == "1"`);
  });
});

describe('SpEL processor', () => {
  const f = (q: RuleGroupType) =>
    formatQuery(q, { format: 'spel', ruleProcessor: expressionRuleProcessorSpEL });
  it('serializes expressions', () => {
    expect(
      f(
        group(exprRule({ operator: '>=' }, { lhs: fn('abs', field('d')), rhs: value(5, 'number') }))
      )
    ).toBe('T(java.lang.Math).abs(d) >= 5');
    expect(
      f(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('max', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toBe('T(java.lang.Math).max(a, b) > 1');
    expect(
      f(
        group(exprRule({ field: 'n', operator: '=', value: 'X' }, { lhs: fn('upper', field('n')) }))
      )
    ).toBe(`n.toUpperCase() == 'X'`);
    expect(
      f(group(exprRule({ field: 'r', operator: 'notNull', value: null }, { lhs: field('r') })))
    ).toBe('r != null');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'between' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q >= 1 and q <= 9)');
    // Cover the remaining null and negated-between branches.
    expect(
      f(group(exprRule({ field: 'r', operator: 'null', value: null }, { lhs: field('r') })))
    ).toBe('r == null');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'notBetween' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q < 1 or q > 9)');
  });
});

describe('Cypher processor', () => {
  const f = (q: RuleGroupType) =>
    formatQuery(q, { format: 'cypher', ruleProcessor: expressionRuleProcessorCypher });
  it('serializes expressions', () => {
    expect(
      f(
        group(exprRule({ operator: '!=' }, { lhs: fn('abs', field('d')), rhs: value(5, 'number') }))
      )
    ).toBe('abs(d) <> 5');
    expect(
      f(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toBe('CASE WHEN a < b THEN a ELSE b END > 1');
    expect(
      f(
        group(exprRule({ field: 'n', operator: '=', value: 'X' }, { lhs: fn('lower', field('n')) }))
      )
    ).toBe(`toLower(n) = 'X'`);
    expect(
      f(group(exprRule({ field: 'r', operator: 'null', value: null }, { lhs: field('r') })))
    ).toBe('r IS NULL');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'notBetween' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q < 1 OR q > 9)');
    // Cover the remaining notNull and non-negated between branches.
    expect(
      f(group(exprRule({ field: 'r', operator: 'notNull', value: null }, { lhs: field('r') })))
    ).toBe('r IS NOT NULL');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'between' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q >= 1 AND q <= 9)');
  });
});

describe('SPARQL processor', () => {
  const f = (q: RuleGroupType) =>
    formatQuery(q, { format: 'sparql', ruleProcessor: expressionRuleProcessorSPARQL });
  it('serializes expressions with variable prefixing', () => {
    expect(
      f(group(exprRule({ operator: '=' }, { lhs: fn('abs', field('d')), rhs: value(5, 'number') })))
    ).toContain('ABS(?d) = 5');
    expect(
      f(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('mod', field('n'), value(2, 'number')), rhs: value(0, 'number') }
          )
        )
      )
    ).toContain('(?n - 2 * FLOOR(?n / 2)) = 0');
    expect(
      f(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('max', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toContain('IF(?a > ?b, ?a, ?b) > 1');
    expect(
      f(
        group(exprRule({ field: 'n', operator: '=', value: 'X' }, { lhs: fn('upper', field('n')) }))
      )
    ).toContain(`UCASE(?n) = "X"`);
    expect(
      f(group(exprRule({ field: 'r', operator: 'notNull', value: null }, { lhs: field('r') })))
    ).toContain('BOUND(?r)');
    expect(
      f(group(exprRule({ field: 'r', operator: 'null', value: null }, { lhs: field('r') })))
    ).toContain('!BOUND(?r)');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'between' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toContain('(?q >= 1 && ?q <= 9)');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'notBetween' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toContain('(?q < 1 || ?q > 9)');
  });

  it('leaves already-sigiled/prefixed variables unprefixed', () => {
    expect(
      f(
        group(exprRule({ operator: '=' }, { lhs: fn('abs', field('?d')), rhs: value(5, 'number') }))
      )
    ).toContain('ABS(?d) = 5');
    expect(
      f(
        group(
          exprRule({ operator: '=' }, { lhs: fn('abs', field('ns:d')), rhs: value(5, 'number') })
        )
      )
    ).toContain('ABS(ns:d) = 5');
  });
});

describe('JSONata processor', () => {
  const f = (q: RuleGroupType) =>
    formatQuery(q, { format: 'jsonata', ruleProcessor: expressionRuleProcessorJSONata });
  it('serializes expressions', () => {
    expect(
      f(
        group(
          exprRule(
            { operator: '=' },
            { lhs: fn('multiply', field('price'), field('qty')), rhs: value(100, 'number') }
          )
        )
      )
    ).toBe('(price * qty) = 100');
    expect(
      f(
        group(
          exprRule(
            { operator: '>' },
            { lhs: fn('min', field('a'), field('b')), rhs: value(1, 'number') }
          )
        )
      )
    ).toBe('$min([a, b]) > 1');
    expect(
      f(
        group(exprRule({ field: 'n', operator: '=', value: 'X' }, { lhs: fn('upper', field('n')) }))
      )
    ).toBe(`$uppercase(n) = "X"`);
    expect(
      f(group(exprRule({ field: 'r', operator: 'null', value: null }, { lhs: field('r') })))
    ).toBe('$not($exists(r))');
    expect(
      f(group(exprRule({ field: 'r', operator: 'notNull', value: null }, { lhs: field('r') })))
    ).toBe('$exists(r)');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'between' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q >= 1 and q <= 9)');
    expect(
      f(
        group(
          exprRule(
            { field: 'q', operator: 'notBetween' },
            { rhs: value(1, 'number'), rhs2: value(9, 'number') }
          )
        )
      )
    ).toBe('(q < 1 or q > 9)');
  });
});

describe('string-match operators with expression operands', () => {
  // Search term as an expression RHS (`value` sourced from an expression) is the primary use
  // case; an expression LHS and negated variants are also covered per format.
  const smRule = (
    operator: string,
    { lhs, rhs }: { lhs?: ExpressionNode; rhs?: ExpressionNode } = {}
  ): RuleType => {
    const result = { field: 'name', operator, value: 'foo' } as RuleType;
    if (lhs) result.lhs = lhs;
    if (rhs) {
      result.value = rhs;
      result.valueSource = 'expression';
    }
    return result;
  };
  const up = (f: string) => fn('upper', field(f));

  it('cel: expression LHS + expression RHS, bare-field RHS, literal RHS, and negation', () => {
    const f = (r: RuleType) =>
      formatQuery(group(r), { format: 'cel', ruleProcessor: expressionRuleProcessorCEL });
    expect(f(smRule('beginsWith', { lhs: up('a'), rhs: up('b') }))).toBe(
      'a.upperAscii().startsWith(b.upperAscii())'
    );
    expect(f(smRule('contains', { rhs: up('b') }))).toBe('name.contains(b.upperAscii())');
    expect(f(smRule('endsWith', { lhs: up('a') }))).toBe('a.upperAscii().endsWith("foo")');
    expect(f(smRule('doesNotContain', { rhs: up('b') }))).toBe('!name.contains(b.upperAscii())');
  });

  it('spel: contains/beginsWith/endsWith with expression RHS and negation', () => {
    const f = (r: RuleType) =>
      formatQuery(group(r), { format: 'spel', ruleProcessor: expressionRuleProcessorSpEL });
    expect(f(smRule('contains', { rhs: up('b') }))).toBe('name matches b.toUpperCase()');
    expect(f(smRule('beginsWith', { rhs: up('b') }))).toBe(
      `name matches '^'.concat(b.toUpperCase())`
    );
    expect(f(smRule('endsWith', { rhs: up('b') }))).toBe(
      `name matches b.toUpperCase().concat('$')`
    );
    expect(f(smRule('doesNotEndWith', { rhs: up('b') }))).toBe(
      `!(name matches b.toUpperCase().concat('$'))`
    );
  });

  it('cypher: STARTS WITH / CONTAINS / ENDS WITH with expression RHS and negation', () => {
    const f = (r: RuleType) =>
      formatQuery(group(r), { format: 'cypher', ruleProcessor: expressionRuleProcessorCypher });
    expect(f(smRule('beginsWith', { rhs: up('b') }))).toBe('name STARTS WITH toUpper(b)');
    expect(f(smRule('endsWith', { rhs: up('b') }))).toBe('name ENDS WITH toUpper(b)');
    expect(f(smRule('doesNotContain', { rhs: up('b') }))).toBe('NOT (name CONTAINS toUpper(b))');
  });

  it('sparql: STRSTARTS / STRENDS / CONTAINS with expression RHS and negation', () => {
    const f = (r: RuleType) =>
      formatQuery(group(r), { format: 'sparql', ruleProcessor: expressionRuleProcessorSPARQL });
    expect(f(smRule('beginsWith', { rhs: up('b') }))).toBe('STRSTARTS(?name, UCASE(?b))');
    expect(f(smRule('endsWith', { rhs: up('b') }))).toBe('STRENDS(?name, UCASE(?b))');
    expect(f(smRule('doesNotContain', { rhs: up('b') }))).toBe('!CONTAINS(?name, UCASE(?b))');
  });

  it('jsonata: $contains / $substring with expression RHS and negation', () => {
    const f = (r: RuleType) =>
      formatQuery(group(r), { format: 'jsonata', ruleProcessor: expressionRuleProcessorJSONata });
    expect(f(smRule('contains', { rhs: up('b') }))).toBe('$contains(name, $uppercase(b))');
    expect(f(smRule('beginsWith', { rhs: up('b') }))).toBe(
      '$substring(name, 0, $length($uppercase(b))) = $uppercase(b)'
    );
    expect(f(smRule('endsWith', { rhs: up('b') }))).toBe(
      '$substring(name, $length(name) - $length($uppercase(b))) = $uppercase(b)'
    );
    expect(f(smRule('doesNotBeginWith', { rhs: up('b') }))).toBe(
      '$not($substring(name, 0, $length($uppercase(b))) = $uppercase(b))'
    );
  });
});
