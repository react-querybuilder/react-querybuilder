/* oxlint-disable typescript/no-unnecessary-type-assertion -- the assertions are the point of this file */
// Type-only assertions guarding the vendored structural stand-ins in `./vendored` against upstream
// drift. This file has no runtime code; it exists to be typechecked. Assertions run in both
// directions where possible: the library → RQB direction catches upstream adding a required field,
// the RQB → library direction catches the stand-ins drifting out of usability.
import type {
  ConditionProperties,
  Event,
  OperatorEvaluator,
  RuleProperties,
  TopLevelCondition,
} from 'json-rules-engine';
import type { API as NodeRulesAPI, Fact, Rule as NodeRule } from 'node-rules';
import type { Condition, Constraint, Operator, Rule as RulePilotRule } from 'rulepilot';
import type {
  REConditionProperties,
  RENodeRulesAPI,
  RENodeRulesFact,
  RENodeRulesRule,
  REOperatorEvaluator,
  RERulePilotCondition,
  RERulePilotConstraint,
  RERulePilotOperator,
  RERulePilotRule,
  RERuleProperties,
  RETopLevelCondition,
  REEvent,
} from './vendored';

// json-rules-engine
const _jreTopLevelCondition1: TopLevelCondition = {} as RETopLevelCondition;
const _jreTopLevelCondition2: RETopLevelCondition = {} as TopLevelCondition;
const _jreConditionProperties1: ConditionProperties = {} as REConditionProperties;
const _jreConditionProperties2: REConditionProperties = {} as ConditionProperties;
const _jreEvent1: Event = {} as REEvent;
const _jreEvent2: REEvent = {} as Event;
const _jreOperatorEvaluator1: OperatorEvaluator<unknown, unknown> = {} as REOperatorEvaluator<
  unknown,
  unknown
>;
const _jreOperatorEvaluator2: REOperatorEvaluator<unknown, unknown> = {} as OperatorEvaluator<
  unknown,
  unknown
>;
// One direction only: `onSuccess`/`onFailure` are deliberately omitted from `RERuleProperties`.
const _jreRuleProperties: RuleProperties = {} as RERuleProperties;

// rulepilot
const _rulePilotOperator1: Operator = {} as RERulePilotOperator;
const _rulePilotOperator2: RERulePilotOperator = {} as Operator;
const _rulePilotConstraint1: Constraint = {} as RERulePilotConstraint;
const _rulePilotConstraint2: RERulePilotConstraint = {} as Constraint;
const _rulePilotCondition1: Condition = {} as RERulePilotCondition;
const _rulePilotCondition2: RERulePilotCondition = {} as Condition;
const _rulePilotRule1: RulePilotRule = {} as RERulePilotRule;
const _rulePilotRule2: RERulePilotRule = {} as RulePilotRule;

// node-rules
const _nodeRulesFact1: Fact = {} as RENodeRulesFact;
const _nodeRulesFact2: RENodeRulesFact = {} as Fact;
const _nodeRulesAPI1: NodeRulesAPI = {} as RENodeRulesAPI;
const _nodeRulesAPI2: RENodeRulesAPI = {} as NodeRulesAPI;
const _nodeRulesRule1: NodeRule = {} as RENodeRulesRule;
const _nodeRulesRule2: RENodeRulesRule = {} as NodeRule;

export type _Unused = [
  typeof _jreTopLevelCondition1,
  typeof _jreTopLevelCondition2,
  typeof _jreConditionProperties1,
  typeof _jreConditionProperties2,
  typeof _jreEvent1,
  typeof _jreEvent2,
  typeof _jreOperatorEvaluator1,
  typeof _jreOperatorEvaluator2,
  typeof _jreRuleProperties,
  typeof _rulePilotOperator1,
  typeof _rulePilotOperator2,
  typeof _rulePilotConstraint1,
  typeof _rulePilotConstraint2,
  typeof _rulePilotCondition1,
  typeof _rulePilotCondition2,
  typeof _rulePilotRule1,
  typeof _rulePilotRule2,
  typeof _nodeRulesFact1,
  typeof _nodeRulesFact2,
  typeof _nodeRulesAPI1,
  typeof _nodeRulesAPI2,
  typeof _nodeRulesRule1,
  typeof _nodeRulesRule2,
];
