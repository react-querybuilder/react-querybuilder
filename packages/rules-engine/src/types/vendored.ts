/* oxlint-disable typescript/no-explicit-any -- mirrors upstream declarations verbatim */
// Structural stand-ins for types owned by this package's _optional_ peer dependencies. The public
// signatures of the export processors reference these instead of the real types so that the
// published declarations don't require `json-rules-engine`, `node-rules`, or `rulepilot` to be
// installed. Each processor's implementation still uses the real types internally, so `tsc`
// verifies assignability during `bun typecheck` (see `vendored.test-d.ts`) and upstream drift
// surfaces as a compile error.

/**
 * Structural stand-in for `json-rules-engine`'s `OperatorEvaluator`.
 *
 * @group Export
 */
export interface REOperatorEvaluator<A, B> {
  (factValue: A, compareToValue: B): boolean;
}

/**
 * Structural stand-in for `json-rules-engine`'s `ConditionProperties`.
 *
 * @group Export
 */
export interface REConditionProperties {
  fact: string;
  operator: string;
  /** Upstream declares `{ fact: string } | any`, which reduces to `any`. */
  value: any;
  path?: string;
  priority?: number;
  params?: Record<string, any>;
  name?: string;
}

/**
 * Structural stand-in for `json-rules-engine`'s `NestedCondition`.
 *
 * @group Export
 */
export type RENestedCondition = REConditionProperties | RETopLevelCondition;

/**
 * Structural stand-in for `json-rules-engine`'s `AllConditions`.
 *
 * @group Export
 */
export type REAllConditions = { all: RENestedCondition[]; name?: string; priority?: number };

/**
 * Structural stand-in for `json-rules-engine`'s `AnyConditions`.
 *
 * @group Export
 */
export type REAnyConditions = { any: RENestedCondition[]; name?: string; priority?: number };

/**
 * Structural stand-in for `json-rules-engine`'s `NotConditions`.
 *
 * @group Export
 */
export type RENotConditions = { not: RENestedCondition; name?: string; priority?: number };

/**
 * Structural stand-in for `json-rules-engine`'s `ConditionReference`.
 *
 * @group Export
 */
export type REConditionReference = { condition: string; name?: string; priority?: number };

/**
 * Structural stand-in for `json-rules-engine`'s `TopLevelCondition`.
 *
 * @group Export
 */
export type RETopLevelCondition =
  | REAllConditions
  | REAnyConditions
  | RENotConditions
  | REConditionReference;

/**
 * Structural stand-in for `json-rules-engine`'s `Event`.
 *
 * @group Export
 */
export interface REEvent {
  type: string;
  params?: Record<string, any>;
}

/**
 * Structural stand-in for `json-rules-engine`'s `RuleProperties`. `onSuccess`/`onFailure` are
 * deliberately omitted: this package never sets them, and omitting optional properties preserves
 * assignability to the real `RuleProperties` while avoiding the `EventHandler` → `Almanac` /
 * `RuleResult` subtree (`Almanac` is a class, so it can't be copied structurally).
 *
 * @group Export
 */
export interface RERuleProperties {
  conditions: RETopLevelCondition;
  event: REEvent;
  name?: string;
  priority?: number;
}

/**
 * Structural stand-in for `rulepilot`'s `Operator`.
 *
 * @group Export
 */
export type RERulePilotOperator =
  | '=='
  | '!='
  | '>'
  | '<'
  | '>='
  | '<='
  | 'in'
  | 'not in'
  | 'contains'
  | 'not contains'
  | 'contains any'
  | 'not contains any'
  | 'matches'
  | 'not matches';

/**
 * Structural stand-in for `rulepilot`'s `Constraint`.
 *
 * @group Export
 */
export interface RERulePilotConstraint {
  field: string;
  operator: RERulePilotOperator;
  value:
    | string
    | number
    | boolean
    | Record<string, unknown>
    | (string | number | boolean | Record<string, unknown>)[]
    | null;
}

/**
 * Structural stand-in for `rulepilot`'s `Condition`.
 *
 * @group Export
 */
export interface RERulePilotCondition<R = any> {
  any?: (RERulePilotConstraint | RERulePilotCondition<R>)[];
  all?: (RERulePilotConstraint | RERulePilotCondition<R>)[];
  none?: (RERulePilotConstraint | RERulePilotCondition<R>)[];
  result?: R;
}

/**
 * Structural stand-in for `rulepilot`'s `Rule`.
 *
 * @group Export
 */
export interface RERulePilotRule<R = any> {
  conditions: RERulePilotCondition<R> | RERulePilotCondition<R>[];
  default?: R;
}

/**
 * Structural stand-in for `node-rules`' `Fact`.
 *
 * @group Export
 */
export type RENodeRulesFact = { [key: string]: any; matchPath?: string[] };

/**
 * Structural stand-in for `node-rules`' `API`.
 *
 * @group Export
 */
export interface RENodeRulesAPI {
  rule: () => RENodeRulesRule;
  when: (outcome: any) => void;
  restart: () => void;
  stop: () => void;
  next: () => void;
}

/**
 * Structural stand-in for `node-rules`' `Consequence`.
 *
 * @group Export
 */
export interface RENodeRulesConsequence {
  (API: RENodeRulesAPI, fact: RENodeRulesFact): void;
  ruleRef?: string | undefined;
}

/**
 * Structural stand-in for `node-rules`' `Rule`.
 *
 * @group Export
 */
export type RENodeRulesRule = {
  id?: string;
  index?: number;
  name?: string;
  on?: boolean;
  priority?: number;
  condition: (API: RENodeRulesAPI, fact: RENodeRulesFact) => void;
  consequence: RENodeRulesConsequence;
};
