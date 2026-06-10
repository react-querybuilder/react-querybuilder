import type {
  CommonRuleAndGroupProperties,
  FlexibleOption,
  FullOption,
  Option,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/core';
import type { Simplify } from 'type-fest';
import type { EvaluationMode } from './export';

// #region Conditions
/**
 * A condition within a {@link RulesEngine}. Each condition has an `antecedent` (rule group)
 * and an optional `consequent`. A condition may also itself contain nested conditions.
 */
export interface RECondition<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties, Partial<RulesEngine<R, C>> {
  antecedent: RuleGroupType;
  consequent?: Consequent;
}

/**
 * A condition within a {@link RulesEngine}. Each condition has an `antecedent` (rule group)
 * and an optional `consequent`. A condition may also itself contain nested conditions.
 */
export interface REConditionIC<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties, Partial<RulesEngineIC<R, C>> {
  antecedent: RuleGroupTypeIC;
  consequent?: Consequent;
}

/**
 * Either {@link RECondition} or {@link REConditionIC}.
 */
export type REConditionAny<R extends RuleType = RuleType, C extends string = string> =
  | RECondition<R, C>
  | REConditionIC<R, C>;

/**
 * Array of conditions within a {@link RulesEngine} or {@link RulesEngineIC}.
 */
export type REConditionCascade<RG extends RuleGroupTypeAny> = RG extends RuleGroupTypeIC
  ? REConditionIC[]
  : RECondition[];
// #endregion

// #region Rules engine
/**
 * Rules engine with standard query objects ({@link react-querybuilder!RuleGroupType RuleGroupType}).
 * Contains an array of `conditions`, each with an `antecedent` (rule group) and an optional
 * `consequent`. An optional `defaultConsequent` can be specified that will be used if none of
 * the conditions are met.
 */
export interface RulesEngine<
  R extends RuleType = RuleType,
  C extends string = string,
> extends CommonRuleAndGroupProperties {
  conditions: REConditionCascade<RuleGroupType<R, C>>;
  defaultConsequent?: Consequent;
  /**
   * How sibling conditions relate to one another when exported. Defaults to `"cascade"`.
   *
   * - `"cascade"`: conditions are evaluated in order; a later sibling only fires if all prior
   *   siblings' antecedents failed (if/else-if/else semantics).
   * - `"cumulative"`: every condition is evaluated independently and any number may fire.
   */
  evaluationMode?: EvaluationMode;
}

/**
 * Rules engine with "independent combinator" query objects
 * {@link react-querybuilder!RuleGroupTypeIC RuleGroupTypeIC}).
 * Contains an array of `conditions`, each with an `antecedent` (rule group) and an optional
 * `consequent`. An optional `defaultConsequent` can be specified that will be used if none of
 * the conditions are met.
 */
export interface RulesEngineIC<
  R extends RuleType = RuleType,
  C extends string = string,
> extends CommonRuleAndGroupProperties {
  conditions: REConditionCascade<RuleGroupTypeIC<R, C>>;
  defaultConsequent?: Consequent;
  /**
   * How sibling conditions relate to one another when exported. Defaults to `"cascade"`.
   *
   * - `"cascade"`: conditions are evaluated in order; a later sibling only fires if all prior
   *   siblings' antecedents failed (if/else-if/else semantics).
   * - `"cumulative"`: every condition is evaluated independently and any number may fire.
   */
  evaluationMode?: EvaluationMode;
}

/**
 * Either {@link RulesEngine} or {@link RulesEngineIC}.
 */
export type RulesEngineAny<R extends RuleType = RuleType, C extends string = string> =
  | RulesEngine<R, C>
  | RulesEngineIC<R, C>;
// #endregion

// #region Consequent
/**
 * @group Rules Engine
 */
export type ConsequentBase<T extends string = string> = {
  id?: string;
  type: T;
};

/**
 * @group Rules Engine
 */
export interface Consequent extends ConsequentBase {
  [etc: string]: unknown;
}
// #endregion

// #region Consequent property definitions
/**
 * Supported input types for a built-in consequent property editor.
 *
 * @group Rules Engine
 */
export type ConsequentPropertyInputType = 'text' | 'textarea' | 'number' | 'checkbox' | 'select';

/**
 * Definition of a single editable property of a consequent type. Used by the built-in
 * {@link ConsequentBuilderBody} to render an appropriate input for each property. Property
 * values are stored on the consequent under `params[name]`.
 *
 * @group Rules Engine
 */
export interface ConsequentPropertyDef {
  /** Key under which the value is stored in the consequent's `params` object. */
  name: string;
  /** Visible label for the input. Defaults to `name`. */
  label?: string;
  /** Input type to render. Defaults to `"text"`. */
  inputType?: ConsequentPropertyInputType;
  /** Options for the `"select"` input type. */
  values?: FlexibleOption[];
  /** Value seeded into `params[name]` when the consequent type is selected. */
  defaultValue?: unknown;
}

/**
 * A consequent type option that may carry editable property definitions. Pass an array of these
 * as the `consequentTypes` prop (or from `getConsequentTypes`) to enable the built-in property
 * editor. Only `name` (the identifier stored as the consequent's `type`) and `label` are
 * required; see {@link FullConsequentTypeOption} for the resolved form used internally.
 *
 * @group Rules Engine
 */
export type ConsequentTypeOption<N extends string = string> = Simplify<
  Option<N> & {
    /** Editable property definitions for this consequent type. */
    properties?: ConsequentPropertyDef[];
  }
>;

/**
 * A {@link ConsequentTypeOption} resolved to a {@link react-querybuilder!FullOption FullOption}
 * (both `name` and `value` guaranteed). This is the form passed to subcomponents via the schema.
 *
 * @group Rules Engine
 */
export type FullConsequentTypeOption<N extends string = string> = Simplify<
  FullOption<N> & {
    /** Editable property definitions for this consequent type. */
    properties?: ConsequentPropertyDef[];
  }
>;
// #endregion
