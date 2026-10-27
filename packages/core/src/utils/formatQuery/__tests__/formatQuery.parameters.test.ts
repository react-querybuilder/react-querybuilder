import type { RuleGroupType } from '../../../types';
import { formatQuery } from '../formatQuery';
import { stripParamPrefix, withParamPrefix } from '../utils';

const query: RuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'f1', operator: '=', value: 'p1', valueSource: 'parameter' },
    { field: 'f2', operator: '=', value: ':p2', valueSource: 'parameter' },
  ],
};

describe('parameter value source', () => {
  describe('sql', () => {
    it('prefixes parameter names, respecting existing prefix', () => {
      expect(formatQuery(query, 'sql')).toBe('(f1 = :p1 and f2 = :p2)');
    });

    it('uses the dialect param prefix', () => {
      expect(formatQuery(query, { format: 'sql', paramPrefix: '@' })).toBe(
        '(f1 = @p1 and f2 = @:p2)'
      );
    });
  });

  describe('parameterized', () => {
    it('emits parameter references inline without adding to params array', () => {
      expect(formatQuery(query, 'parameterized')).toEqual({
        sql: '(f1 = :p1 and f2 = :p2)',
        params: [],
      });
    });
  });

  describe('parameterized_named', () => {
    it('registers parameter keys with null values', () => {
      const result = formatQuery(query, 'parameterized_named');
      expect(result.sql).toBe('(f1 = :p1 and f2 = :p2)');
      expect(Object.keys(result.params)).toEqual(['p1', 'p2']);
      expect(result.params.p1).toBeNull();
    });

    it('keeps the prefix in keys when paramsKeepPrefix is set', () => {
      const result = formatQuery(query, { format: 'parameterized_named', paramsKeepPrefix: true });
      expect(Object.keys(result.params)).toEqual([':p1', ':p2']);
    });
  });

  describe('between/notBetween operators', () => {
    const betweenQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'f1', operator: 'between', value: 'p1,p2', valueSource: 'parameter' }],
    };

    it('joins the two parameter references with "and" (sql)', () => {
      expect(formatQuery(betweenQuery, 'sql')).toBe('(f1 between :p1 and :p2)');
    });

    it('emits both references inline without adding to params array (parameterized)', () => {
      expect(formatQuery(betweenQuery, 'parameterized')).toEqual({
        sql: '(f1 between :p1 and :p2)',
        params: [],
      });
    });

    it('registers both keys with null (parameterized_named)', () => {
      const result = formatQuery(betweenQuery, 'parameterized_named');
      expect(result.sql).toBe('(f1 between :p1 and :p2)');
      expect(Object.keys(result.params)).toEqual(['p1', 'p2']);
      expect(result.params.p1).toBeNull();
      expect(result.params.p2).toBeNull();
    });

    it('renders empty for fewer than two values (sql)', () => {
      const invalidQuery: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'f1', operator: 'between', value: 'p1', valueSource: 'parameter' }],
      };
      expect(formatQuery(invalidQuery, 'sql')).toBe('(1 = 1)');
    });
  });

  describe('in/notIn operators', () => {
    const inQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'f1', operator: 'in', value: 'p1,p2,p3', valueSource: 'parameter' }],
    };

    it('wraps parameter references in a parenthesized list (sql)', () => {
      expect(formatQuery(inQuery, 'sql')).toBe('(f1 in (:p1, :p2, :p3))');
    });

    it('emits references inline without adding to params array (parameterized)', () => {
      expect(formatQuery(inQuery, 'parameterized')).toEqual({
        sql: '(f1 in (:p1, :p2, :p3))',
        params: [],
      });
    });

    it('registers all keys with null (parameterized_named)', () => {
      const result = formatQuery(inQuery, 'parameterized_named');
      expect(result.sql).toBe('(f1 in (:p1, :p2, :p3))');
      expect(Object.keys(result.params)).toEqual(['p1', 'p2', 'p3']);
      expect(Object.values(result.params)).toEqual([null, null, null]);
    });

    it('renders empty for an empty value list (sql)', () => {
      const emptyQuery: RuleGroupType = {
        combinator: 'and',
        rules: [{ field: 'f1', operator: 'in', value: '', valueSource: 'parameter' }],
      };
      expect(formatQuery(emptyQuery, 'sql')).toBe('(1 = 1)');
    });
  });

  describe('string-match operators', () => {
    const mk = (operator: string): RuleGroupType => ({
      combinator: 'and',
      rules: [{ field: 'firstName', operator, value: 'p1', valueSource: 'parameter' }],
    });

    it('concatenates wildcards around the bind reference (sql)', () => {
      expect(formatQuery(mk('beginsWith'), 'sql')).toBe("(firstName like :p1 || '%')");
      expect(formatQuery(mk('endsWith'), 'sql')).toBe("(firstName like '%' || :p1)");
      expect(formatQuery(mk('contains'), 'sql')).toBe("(firstName like '%' || :p1 || '%')");
      expect(formatQuery(mk('doesNotContain'), 'sql')).toBe(
        "(firstName not like '%' || :p1 || '%')"
      );
    });

    it('respects the dialect param prefix', () => {
      expect(formatQuery(mk('contains'), { format: 'sql', paramPrefix: '@' })).toBe(
        "(firstName like '%' || @p1 || '%')"
      );
    });

    it('emits wildcards inline without adding to params array (parameterized)', () => {
      expect(formatQuery(mk('beginsWith'), 'parameterized')).toEqual({
        sql: "(firstName like :p1 || '%')",
        params: [],
      });
    });

    it('registers the key with null (parameterized_named)', () => {
      const result = formatQuery(mk('contains'), 'parameterized_named');
      expect(result.sql).toBe("(firstName like '%' || :p1 || '%')");
      expect(result.params).toEqual({ p1: null });
    });

    it('renders as a method/regex reference in CEL and SpEL (paradigm A)', () => {
      expect(formatQuery(mk('beginsWith'), 'cel')).toBe('firstName.startsWith(p1)');
      expect(formatQuery(mk('contains'), 'spel')).toBe(
        "firstName matches '.*'.concat(p1).concat('.*')"
      );
    });
  });

  describe('validation via parameters option', () => {
    it('drops rules referencing unknown parameters', () => {
      expect(
        formatQuery(query, { format: 'sql', getParameters: () => [{ name: 'p1', label: 'P1' }] })
      ).toBe('(f1 = :p1)');
    });

    it('accepts prefixed names in the parameters list', () => {
      expect(
        formatQuery(query, {
          format: 'sql',
          getParameters: () => [
            { name: 'p1', label: 'P1' },
            { name: ':p2', label: 'P2' },
          ],
        })
      ).toBe('(f1 = :p1 and f2 = :p2)');
    });
  });

  describe('non-SQL formats', () => {
    it('renders as a bare variable in CEL (paradigm A)', () => {
      expect(formatQuery(query, 'cel')).toBe('f1 == p1 && f2 == :p2');
    });

    it('renders as a bare variable in SpEL (paradigm A)', () => {
      expect(formatQuery(query, 'spel')).toBe('f1 == p1 and f2 == :p2');
    });

    it('renders as a literal in MongoDB (paradigm B)', () => {
      expect(formatQuery(query, 'mongodb')).toBe('{"$and":[{"f1":"p1"},{"f2":":p2"}]}');
    });
  });

  describe('prefix helpers', () => {
    it('withParamPrefix adds/keeps prefix and handles nullish + empty prefix', () => {
      expect(withParamPrefix('p1')).toBe(':p1');
      expect(withParamPrefix(':p1')).toBe(':p1');
      expect(withParamPrefix(undefined)).toBe(':');
      expect(withParamPrefix('p1', '')).toBe('p1');
    });

    it('stripParamPrefix removes prefix and handles nullish + empty prefix', () => {
      expect(stripParamPrefix(':p1')).toBe('p1');
      expect(stripParamPrefix('p1')).toBe('p1');
      expect(stripParamPrefix(undefined)).toBe('');
      expect(stripParamPrefix(':p1', '')).toBe(':p1');
    });
  });
});

