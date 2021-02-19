import { isRuleGroup } from '..';
import { RuleGroupType, RuleType } from '../../types';

describe('isRuleGroup', () => {
  const rule: RuleType = {
    id: 'r-01234',
    field: 'test',
    operator: '=',
    value: 'test value'
  };

  const ruleGroup: RuleGroupType = {
    id: 'g-01234',
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
