import type {
  DefaultCombinatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupType,
  DefaultRuleType,
  RuleGroupArray,
  RuleGroupType,
  RuleType,
} from './ruleGroups';

export interface RuleGroupTypeIC {
  path?: number[];
  id?: string;
  rules: RuleGroupICArray;
  not?: boolean;
}

export type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

export type RuleGroupICArray = (string | RuleType | RuleGroupTypeIC)[];
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

export type DefaultRuleGroupICArray = (
  | DefaultCombinatorName
  | DefaultRuleType
  | DefaultRuleGroupTypeIC
)[];
export type DefaultRuleOrGroupArray = DefaultRuleGroupArray | DefaultRuleGroupICArray;

export interface DefaultRuleGroupTypeIC extends RuleGroupTypeIC {
  rules: (DefaultCombinatorName | DefaultRuleType | DefaultRuleGroupTypeIC)[];
}
export type DefaultRuleGroupTypeAny = DefaultRuleGroupType | DefaultRuleGroupTypeIC;
