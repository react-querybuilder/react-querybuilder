import type { NameLabelPair } from './basic';

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

export type RuleGroupArray =
  | [RuleType | RuleGroupType, ...(RuleType | RuleGroupType)[]]
  | (any[] & { length: 0 });

export type DefaultRuleGroupArray =
  | [DefaultRuleType | DefaultRuleGroupType, ...(DefaultRuleType | DefaultRuleGroupType)[]]
  | (any[] & { length: 0 });

export interface DefaultRuleGroupType extends RuleGroupType {
  combinator: DefaultCombinatorName;
  rules:
    | [DefaultRuleGroupType | DefaultRuleType, ...(DefaultRuleGroupType | DefaultRuleType)[]]
    | (any[] & { length: 0 });
}

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
