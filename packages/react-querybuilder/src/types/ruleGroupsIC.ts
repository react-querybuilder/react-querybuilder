import type { Except } from 'type-fest';
import type { FlexibleOption, GetOptionIdentifierType } from './options';
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
 * The main rule group type when using independent combinators. This type is used
 * for query definitions as well as all sub-groups of queries.
 */
export type RuleGroupTypeIC<R extends RuleType = RuleType, C extends string = string> = Except<
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
export type RuleGroupTypeAny<R extends RuleType = RuleType, C extends string = string> =
  | RuleGroupType<R, C>
  | RuleGroupTypeIC<R, C>;

/**
 * The type of the `rules` array in a {@link RuleGroupTypeIC}.
 */
export type RuleGroupICArray<
  RG extends RuleGroupTypeIC = RuleGroupTypeIC,
  R extends RuleType = RuleType,
  C extends string = string,
> = [R | RG] | [R | RG, ...MappedTuple<[C, R | RG]>] | ((R | RG)[] & { length: 0 });

/**
 * Shorthand for "either {@link RuleGroupArray} or {@link RuleGroupICArray}".
 */
export type RuleOrGroupArray = RuleGroupArray | RuleGroupICArray;

/**
 * The type of the `rules` array in a {@link DefaultRuleGroupTypeIC}.
 */
export type DefaultRuleGroupICArray<F extends string = string> = RuleGroupICArray<
  DefaultRuleGroupTypeIC<F>,
  DefaultRuleType<F>,
  DefaultCombinatorName
>;

/**
 * Shorthand for "either {@link DefaultRuleGroupArray} or {@link DefaultRuleGroupICArray}".
 */
export type DefaultRuleOrGroupArray<F extends string = string> =
  | DefaultRuleGroupArray<F>
  | DefaultRuleGroupICArray<F>;

/**
 * {@link RuleGroupTypeIC} with combinators limited to
 * {@link DefaultCombinatorName} and rules limited to {@link DefaultRuleType}.
 */
export interface DefaultRuleGroupTypeIC<F extends string = string>
  extends RuleGroupTypeIC<DefaultRuleType<F>> {
  rules: DefaultRuleGroupICArray<F>;
}

/**
 * Shorthand for "either {@link DefaultRuleGroupType} or {@link DefaultRuleGroupTypeIC}".
 */
export type DefaultRuleGroupTypeAny<F extends string = string> =
  | DefaultRuleGroupType<F>
  | DefaultRuleGroupTypeIC<F>;

/**
 * Determines if a type extending {@link RuleGroupTypeAny} is actually
 * {@link RuleGroupType} or {@link RuleGroupTypeIC}.
 */
export type GetRuleGroupType<RG> = RG extends { combinator: string }
  ? RuleGroupType
  : RuleGroupTypeIC;

/**
 * Determines the {@link RuleType} of a given {@link RuleGroupType}
 * or {@link RuleGroupTypeIC}. If the field and operator name types of
 * the rule type extend the identifier types of the provided Field and
 * Operator types, the given rule type is returned as is. Otherwise,
 * the rule type has its field and operator types narrowed to the
 * identifier types of the provided Field and Operator types.
 */
export type GetRuleTypeFromGroupWithFieldAndOperator<
  RG extends RuleGroupTypeAny,
  F extends FlexibleOption,
  O extends FlexibleOption,
> = RG extends RuleGroupType<infer RT> | RuleGroupTypeIC<infer RT>
  ? RT extends RuleType<
      infer RuleFieldName,
      infer _RuleOperatorName,
      infer RuleValueName,
      infer RuleCombinatorName
    >
    ? RuleFieldName extends GetOptionIdentifierType<F>
      ? // Old way:
        // ? RuleType<RuleFieldName, GetOptionIdentifierType<O>, RuleValueName, RuleCombinatorName>
        // : RuleType<GetOptionIdentifierType<F>, GetOptionIdentifierType<O>, RuleValueName, RuleCombinatorName>
        _RuleOperatorName extends GetOptionIdentifierType<O>
        ? RuleType<RuleFieldName, _RuleOperatorName, RuleValueName, RuleCombinatorName>
        : RuleType<RuleFieldName, GetOptionIdentifierType<O>, RuleValueName, RuleCombinatorName>
      : _RuleOperatorName extends GetOptionIdentifierType<O>
        ? RuleType<GetOptionIdentifierType<F>, _RuleOperatorName, RuleValueName, RuleCombinatorName>
        : RuleType<
            GetOptionIdentifierType<F>,
            GetOptionIdentifierType<O>,
            RuleValueName,
            RuleCombinatorName
          >
    : never
  : never;
