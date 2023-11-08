import type { Combinator, Operator, Path, ValueSource } from './basic';
import type { ToFullOption } from './options';

/**
 * Properties common to both rules and groups.
 */
export interface CommonRuleAndGroupProperties {
  path?: Path;
  id?: string;
  disabled?: boolean;
}

/**
 * The main rule type. The `field`, `operator`, and `value` properties
 * can be narrowed with generics.
 */
export type RuleType<
  F extends string = string,
  O extends string = string,
  V = any,
  C extends string = string
> = CommonRuleAndGroupProperties & {
  field: F;
  operator: O;
  value: V;
  valueSource?: ValueSource;
  /**
   * Only used when adding a rule to a query that uses independent combinators.
   */
  combinatorPreceding?: C;
};

/**
 * The main rule group type. This type is used for query definitions as well as
 * all sub-groups of queries.
 */
export type RuleGroupType<
  R extends RuleType = RuleType,
  C extends string = string
> = CommonRuleAndGroupProperties & {
  combinator: C;
  rules: RuleGroupArray<RuleGroupType<R, C>, R>;
  not?: boolean;
};

/**
 * The type of the `rules` array in a {@link RuleGroupType}.
 */
export type RuleGroupArray<
  RG extends RuleGroupType = RuleGroupType,
  R extends RuleType = RuleType
> = (R | RG)[];

/**
 * All updateable properties of rules and groups (everything except
 * `id`, `path`, and `rules`).
 */
export type UpdateableProperties = Exclude<
  keyof (RuleType & RuleGroupType),
  'id' | 'path' | 'rules'
>;

/**
 * The type of the `rules` array in a {@link DefaultRuleGroupType}.
 */
export type DefaultRuleGroupArray = RuleGroupArray<DefaultRuleGroupType, DefaultRuleType>;

/**
 * {@link RuleGroupType} with the `combinator` property limited to
 * {@link DefaultCombinatorNameExtended} and `rules` limited to {@link DefaultRuleType}.
 */
export type DefaultRuleGroupType = RuleGroupType<DefaultRuleType, DefaultCombinatorNameExtended> & {
  rules: DefaultRuleGroupArray;
};

/**
 * {@link RuleType} with the `operator` property limited to {@link DefaultOperatorName}.
 */
export type DefaultRuleType = RuleType<string, DefaultOperatorName>;

/**
 * Default allowed values for the `combinator` property.
 */
export type DefaultCombinatorName = 'and' | 'or';
/**
 * Default allowed values for the `combinator` property, plus `"xor"`.
 */
export type DefaultCombinatorNameExtended = DefaultCombinatorName | 'xor';

/**
 * Default values for the `operator` property.
 */
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

/**
 * A combinator definition with a {@link DefaultCombinatorName} `name` property.
 */
export type DefaultCombinator = ToFullOption<Combinator<DefaultCombinatorName>>;

/**
 * A combinator definition with a {@link DefaultCombinatorNameExtended} `name` property.
 */
export type DefaultCombinatorExtended = ToFullOption<Combinator<DefaultCombinatorNameExtended>>;

/**
 * An operator definition with a {@link DefaultOperatorName} `name` property.
 */
export type DefaultOperator = ToFullOption<Operator<DefaultOperatorName>>;
