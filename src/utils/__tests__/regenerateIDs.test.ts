import { regenerateIDs } from '..';
import { RuleGroupType } from '../..';

describe('when generating IDs', () => {
  it('should generate different IDs', () => {
    const ruleGroup: RuleGroupType = {
      id: 'root',
      combinator: 'and',
      rules: [
        {
          id: 'innerGroup',
          combinator: 'and',
          rules: [
            {
              id: 'rule',
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
  });
});
