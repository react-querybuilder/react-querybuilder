import type {
  DefaultCombinatorName,
  DefaultRuleGroupArray,
  DefaultRuleGroupType,
  DefaultRuleType,
  RuleGroupArray,
  RuleGroupType,
  RuleType,
} from './ruleGroups';
import type { MappedTuple } from './ruleGroupsIC.utils';

/**
 * The main rule group type when `independentCombinators` is `true`. This type is used
 * for query definitions as well as all sub-groups of queries.
 */
export type RuleGroupTypeIC<R extends RuleType = RuleType, C extends string = string> = Omit<
  RuleGroupType<R, C>,
  'combinator' | 'rules'
> & {
  combinator?: undefined;
  rules: RuleGroupICArray<RuleGroupTypeIC<R, C>, R, C>;
  /**
   * Only used when adding a rule to a query that uses independent combinators
   */
  combinatorPreceding?: C;
};

/**
 * Shorthand for "either {@link RuleGroupType} or {@link RuleGroupTypeIC}".
 */
export type RuleGroupTypeAny = RuleGroupType | RuleGroupTypeIC;

/**
 * The type of the `rules` array in a {@link RuleGroupTypeIC}.
 */
export type RuleGroupICArray<
  RG extends RuleGroupTypeIC = RuleGroupTypeIC,
  R extends RuleType = RuleType,
  C extends string = string
> = [R | RG] | [R | RG, ...MappedTuple<[C, R | RG]>] | ((R | RG)[] & { length: 0 });
/**
 * Shorthand for "either {@link RuleGroupArray} or {@link RuleGroupICArray}".
 */
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

/**
 * The type of the `rules` array in a {@link DefaultRuleGroupTypeIC}.
 */
export type DefaultRuleGroupICArray = RuleGroupICArray<
  DefaultRuleGroupTypeIC,
  DefaultRuleType,
  DefaultCombinatorName
>;

/**
 * Shorthand for "either {@link DefaultRuleGroupArray} or {@link DefaultRuleGroupICArray}".
 */
export type DefaultRuleOrGroupArray = DefaultRuleGroupArray | DefaultRuleGroupICArray;

/**
 * {@link RuleGroupTypeIC} with combinators limited to
 * {@link DefaultCombinatorName} and rules limited to {@link DefaultRuleType}.
 */
export interface DefaultRuleGroupTypeIC extends RuleGroupTypeIC {
  rules: DefaultRuleGroupICArray;
}

/**
 * Shorthand for "either {@link DefaultRuleGroupType} or {@link DefaultRuleGroupTypeIC}".
 */
export type DefaultRuleGroupTypeAny = DefaultRuleGroupType | DefaultRuleGroupTypeIC;
