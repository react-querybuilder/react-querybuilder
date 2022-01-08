import type {
  DefaultCombinatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupType,
  DefaultRuleType,
  RuleGroupArray,
  RuleGroupType,
  RuleType,
} from './ruleGroups';
import type { MappedTuple } from './ruleGroupsICutils';

export interface RuleGroupTypeIC {
  path?: number[];
  id?: string;
  rules: RuleGroupICArray;
  not?: boolean;
}

export type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

export type RuleGroupICArray =
  | [RuleType | RuleGroupTypeIC]
  | [RuleType | RuleGroupTypeIC, ...MappedTuple<[string, RuleType | RuleGroupTypeIC]>]
  | (any[] & { length: 0 });
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

export type DefaultRuleGroupICArray =
  | [
      DefaultRuleType | DefaultRuleGroupTypeIC,
      ...MappedTuple<[DefaultCombinatorName, DefaultRuleType | DefaultRuleGroupTypeIC]>
    ]
  | (any[] & { length: 0 });
export type DefaultRuleOrGroupArray = DefaultRuleGroupArray | DefaultRuleGroupICArray;

export interface DefaultRuleGroupTypeIC extends RuleGroupTypeIC {
  rules:
    | [
        DefaultRuleType | DefaultRuleGroupTypeIC,
        ...MappedTuple<[DefaultCombinatorName, DefaultRuleType | DefaultRuleGroupTypeIC]>
      ]
    | (any[] & { length: 0 });
}

export type DefaultRuleGroupTypeAny = DefaultRuleGroupType | DefaultRuleGroupTypeIC;
