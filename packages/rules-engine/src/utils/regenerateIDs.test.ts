import type {
  RulesEngine,
  RulesEngineCondition,
  RulesEngineIC,
} from '@react-querybuilder/rules-engine';
import type { RuleGroupType, RuleGroupTypeIC, RuleType } from 'react-querybuilder';
import { regenerateID, regenerateIDs } from './regenerateIDs';
import { uuidV4regex } from './generateIDTestUtils';

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

describe('rule groups', () => {
  it('should generate different IDs for rules', () => {
    const newRule = regenerateID((ruleGroup.rules[0] as RuleGroupType).rules[0] as RuleType);
    expect(newRule.id).toMatch(uuidV4regex);
  });

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

  it('should generate different IDs for any POJO', () => {
    const newObject = regenerateIDs({ test: 'this' });
    expect(newObject.id).toMatch(uuidV4regex);
    expect(newObject).toHaveProperty('test', 'this');
  });

  it('should return the first param if not POJO', () => {
    const newObject = regenerateIDs('test');
    expect(newObject).toBe('test');
  });
});

describe('rules engines', () => {
  const re: RulesEngine = {
    id: 'root',
    conditions: [
      { id: 'firstGroup', combinator: 'and', rules: [ruleGroup], conditions: [ruleGroup] },
    ],
  };

  const reIC: RulesEngineIC = {
    id: 'root',
    conditions: [
      { id: 'firstGroup', rules: [ruleGroupIC, 'or', ruleGroupIC], conditions: [ruleGroupIC] },
    ],
  };

  it('should generate different IDs for standard rules engines', () => {
    const newRulesEngine = regenerateIDs(re);

    expect(newRulesEngine.id).not.toBe(re.id);
    expect(
      (newRulesEngine.conditions[0] as RulesEngineCondition<RuleGroupType>).rules[0].id
    ).not.toBe(re.conditions[0].id);
    expect(newRulesEngine.conditions[0].id).not.toBe(re.conditions[0].id);
    expect((newRulesEngine.conditions[0] as RulesEngine).conditions[0].id).not.toBe(
      (re.conditions[0] as RulesEngine).conditions[0].id
    );
  });

  it('should generate different IDs for rules engines with independent combinators', () => {
    const newRulesEngineIC = regenerateIDs(reIC);
    // console.log(newRulesEngineIC);
    expect(newRulesEngineIC.id).not.toBe(reIC.id);
    expect((newRulesEngineIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>).id).not.toBe(
      (reIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>).id
    );
    expect(
      (
        (newRulesEngineIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>)
          .conditions![0] as RulesEngineCondition<RuleGroupTypeIC>
      ).id
    ).not.toBe(
      (
        (reIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>)
          .conditions![0] as RulesEngineCondition<RuleGroupTypeIC>
      ).id
    );
    expect(
      (
        (newRulesEngineIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>)
          .rules[2] as RulesEngineCondition<RuleGroupTypeIC>
      ).id
    ).not.toBe(
      (
        (reIC.conditions[0] as RulesEngineCondition<RuleGroupTypeIC>)
          .rules[2] as RulesEngineCondition<RuleGroupTypeIC>
      ).id
    );
  });
});
