import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types/index.noReact';
import { isRuleGroup, isRuleGroupType, isRuleGroupTypeIC } from './isRuleGroup';

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

describe('isRuleGroup', () => {
  it('tests for null/undefined/primitives/etc', () => {
    expect(isRuleGroup(null)).toBe(false);
    expect(isRuleGroup(undefined)).toBe(false);
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
