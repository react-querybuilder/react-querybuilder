import { isRuleGroup } from '..';
import { RuleGroupType, RuleType } from '../../types';

describe('isRuleGroup', () => {
  const rule: RuleType = {
    field: 'test',
    operator: '=',
    value: 'test value'
  };

  const ruleGroup: RuleGroupType = {
    combinator: 'and',
    rules: []
  };

  it('identifies a rule', () => {
    expect(isRuleGroup(rule)).toBe(false);
  });

  it('identifies a rule group', () => {
    expect(isRuleGroup(ruleGroup)).toBe(true);
  });
});
