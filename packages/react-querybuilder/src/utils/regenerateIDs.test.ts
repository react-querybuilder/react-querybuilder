import type {
  RuleGroupType,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/ts/dist/index.noReact';
import { uuidV4regex } from '../../genericTests/generateIDtests';
import { regenerateID, regenerateIDs } from './regenerateIDs';

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
          value: '',
        },
      ],
    },
  ],
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
          value: '',
        },
        'and',
        {
          id: 'innerRule',
          field: 'TEST',
          operator: '=',
          value: '',
        },
      ],
    },
  ],
};

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
  const newObject = regenerateIDs({ test: 'this' } as any);
  expect(newObject.id).toMatch(uuidV4regex);
  expect(newObject).toHaveProperty('test', 'this');
});

it('should return the first param if not POJO', () => {
  const newObject = regenerateIDs('test' as any);
  expect(newObject).toBe('test');
});
