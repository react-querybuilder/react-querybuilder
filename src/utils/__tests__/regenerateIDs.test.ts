import { regenerateIDs } from '..';
import { RuleGroupType, RuleGroupTypeIC } from '../..';

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

const ruleGroupIC: RuleGroupTypeIC = {
  id: 'root',
  path: [],
  rules: [
    {
      id: 'innerGroup',
      path: [0],
      rules: [
        {
          id: 'innerRule',
          path: [0, 0],
          field: 'TEST',
          operator: '=',
          value: ''
        },
        'and',
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

describe('when generating IDs', () => {
  it('should generate different IDs for standard queries', () => {
    const newRuleGroup = regenerateIDs(ruleGroup);
    expect(newRuleGroup.id).not.toBe(ruleGroup.id);
    expect((newRuleGroup.rules[0] as RuleGroupType).id).not.toBe(ruleGroup.rules[0].id);
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].id).not.toBe(
      (ruleGroup.rules[0] as RuleGroupType).rules[0].id
    );
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].path).toEqual([0, 0]);
  });

  it('should generate different IDs for inline combinators', () => {
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
    expect(((newRuleGroupIC.rules[0] as RuleGroupTypeIC).rules[0] as RuleGroupTypeIC).path).toEqual(
      [0, 0]
    );
  });
});
