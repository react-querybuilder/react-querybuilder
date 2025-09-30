import type {
  CommonRuleAndGroupProperties,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
} from 'react-querybuilder';

// #region Conditions
export interface RulesEngineCondition<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties,
    Partial<RulesEngine<R, C>> {
  condition: RuleGroupType;
  action?: RulesEngineAction;
}

export interface RulesEngineConditionIC<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties,
    Partial<RulesEngineIC<R, C>> {
  condition: RuleGroupTypeIC;
  action?: RulesEngineAction;
}

export type RulesEngineConditionAny<R extends RuleType = RuleType, C extends string = string> =
  | RulesEngineCondition<R, C>
  | RulesEngineConditionIC<R, C>;

export type RulesEngineConditions<RG extends RuleGroupTypeAny> = RG extends RuleGroupTypeIC
  ? RulesEngineConditionIC[]
  : RulesEngineCondition[];
// #endregion

// #region Rules engines
export interface RulesEngine<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties {
  conditions: RulesEngineConditions<RuleGroupType<R, C>>;
  defaultAction?: RulesEngineAction;
}

export interface RulesEngineIC<R extends RuleType = RuleType, C extends string = string>
  extends CommonRuleAndGroupProperties {
  conditions: RulesEngineConditions<RuleGroupTypeIC<R, C>>;
  defaultAction?: RulesEngineAction;
}

export type RulesEngineAny<R extends RuleType = RuleType, C extends string = string> =
  | RulesEngine<R, C>
  | RulesEngineIC<R, C>;
// #endregion

// #region Actions
export type RulesEngineActionBase<T extends string = string> = {
  id?: string;
  actionType: T;
};

export interface RulesEngineAction extends RulesEngineActionBase {
  [etc: string]: unknown;
}
// #endregion

// -------------------------------------------
// Playground:
// -------------------------------------------

interface _ExampleRulesEngineAction extends RulesEngineActionBase<'rea' | 'hope'> {
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

const _myREA: _ExampleRulesEngineAction = { actionType: 'rea', command: 'cmd', args: [] };

const _rngn: RulesEngine = {
  conditions: [
    // IF
    {
      condition: {
        combinator: 'and',
        rules: [],
      },
      // action: { actionType: 'cmd', payload: { command: '', args: [] }},
    },
    // ELSE IF
    {
      condition: { combinator: 'and', rules: [{ field: '', operator: '', value: '' }] },
      action: { actionType: 'cmd', payload: { command: '', args: [] } },
      conditions: [
        {
          condition: { combinator: 'and', rules: [] },
          action: { actionType: 'cmd', payload: { command: '', args: [] } },
        },
      ],
    },
  ],
  // ELSE
  defaultAction: { actionType: 'hope' },
};
