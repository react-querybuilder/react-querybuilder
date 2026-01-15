import type {
  CommonRuleAndGroupProperties,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/core';

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

// -------------------------------------------
// Playground:
// -------------------------------------------

interface _ExampleConsequent extends ConsequentBase<'rea' | 'hope'> {
  command: string;
  args: unknown[] | Record<string, unknown>;
  options?: {
    async?: boolean;
    timeout?: number;
    retries?: number;
  };
  metadata?: {
    name?: string;
    description?: string;
    tags?: string[];
  };
}

const _myREA: _ExampleConsequent = { type: 'rea', command: 'cmd', args: [] };

const _rngn: RulesEngine = {
  conditions: [
    // IF
    {
      antecedent: {
        combinator: 'and',
        rules: [],
      },
      // consequent: { type: 'cmd', payload: { command: '', args: [] }},
    },
    // ELSE IF
    {
      antecedent: { combinator: 'and', rules: [{ field: '', operator: '', value: '' }] },
      consequent: { type: 'cmd', payload: { command: '', args: [] } },
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [] },
          consequent: { type: 'cmd', payload: { command: '', args: [] } },
        },
      ],
    },
  ],
  // ELSE
  defaultConsequent: { type: 'hope' },
};