describe('regex operators', () => {
  const q: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: 'matches', value: "a\\d'x", regexFlags: 'is' },
      { field: 'g', operator: 'doesNotMatch', value: '123' },
      { field: 'h', operator: 'matches', value: 'k', valueSource: 'field' },
      { field: 'i', operator: 'matches', value: 'p', valueSource: 'parameter' },
    ],
  };

  it('parameterized', () => {
    expect(formatQuery(q, { format: 'parameterized', preset: 'postgresql' })).toEqual({
      sql: `("f" ~* $1 and "g" !~ $2 and "h" ~ ('(?p)' || "k") and "i" ~ ('(?p)' || $p))`,
      params: ["a\\d'x", '(?p)123'],
    });
    expect(formatQuery(q, { format: 'parameterized', preset: 'mysql' })).toEqual({
      sql: "(`f` regexp CONCAT('(?is)', ?) and `g` not regexp ? and `h` regexp `k` and `i` regexp :p)",
      params: ["a\\d'x", '123'],
    });
    expect(formatQuery(q, { format: 'parameterized', preset: 'sqlite' })).toEqual({
      sql: `(f regexp ? and g not regexp ? and h regexp k and i regexp :p)`,
      params: ["(?is)a\\d'x", '123'],
    });
    expect(formatQuery(q, { format: 'parameterized' })).toEqual({
      sql: `(f like ? and g not like ? and h like '%' || k || '%' and i like '%' || :p || '%')`,
      params: ["%a\\d'x%", '%123%'],
    });
  });

  it('parameterized_named', () => {
    expect(formatQuery(q, { format: 'parameterized_named', preset: 'oracle' })).toEqual({
      sql: `(regexp_like(f, :f_1, 'in') and not regexp_like(g, :g_1) and regexp_like(h, k) and regexp_like(i, :p))`,
      params: { f_1: "a\\d'x", g_1: '123', p: null },
    });
    expect(
      formatQuery(q, { format: 'parameterized_named', preset: 'sqlite', paramsKeepPrefix: false })
    ).toEqual({
      sql: `(f regexp :f_1 and g not regexp :g_1 and h regexp k and i regexp :p)`,
      params: { f_1: "(?is)a\\d'x", g_1: '123', p: null },
    });
    // Flags on field/param patterns inlined via SQL concat
    const qFlags: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'h', operator: 'matches', value: 'k', valueSource: 'field', regexFlags: 'i' },
        { field: 'i', operator: 'matches', value: 'p', valueSource: 'parameter', regexFlags: 'm' },
      ],
    };
    expect(formatQuery(qFlags, { format: 'parameterized_named', preset: 'sqlite' }).sql).toBe(
      `(h regexp ('(?i)' || k) and i regexp ('(?m)' || :p))`
    );
    expect(formatQuery(qFlags, { format: 'parameterized_named', preset: 'postgresql' }).sql).toBe(
      `("h" ~* ('(?p)' || "k") and "i" ~ ('(?n)' || $p))`
    );
    expect(formatQuery(q, { format: 'parameterized_named', preset: 'sqlite' }).params).toEqual({
      ':f_1': "(?is)a\\d'x",
      ':g_1': '123',
      ':p': null,
    });
  });
});
