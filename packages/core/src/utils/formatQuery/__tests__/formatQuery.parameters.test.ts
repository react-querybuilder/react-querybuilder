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
      expect(formatQuery(query, { format: 'sql', parameters: [{ name: 'p1', label: 'P1' }] })).toBe(
        '(f1 = :p1)'
      );
    });

    it('accepts prefixed names in the parameters list', () => {
      expect(
        formatQuery(query, {
          format: 'sql',
          parameters: [
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
