import { isRuleGroup } from '..';
import { RuleGroupTypeIC } from '../..';
import { RuleGroupType, RuleType } from '../../types';

const rule: RuleType = {
  field: 'test',
  operator: '=',
  value: 'test value'
};

const ruleGroup: RuleGroupType = {
  combinator: 'and',
  rules: []
};

const ruleGroupIC: RuleGroupTypeIC = {
  rules: []
};

describe('isRuleGroup', () => {
  it('identifies a rule', () => {
    expect(isRuleGroup(rule)).toBe(false);
  });

  it('identifies a rule group', () => {
    expect(isRuleGroup(ruleGroup)).toBe(true);
  });

  it('identifies a rule group with inline combinators', () => {
    expect(isRuleGroup(ruleGroupIC)).toBe(true);
  });
});
