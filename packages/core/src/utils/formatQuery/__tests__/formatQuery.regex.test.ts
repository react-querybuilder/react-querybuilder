import {
  defaultOperatorNegationMap,
  defaultOperators,
  defaultOperatorsWithRegex,
  defaultRegexOperators,
  regexOperators,
} from '../../../defaults';
import type { RuleGroupType, RuleType } from '../../../types';
import { shouldParseRegex } from '../../parserUtils';
import { formatCapabilities, getUnsupportedRuleFeature } from '../formatCapabilities';
import { formatQuery } from '../formatQuery';
import { negateOperator, negateRule } from '../negation';
import {
  isRegexOperator,
  isRegexRuleInvalid,
  isValidRegex,
  regexFallbackRule,
  sanitizeRegexFlags,
  toInlineFlagsRegex,
  toRegExpSource,
} from '../utils';

const matchesRule: RuleType = { field: 'f1', operator: 'matches', value: 'Te.st', regexFlags: 'i' };
const q = (...rules: RuleType[]): RuleGroupType => ({ combinator: 'and', rules });

describe('defaults', () => {
  it('excludes regex operators from defaultOperators', () => {
    expect(defaultOperators.some(o => regexOperators.has(o.name))).toBe(false);
    expect(defaultOperatorsWithRegex).toEqual([...defaultOperators, ...defaultRegexOperators]);
    expect(defaultOperatorNegationMap.matches).toBe('doesNotMatch');
    expect(defaultOperatorNegationMap.doesNotMatch).toBe('matches');
  });
});

describe('helpers', () => {
  it('isRegexOperator', () => {
    expect(isRegexOperator('matches')).toBe(true);
    expect(isRegexOperator('DoesNotMatch')).toBe(true);
    expect(isRegexOperator('contains')).toBe(false);
  });

  it('sanitizeRegexFlags', () => {
    expect(sanitizeRegexFlags('gimiy')).toBe('im');
    expect(sanitizeRegexFlags('imsux', 'is')).toBe('is');
    expect(sanitizeRegexFlags(undefined)).toBe('');
    expect(sanitizeRegexFlags(1)).toBe('');
  });

  it('toRegExpSource', () => {
    expect(toRegExpSource(/a.b/gi)).toBe('a.b');
    expect(toRegExpSource('a.b')).toBe('a.b');
  });

  it('isValidRegex', () => {
    expect(isValidRegex('a.b')).toBe(true);
    expect(isValidRegex('a.b', 'gi')).toBe(true);
    expect(isValidRegex('(')).toBe(false);
    expect(isValidRegex(12)).toBe(false);
  });

  it('toInlineFlagsRegex', () => {
    expect(toInlineFlagsRegex('a.b', 'gi')).toBe('(?i)a.b');
    expect(toInlineFlagsRegex('a.b', '')).toBe('a.b');
    expect(toInlineFlagsRegex('a.b', 'is', { full: true })).toBe('(?is).*(?:a.b).*');
    expect(toInlineFlagsRegex('a.b', 'is', { whitelist: 'i' })).toBe('(?i)a.b');
  });

  it('regexFallbackRule', () => {
    expect(regexFallbackRule(matchesRule)).toEqual({
      field: 'f1',
      operator: 'contains',
      value: 'Te.st',
    });
    expect(regexFallbackRule({ ...matchesRule, operator: 'doesNotMatch' }).operator).toBe(
      'doesNotContain'
    );
    const r: RuleType = { field: 'f1', operator: '=', value: 'x' };
    expect(regexFallbackRule(r)).toBe(r);
  });

  it('isRegexRuleInvalid', () => {
    expect(isRegexRuleInvalid(matchesRule)).toBe(false);
    expect(isRegexRuleInvalid({ ...matchesRule, value: '(' })).toBe(true);
    expect(isRegexRuleInvalid({ ...matchesRule, value: '(', valueSource: 'field' })).toBe(false);
    expect(isRegexRuleInvalid({ field: 'f1', operator: '=', value: '(' })).toBe(false);
  });

  it('negation', () => {
    expect(negateOperator('matches')).toBe('doesNotMatch');
    expect(negateOperator('doesnotmatch')).toBe('matches');
    expect(negateRule(matchesRule)).toEqual({ ...matchesRule, operator: 'doesNotMatch' });
  });

  it('getUnsupportedRuleFeature checks fallback operator', () => {
    expect(getUnsupportedRuleFeature(matchesRule, formatCapabilities.weaviate!)).toBeNull();
    expect(getUnsupportedRuleFeature(matchesRule, formatCapabilities.pinecone!)).toBe('operator');
  });
});

