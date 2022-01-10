import type { NameLabelPair } from './basic';

export type RuleType<F extends string = string, O extends string = string, V = any> = {
  path?: number[];
  id?: string;
  field: F;
  operator: O;
  value: V;
};

export type RuleGroupType<R extends RuleType = RuleType, C extends string = string> = {
  path?: number[];
  id?: string;
  combinator: C;
  rules: RuleGroupArray<RuleGroupType<R, C>, R>;
  not?: boolean;
};

export type RuleGroupArray<
  RG extends RuleGroupType = RuleGroupType,
  R extends RuleType = RuleType
> = [R | RG, ...(R | RG)[]] | (any[] & { length: 0 });
// TODO: why can't the line before this just be:
// > = (R | RG)[];

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
