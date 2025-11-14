import type {
  CommonRuleAndGroupProperties,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from '@react-querybuilder/core';

// #region Conditions
export interface RECondition<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties,
    Partial<RulesEngine<R, C>> {
  antecedent: RuleGroupType;
  consequent?: Consequent;
}

export interface REConditionIC<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties,
    Partial<RulesEngineIC<R, C>> {
  antecedent: RuleGroupTypeIC;
  consequent?: Consequent;
}

export type REConditionAny<R extends RuleType = RuleType, C extends string = string> =
  | RECondition<R, C>
  | REConditionIC<R, C>;

export type REConditionCascade<RG extends RuleGroupTypeAny> = RG extends RuleGroupTypeIC
  ? REConditionIC[]
  : RECondition[];
// #endregion

// #region Rules engine
export interface RulesEngine<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties {
  conditions: REConditionCascade<RuleGroupType<R, C>>;
  defaultConsequent?: Consequent;
}

export interface RulesEngineIC<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties {
  conditions: REConditionCascade<RuleGroupTypeIC<R, C>>;
  defaultConsequent?: Consequent;
}

export type RulesEngineAny<R extends RuleType = RuleType, C extends string = string> =
  | RulesEngine<R, C>
  | RulesEngineIC<R, C>;
// #endregion

// #region Consequent
export type ConsequentBase<T extends string = string> = {
  id?: string;
  consequentType: T;
};

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

const _myREA: _ExampleConsequent = { consequentType: 'rea', command: 'cmd', args: [] };

const _rngn: RulesEngine = {
  conditions: [
    // IF
    {
      antecedent: {
        combinator: 'and',
        rules: [],
      },
      // consequent: { consequentType: 'cmd', payload: { command: '', args: [] }},
    },
    // ELSE IF
    {
      antecedent: { combinator: 'and', rules: [{ field: '', operator: '', value: '' }] },
      consequent: { consequentType: 'cmd', payload: { command: '', args: [] } },
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [] },
          consequent: { consequentType: 'cmd', payload: { command: '', args: [] } },
        },
      ],
    },
  ],
  // ELSE
  defaultConsequent: { consequentType: 'hope' },
};
