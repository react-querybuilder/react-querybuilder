import resetPaths from '../resetPaths';
import type { RuleGroupType, RuleGroupTypeIC } from '../../types';

const ruleGroup: RuleGroupType = {
  id: 'root',
  path: [0, 0],
  combinator: 'and',
  rules: [
    {
      id: 'innerGroup',
      path: [0, 0, 2, 3, 4],
      combinator: 'and',
      rules: [
        {
          id: 'innerRule',
          path: [],
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
  path: [123],
  rules: [
    {
      id: 'innerGroup',
      path: [],
      rules: [
        {
          id: 'innerRule',
          path: [0, 7, 8, 9],
          field: 'TEST',
          operator: '=',
          value: ''
        },
        'and',
        {
          id: 'innerRule',
          path: [],
          field: 'TEST',
          operator: '=',
          value: ''
        }
      ]
    }
  ]
};

describe('resetPaths', () => {
  it('should generate correct paths for standard queries', () => {
    const newRuleGroup = resetPaths(ruleGroup);
    expect(newRuleGroup.path).toEqual([]);
    expect((newRuleGroup.rules[0] as RuleGroupType).path).toEqual([0]);
    expect((newRuleGroup.rules[0] as RuleGroupType).rules[0].path).toEqual([0, 0]);
  });

  it('should generate correct paths for inline combinators', () => {
    const newRuleGroupIC = resetPaths(ruleGroupIC);
    expect(newRuleGroupIC.path).toEqual([]);
    expect((newRuleGroupIC.rules[0] as RuleGroupTypeIC).path).toEqual([0]);
    expect(((newRuleGroupIC.rules[0] as RuleGroupTypeIC).rules[0] as RuleGroupTypeIC).path).toEqual(
      [0, 0]
    );
    expect(((newRuleGroupIC.rules[0] as RuleGroupTypeIC).rules[2] as RuleGroupTypeIC).path).toEqual(
      [0, 2]
    );
  });
});
