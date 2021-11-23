import { regenerateIDs } from '..';
import { RuleGroupType, RuleGroupTypeIC } from '../..';

const ruleGroup: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [
    {
      id: 'innerGroup',
      combinator: 'and',
      rules: [
        {
          id: 'innerRule',
          field: 'TEST',
          operator: '=',
          value: ''
        }
      ]
    }
  ]
};

const ruleGroupIC: RuleGroupTypeIC = {
  id: 'root',
  rules: [
    {
      id: 'innerGroup',
      rules: [
        {
          id: 'innerRule',
          field: 'TEST',
          operator: '=',
          value: ''
        },
        'and',
        {
          id: 'innerRule',
          field: 'TEST',
          operator: '=',
          value: ''
        }
      ]
    }
  ]
};

describe('when generating IDs', () => {
  it('should generate different IDs for standard queries', () => {
    const newRuleGroup = regenerateIDs(ruleGroup);
    expect(newRuleGroup.id).not.toBe(ruleGroup.id);
    expect((newRuleGroup.rules[0] as RuleGroupType).id).not.toBe(ruleGroup.rules[0].id);
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].id).not.toBe(
      (ruleGroup.rules[0] as RuleGroupType).rules[0].id
    );
  });

  it('should generate different IDs for independent combinators', () => {
    const newRuleGroupIC = regenerateIDs(ruleGroupIC);
    expect(newRuleGroupIC.id).not.toBe(ruleGroupIC.id);
    expect((newRuleGroupIC.rules[0] as RuleGroupTypeIC).id).not.toBe(
      (ruleGroupIC.rules[0] as RuleGroupTypeIC).id
    );
    expect(((newRuleGroupIC.rules[0] as RuleGroupTypeIC).rules[0] as RuleGroupTypeIC).id).not.toBe(
      ((ruleGroupIC.rules[0] as RuleGroupTypeIC).rules[0] as RuleGroupTypeIC).id
    );
    expect(((newRuleGroupIC.rules[0] as RuleGroupTypeIC).rules[2] as RuleGroupTypeIC).id).not.toBe(
      ((ruleGroupIC.rules[0] as RuleGroupTypeIC).rules[2] as RuleGroupTypeIC).id
    );
  });
});
