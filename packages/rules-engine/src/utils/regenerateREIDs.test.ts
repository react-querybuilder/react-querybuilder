import type { RuleGroupType, RuleGroupTypeIC } from '@react-querybuilder/core';
import type { RulesEngine, RulesEngineIC } from '../types';
import { regenerateREIDs } from './regenerateREIDs';

const ruleGroup: RuleGroupType = {
  id: 'root',
  combinator: 'and',
  rules: [
    {
      id: 'innerGroup',
      combinator: 'and',
      rules: [{ id: 'innerRule', field: 'TEST', operator: '=', value: '' }],
    },
  ],
};

const ruleGroupIC: RuleGroupTypeIC = {
  id: 'root',
  rules: [
    {
      id: 'innerGroup',
      rules: [
        { id: 'innerRule', field: 'TEST', operator: '=', value: '' },
        'and',
        { id: 'innerRule', field: 'TEST', operator: '=', value: '' },
      ],
    },
  ],
};

describe('rules engines', () => {
  const re: RulesEngine = {
    id: 'root',
    conditions: [
      {
        id: 'firstGroup',
        antecedent: { combinator: 'and', rules: [ruleGroup] },
        conditions: [{ antecedent: ruleGroup }],
      },
    ],
  };

  const reIC: RulesEngineIC = {
    id: 'root',
    conditions: [
      {
        id: 'firstGroup',
        antecedent: { rules: [ruleGroupIC, 'or', ruleGroupIC] },
        conditions: [{ antecedent: ruleGroupIC }],
      },
    ],
  };

  it('should generate different IDs for standard rules engines', () => {
    const newRulesEngine = regenerateREIDs(re);

    expect(newRulesEngine.id).not.toBe(re.id);
    expect(newRulesEngine.conditions[0].antecedent.rules[0].id).not.toBe(re.conditions[0].id);
    expect(newRulesEngine.conditions[0].id).not.toBe(re.conditions[0].id);
    expect(newRulesEngine.conditions[0]?.conditions?.[0].id).not.toBe(
      re.conditions[0]?.conditions?.[0].id
    );
  });

  it('should generate different IDs for rules engines with independent combinators', () => {
    const newRulesEngineIC = regenerateREIDs(reIC);
    expect(newRulesEngineIC.id).not.toBe(reIC.id);
    expect(newRulesEngineIC.conditions[0].id).not.toBe(reIC.conditions[0].id);
    expect(newRulesEngineIC.conditions[0].conditions![0].id).not.toBe(
      reIC.conditions[0].conditions![0].id
    );
    expect(newRulesEngineIC.conditions[0]?.antecedent.rules[2]?.id).not.toBe(
      reIC.conditions[0]?.antecedent.rules[2]?.id
    );
  });
});