describe('shouldParseRegex', () => {
  it('honors explicit option', () => {
    expect(shouldParseRegex({ parseRegex: true }, 'f1')).toBe(true);
    expect(
      shouldParseRegex({ parseRegex: false, fields: [{ name: 'f1', label: 'F1' }] }, 'f1')
    ).toBe(false);
  });

  it('auto-detects from field operators', () => {
    const fields = [
      { name: 'f1', label: 'F1', operators: defaultOperatorsWithRegex },
      { name: 'f2', label: 'F2', operators: defaultOperators },
      { name: 'f3', label: 'F3' },
    ];
    expect(shouldParseRegex({ fields }, 'f1')).toBe(true);
    expect(shouldParseRegex({ fields }, 'f2')).toBe(false);
    expect(shouldParseRegex({ fields }, 'f3')).toBe(false);
    expect(shouldParseRegex({ fields }, 'nope')).toBe(false);
    expect(shouldParseRegex({}, 'f1')).toBe(false);
  });
});

describe('validation', () => {
  it('skips rules with invalid patterns', () => {
    expect(formatQuery(q({ field: 'f1', operator: 'matches', value: '(' }), 'ldap')).toBe('');
    expect(
      formatQuery(
        q(
          { field: 'f1', operator: 'matches', value: '(' },
          { field: 'f2', operator: '=', value: 'x' }
        ),
        'natural_language'
      )
    ).toBe(`f2 is 'x'`);
  });

  it('reports INVALID_VALUE diagnostic', () => {
    const res = formatQuery(
      q(
        { field: 'f1', operator: 'matches', value: '(' },
        { field: 'f1', operator: 'matches', value: '(', regexFlags: 'i' },
        { field: 'f1', operator: 'matches', value: '(', muted: true }
      ),
      'diagnostics'
    );
    const codes = res.diagnostics.map(d => d.code);
    expect(codes.filter(c => c === 'INVALID_VALUE')).toHaveLength(2);
    expect(codes).not.toContain('CUSTOM_VALIDATOR');
    expect(res.diagnostics[1].message).toContain('flags "i"');
    expect(res.stats.invalidRules).toBe(3);
  });
});

describe('natural_language', () => {
  it('formats matches/doesNotMatch', () => {
    expect(formatQuery(q(matchesRule), 'natural_language')).toBe(
      `f1 matches regular expression 'Te.st' with flags 'i'`
    );
    expect(
      formatQuery(q({ field: 'f1', operator: 'doesNotMatch', value: 'Te.st' }), 'natural_language')
    ).toBe(`f1 does not match regular expression 'Te.st'`);
  });
});

describe('fallback formats (contains)', () => {
  it('ldap', () => {
    expect(formatQuery(q(matchesRule), 'ldap')).toBe('(f1=*Te.st*)');
  });

  it('prisma', () => {
    expect(formatQuery(q(matchesRule), 'prisma')).toEqual(
      formatQuery(q({ field: 'f1', operator: 'contains', value: 'Te.st' }), 'prisma')
    );
  });

  it('vector formats', () => {
    for (const format of ['weaviate', 'milvus', 'qdrant'] as const) {
      expect(formatQuery(q(matchesRule), { format })).toEqual(
        formatQuery(q({ field: 'f1', operator: 'contains', value: 'Te.st' }), { format })
      );
    }
    for (const format of ['pinecone', 'chroma'] as const) {
      expect(formatQuery(q(matchesRule), { format })).toEqual({});
    }
  });
});
