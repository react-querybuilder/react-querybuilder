import type { NameLabelPair, ValueSource } from './basic';

interface CommonProperties {
  path?: number[];
  id?: string;
  disabled?: boolean;
}

export type RuleType<
  F extends string = string,
  O extends string = string,
  V = any
> = CommonProperties & {
  field: F;
  operator: O;
  value: V;
  valueSource?: ValueSource;
};

export type RuleGroupType<
  R extends RuleType = RuleType,
  C extends string = string
> = CommonProperties & {
  combinator: C;
  rules: RuleGroupArray<RuleGroupType<R, C>, R>;
  not?: boolean;
};

export type RuleGroupArray<
  RG extends RuleGroupType = RuleGroupType,
  R extends RuleType = RuleType
> = (R | RG)[];

export type UpdateableProperties = Exclude<
  keyof (RuleType & RuleGroupType),
  'id' | 'path' | 'rules'
>;

export type DefaultRuleGroupArray = RuleGroupArray<DefaultRuleGroupType, DefaultRuleType>;

export type DefaultRuleGroupType = RuleGroupType<DefaultRuleType, DefaultCombinatorName> & {
  rules: DefaultRuleGroupArray;
};

export type DefaultRuleType = RuleType<string, DefaultOperatorName>;

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
