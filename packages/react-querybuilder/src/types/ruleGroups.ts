import type { NameLabelPair } from './basic';
import type { MappedTuple } from './util';

export interface RuleType {
  path?: number[];
  id?: string;
  field: string;
  operator: string;
  value: any;
}

export interface RuleGroupType {
  path?: number[];
  id?: string;
  combinator: string;
  rules: RuleGroupArray;
  not?: boolean;
}

export interface RuleGroupTypeIC {
  path?: number[];
  id?: string;
  rules: RuleGroupICArray;
  not?: boolean;
}

export type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

export type RuleGroupArray =
  | [RuleType | RuleGroupType, ...(RuleType | RuleGroupType)[]]
  | (any[] & { length: 0 });
export type RuleGroupICArray =
  | [RuleType | RuleGroupTypeIC]
  | [RuleType | RuleGroupTypeIC, ...MappedTuple<[string, RuleType | RuleGroupTypeIC]>]
  | (any[] & { length: 0 });
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

export type DefaultRuleGroupArray =
  | [DefaultRuleType | DefaultRuleGroupType, ...(DefaultRuleType | DefaultRuleGroupType)[]]
  | (any[] & { length: 0 });
export type DefaultRuleGroupICArray =
  | [
      DefaultRuleType | DefaultRuleGroupTypeIC,
      ...MappedTuple<[DefaultCombinatorName, DefaultRuleType | DefaultRuleGroupTypeIC]>
    ]
  | (any[] & { length: 0 });
export type DefaultRuleOrGroupArray = DefaultRuleGroupArray | DefaultRuleGroupICArray;

export interface DefaultRuleGroupType extends RuleGroupType {
  combinator: DefaultCombinatorName;
  rules:
    | [DefaultRuleGroupType | DefaultRuleType, ...(DefaultRuleGroupType | DefaultRuleType)[]]
    | (any[] & { length: 0 });
}

export interface DefaultRuleGroupTypeIC extends RuleGroupTypeIC {
  rules:
    | [
        DefaultRuleType | DefaultRuleGroupTypeIC,
        ...MappedTuple<[DefaultCombinatorName, DefaultRuleType | DefaultRuleGroupTypeIC]>
      ]
    | (any[] & { length: 0 });
}

export type DefaultRuleGroupTypeAny = DefaultRuleGroupType | DefaultRuleGroupTypeIC;

export interface DefaultRuleType extends RuleType {
  operator: DefaultOperatorName;
}

export type DefaultCombinatorName = 'and' | 'or';

export type DefaultOperatorName =
  | '='
  | '!='
  | '<'
  | '>'
  | '<='
  | '>='
  | 'contains'
  | 'beginsWith'
  | 'endsWith'
  | 'doesNotContain'
  | 'doesNotBeginWith'
  | 'doesNotEndWith'
  | 'null'
  | 'notNull'
  | 'in'
  | 'notIn'
  | 'between'
  | 'notBetween';

export interface DefaultCombinator extends NameLabelPair {
  name: DefaultCombinatorName;
}

export interface DefaultOperator extends NameLabelPair {
  name: DefaultOperatorName;
}
