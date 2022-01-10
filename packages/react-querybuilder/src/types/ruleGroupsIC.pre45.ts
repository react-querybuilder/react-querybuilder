import type {
  DefaultCombinatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupType,
  DefaultRuleType,
  RuleGroupArray,
  RuleGroupType,
  RuleType,
} from './ruleGroups';

export type RuleGroupTypeIC<R extends RuleType = RuleType, C extends string = string> = {
  path?: number[];
  id?: string;
  rules: RuleGroupICArray<RuleGroupTypeIC<R, C>, R, C>;
  not?: boolean;
};

export type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

export type RuleGroupICArray<
  RG extends RuleGroupTypeIC = RuleGroupTypeIC,
  R extends RuleType = RuleType,
  C extends string = string
> = (RG | R | C)[];
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

export type DefaultRuleGroupICArray = RuleGroupICArray<
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  DefaultCombinatorName
>;
export type DefaultRuleOrGroupArray = DefaultRuleGroupArray | DefaultRuleGroupICArray;

export interface DefaultRuleGroupTypeIC extends RuleGroupTypeIC {
  rules: DefaultRuleGroupICArray;
}
export type DefaultRuleGroupTypeAny = DefaultRuleGroupType | DefaultRuleGroupTypeIC;
