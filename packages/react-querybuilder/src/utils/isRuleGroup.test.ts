import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types';
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
  it('identifies a rule', () => {
    expect(isRuleGroup(rule)).toBe(false);
  });

  it('identifies a rule group', () => {
    expect(isRuleGroup(ruleGroup)).toBe(true);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleGroup(ruleGroupIC)).toBe(true);
  });
});

describe('isRuleGroupType', () => {
  it('identifies a rule group', () => {
    expect(isRuleGroupType(ruleGroup)).toBe(true);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleGroupType(ruleGroupIC)).toBe(false);
  });
});

describe('isRuleGroupTypeIC', () => {
  it('identifies a rule group', () => {
    expect(isRuleGroupTypeIC(ruleGroup)).toBe(false);
  });

  it('identifies a rule group with independent combinators', () => {
    expect(isRuleGroupTypeIC(ruleGroupIC)).toBe(true);
  });
});
