import { regenerateIDs } from '..';
import { RuleGroupType } from '../..';

describe('when generating IDs', () => {
  it('should generate different IDs', () => {
    const ruleGroup: RuleGroupType = {
      id: 'root',
      path: [],
      combinator: 'and',
      rules: [
        {
          id: 'innerGroup',
          path: [0],
          combinator: 'and',
          rules: [
            {
              id: 'innerRule',
              path: [0, 0],
              field: 'TEST',
              operator: '=',
              value: ''
            }
          ]
        }
      ]
    };

    const newRuleGroup = regenerateIDs(ruleGroup);

    expect(newRuleGroup.id).not.toBe(ruleGroup.id);
    expect(newRuleGroup.rules[0].id).not.toBe(ruleGroup.rules[0].id);
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].id).not.toBe(
      (ruleGroup.rules[0] as RuleGroupType).rules[0].id
    );
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].path).toEqual([0, 0]);
  });
});
