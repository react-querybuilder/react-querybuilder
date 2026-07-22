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
