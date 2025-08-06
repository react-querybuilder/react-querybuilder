import type { RuleGroupType, RuleType } from './ruleGroups';
import type { RuleGroupTypeAny, RuleGroupTypeIC } from './ruleGroupsIC';

export type RulesEngineCondition<RG extends RuleGroupTypeAny> = RG & {
  action?: RulesEngineAction;
  conditions?: RulesEngineConditions<RG>;
};

export type RulesEngineConditions<RG extends RuleGroupTypeAny> =
  | RulesEngineCondition<RG>[] // if/if-else clauses only
  | [...RulesEngineCondition<RG>[], RulesEngineAction]; // if/if-else clauses and a final, unconditional "else" action

export interface RulesEngine<R extends RuleType = RuleType, C extends string = string> {
  conditions: RulesEngineConditions<RuleGroupType<R, C>>;
}

export interface RulesEngineIC<R extends RuleType = RuleType, C extends string = string> {
  conditions: RulesEngineConditions<RuleGroupTypeIC<R, C>>;
}

export type RulesEngineActionBase<T extends string = string> = {
  actionType: T;
};

export interface RulesEngineAction extends RulesEngineActionBase {
  [etc: string]: unknown;
}

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
      combinator: 'and',
      rules: [],
      // action: { actionType: 'cmd', payload: { command: '', args: [] }},
    },
    // ELSE IF
    {
      combinator: 'and',
      rules: [{ field: '', operator: '', value: '' }],
      action: { actionType: 'cmd', payload: { command: '', args: [] } },
      conditions: [
        {
          combinator: 'and',
          rules: [],
          action: { actionType: 'cmd', payload: { command: '', args: [] } },
        },
      ],
    },
    // ELSE
    { actionType: 'hope' },
  ],
};

// conditions:
// oxlint-disable-next-line no-dupe-else-if
if (process.env.TZ) {
  // action:
  // doSomething();

  // conditions:
  if (process.env.TZ) {
    // action:
    // doSomething();
  }
} else if (process.env.TZ) {
  // action:
  // doSomething();
} else {
  // action:
  // doSomething();
}
