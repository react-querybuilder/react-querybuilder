import type { ExportFormat, RuleGroupType } from '../../../types';
import { formatQuery } from '../formatQuery';
import { escapeSingleQuotedString, getJSPropertyAccessor, quoteCypherIdentifier } from '../utils';

const q = (rules: RuleGroupType['rules']): RuleGroupType => ({ combinator: 'and', rules });

describe('helpers', () => {
  it('escapeSingleQuotedString', () => {
    expect(escapeSingleQuotedString(`a'b\\c`)).toBe(`a\\'b\\\\c`);
    expect(escapeSingleQuotedString('abc')).toBe('abc');
    expect(escapeSingleQuotedString(undefined)).toBeUndefined();
    expect(escapeSingleQuotedString(null)).toBeNull();
  });

  it('quoteCypherIdentifier', () => {
    expect(quoteCypherIdentifier('n.first_name')).toBe('n.first_name');
    expect(quoteCypherIdentifier('n.first name')).toBe('n.`first name`');
    expect(quoteCypherIdentifier('n.a`b')).toBe('n.`a``b`');
    expect(quoteCypherIdentifier('1abc')).toBe('`1abc`');
  });

  it('getJSPropertyAccessor', () => {
    expect(getJSPropertyAccessor('a.b')).toBe('this.a.b');
    expect(getJSPropertyAccessor('a.b c')).toBe('this.a["b c"]');
    expect(getJSPropertyAccessor(`a"b`, 'doc')).toBe('doc["a\\"b"]');
  });
});

describe('cypher', () => {
  it('leaves plain identifiers unchanged', () => {
    expect(
      formatQuery(
        q([{ field: 'n.a', operator: '=', value: 'n.b', valueSource: 'field' }]),
        'cypher'
      )
    ).toBe('n.a = n.b');
  });

  it('backtick-quotes non-identifier segments', () => {
    expect(
      formatQuery(
        q([
          { field: 'n.a b', operator: '=', value: 'x' },
          { field: 'n.a`b', operator: 'in', value: 'n.c d, n.e', valueSource: 'field' },
          { field: 'n.a b', operator: 'between', value: 'n.c d, n.e', valueSource: 'field' },
        ]),
        'cypher'
      )
    ).toBe(
      "n.`a b` = 'x' AND n.`a``b` IN [n.`c d`, n.e] AND n.`c d` <= n.`a b` AND n.`a b` <= n.e"
    );
  });
});

describe('gremlin', () => {
  it('escapes property keys', () => {
    expect(formatQuery(q([{ field: `n.a'b\\`, operator: '=', value: 'x' }]), 'gremlin')).toBe(
      `.has('a\\'b\\\\', 'x')`
    );
  });
});

describe('elasticsearch', () => {
  it('escapes field-source values in painless scripts', () => {
    const out = JSON.stringify(
      formatQuery(
        q([
          { field: `a'b`, operator: 'in', value: [`c'd`, 'e'], valueSource: 'field' },
          { field: `a'b`, operator: 'between', value: [`c'd`, `e\\f`], valueSource: 'field' },
        ]),
        'elasticsearch'
      )
    );
    expect(out).not.toMatch(/[^\\]'d/);
    expect(out).toContain(String.raw`doc['c\\'d'].value`);
    expect(out).toContain(String.raw`doc['e\\\\f'].value`);
  });
});

describe('mongodb_query $where', () => {
  it('leaves plain paths unchanged', () => {
    expect(
      formatQuery(
        q([{ field: 'a.b', operator: 'contains', value: 'c', valueSource: 'field' }]),
        'mongodb_query'
      )
    ).toEqual({ $where: 'this.a.b.includes(this.c)' });
  });

  it('bracket-quotes non-identifier segments', () => {
    expect(
      formatQuery(
        q([
          { field: 'a b', operator: 'beginsWith', value: 'c)||1', valueSource: 'field' },
          { field: 'a', operator: 'notIn', value: ['b"c', 'd'], valueSource: 'field' },
        ]),
        'mongodb_query'
      )
    ).toEqual({
      $and: [
        { $where: 'this["a b"].startsWith(this["c)||1"])' },
        { $where: '![this["b\\"c"],this.d].includes(this.a)' },
      ],
    });
  });
});

// Hostile field names must not break out of quoted contexts: after stripping well-formed
// quoted literals/identifiers, no payload fragment (`true`) may remain
describe('cross-format hostile field names', () => {
  const sq = /'(?:[^'\\]|\\.)*'/g;
  const dq = /"(?:[^"\\]|\\.)*"/g;
  const bt = /`(?:[^`]|``)*`/g;
  // Collect script/$where strings from structured output
  const scripts = (o: unknown): string[] =>
    typeof o !== 'object' || o === null
      ? []
      : Object.entries(o).flatMap(([k, v]) =>
          (k === 'script' || k === '$where') && typeof v === 'string' ? [v] : scripts(v)
        );
  const cases: [ExportFormat, string, RegExp, boolean][] = [
    ['cypher', 'n.x = 1 OR true OR n.y', bt, true],
    ['gql', 'n.x OR true OR y', bt, true],
    // Field-source values are emitted verbatim in Gremlin (documented)
    ['gremlin', `x', true, 'y`, sq, false],
    ['elasticsearch', `x'].value || true || doc['y`, sq, true],
    ['mongodb_query', 'x)||true||(this.y', dq, true],
  ];

  // Union format arg doesn't match any single overload
  const fq = formatQuery as (query: RuleGroupType, format: ExportFormat) => unknown;
  it.each(cases)('%s', (format, field, strip, withFieldValues) => {
    const out = fq(
      q([
        { field, operator: '=', value: 'x' },
        ...(withFieldValues
          ? ([
              { field, operator: 'contains', value: field, valueSource: 'field' },
              { field, operator: 'in', value: [field, 'z'], valueSource: 'field' },
            ] as const)
          : []),
      ]),
      format
    );
    const strs = typeof out === 'string' ? [out] : scripts(out);
    expect(strs.length).toBeGreaterThan(0);
    for (const s of strs) expect(s.replaceAll(strip, '')).not.toContain('true');
  });
});
