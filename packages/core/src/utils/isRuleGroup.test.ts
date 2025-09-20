import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC, isRuleType } from './isRuleGroup';

const rule: RuleType = {
  field: 'test',
  operator: '=',
  value: 'test value',
};
const ruleGroup: RuleGroupType = {
  combinator: 'and',
  rules: [],
};
const ruleGroupIC: RuleGroupTypeIC = {
  rules: [],
};

describe('isRuleType', () => {
  it('tests for null/undefined/primitives/etc', () => {
    expect(isRuleType(null)).toBe(false);
    expect((isRuleType as unknown as () => void)()).toBe(false);
    expect(isRuleType({})).toBe(false);
    expect(isRuleType('')).toBe(false);
    expect(isRuleType('string')).toBe(false);
    expect(isRuleType(0)).toBe(false);
    expect(isRuleType(1)).toBe(false);
    expect(isRuleType(true)).toBe(false);
    expect(isRuleType(false)).toBe(false);
  });

  it('identifies a rule', () => {
    expect(isRuleType(rule)).toBe(true);
  });

  it('identifies a rule group', () => {
    expect(isRuleType(ruleGroup)).toBe(false);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleType(ruleGroupIC)).toBe(false);
  });
});

describe('isRuleGroup', () => {
  it('tests for null/undefined/primitives/etc', () => {
    expect(isRuleGroup(null)).toBe(false);
    expect((isRuleGroup as unknown as () => void)()).toBe(false);
    expect(isRuleGroup({})).toBe(false);
    expect(isRuleGroup('')).toBe(false);
    expect(isRuleGroup('string')).toBe(false);
    expect(isRuleGroup(0)).toBe(false);
    expect(isRuleGroup(1)).toBe(false);
    expect(isRuleGroup(true)).toBe(false);
    expect(isRuleGroup(false)).toBe(false);
  });
});

describe('isRuleGroupType', () => {
  it('identifies a rule', () => {
    expect(isRuleGroupType(rule)).toBe(false);
  });

  it('identifies a rule group', () => {
    expect(isRuleGroupType(ruleGroup)).toBe(true);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleGroupType(ruleGroupIC)).toBe(false);
  });
});

describe('isRuleGroupTypeIC', () => {
  it('identifies a rule', () => {
    expect(isRuleGroupTypeIC(rule)).toBe(false);
  });

  it('identifies a rule group', () => {
    expect(isRuleGroupTypeIC(ruleGroup)).toBe(false);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleGroupTypeIC(ruleGroupIC)).toBe(true);
  });
});
