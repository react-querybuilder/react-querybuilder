import type { FullCombinator, FullOperator, MatchConfig, Path, ValueSource } from './basic';

/**
 * Properties common to both rules and groups.
 */
export interface CommonRuleAndGroupProperties {
  path?: Path;
  id?: string;
  disabled?: boolean;
  /**
   * Whether this rule or group is muted. When muted, the rule or group
   * is excluded from query export formats (SQL, JSON, MongoDB, etc.).
   * For groups, muting recursively mutes all children.
   */
  muted?: boolean;
}

/**
 * The main rule type. The `field`, `operator`, and `value` properties
 * can be narrowed with generics.
 */
export interface RuleType<
  F extends string = string,
  O extends string = string,
  // oxlint-disable-next-line typescript/no-explicit-any
  V = any,
  C extends string = string,
> extends CommonRuleAndGroupProperties {
  field: F;
  operator: O;
  value: V;
  valueSource?: ValueSource;
  match?: MatchConfig;
  /**
   * Only used when adding a rule to a query that uses independent combinators.
   */
  combinatorPreceding?: C;
}

/**
 * The main rule group type. This type is used for query definitions as well as
 * all sub-groups of queries.
 */
export interface RuleGroupType<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties {
  combinator: C;
  rules: RuleGroupArray<RuleGroupType<R, C>, R>;
  not?: boolean;
}

/**
 * The type of the `rules` array in a {@link RuleGroupType}.
 */
export type RuleGroupArray<
  RG extends RuleGroupType = RuleGroupType,
  R extends RuleType = RuleType,
> = (R | RG)[];

/**
 * All updateable properties of rules and groups (everything except
 * `id`, `path`, and `rules`).
 */
export type UpdateableProperties =
  | Exclude<keyof (RuleType & RuleGroupType), 'id' | 'path' | 'rules'>
  | (string & {});

/**
 * The type of the `rules` array in a {@link DefaultRuleGroupType}.
 */
export type DefaultRuleGroupArray<F extends string = string> = RuleGroupArray<
  DefaultRuleGroupType,
  DefaultRuleType<F>
>;

/**
 * {@link RuleGroupType} with the `combinator` property limited to
 * {@link DefaultCombinatorNameExtended} and `rules` limited to {@link DefaultRuleType}.
 */
export type DefaultRuleGroupType<F extends string = string> = RuleGroupType<
  DefaultRuleType<F>,
  DefaultCombinatorNameExtended
> & {
  rules: DefaultRuleGroupArray<F>;
};

/**
 * {@link RuleType} with the `operator` property limited to {@link DefaultOperatorName}.
 */
export type DefaultRuleType<F extends string = string> = RuleType<F, DefaultOperatorName>;

/**
 * Default allowed values for the `combinator` property.
 *
 * @group Option Lists
 */
export type DefaultCombinatorName = 'and' | 'or';
/**
 * Default allowed values for the `combinator` property, plus `"xor"`.
 *
 * @group Option Lists
 */
export type DefaultCombinatorNameExtended = DefaultCombinatorName | 'xor';

/**
 * Default values for the `operator` property.
 *
 * @group Option Lists
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
 * A {@link FullCombinator} definition with a {@link DefaultCombinatorName} `name` property.
 *
 * @group Option Lists
 */
export type DefaultCombinator = FullCombinator<DefaultCombinatorName>;

/**
 * A {@link FullCombinator} definition with a {@link DefaultCombinatorNameExtended} `name` property.
 *
 * @group Option Lists
 */
export type DefaultCombinatorExtended = FullCombinator<DefaultCombinatorNameExtended>;

/**
 * An {@link FullOperator} definition with a {@link DefaultOperatorName} `name` property.
 *
 * @group Option Lists
 */
export type DefaultOperator = FullOperator<DefaultOperatorName>;
