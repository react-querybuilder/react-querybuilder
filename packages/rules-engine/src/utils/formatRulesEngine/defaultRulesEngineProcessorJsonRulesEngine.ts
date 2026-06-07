import { formatQuery } from '@react-querybuilder/core';
import type {
  Engine,
  OperatorEvaluator,
  RuleProperties,
  TopLevelCondition,
} from 'json-rules-engine';
import type {
  EvaluationMode,
  REConditionAny,
  RulesEngine,
  RulesEngineProcessor,
} from '../../types';
import { defaultRuleGroupProcessorJsonRulesEngine } from './defaultRuleGroupProcessorJsonRulesEngine';
import { defaultRuleProcessorJsonRulesEngine } from './defaultRuleProcessorJsonRulesEngine';
import { inRange } from './nativeOperators';

/**
 * Operator evaluators for the React Query Builder operators that have no `json-rules-engine`
 * built-in equivalent. Register these on an `Engine` so that rules exported by
 * {@link formatRulesEngine} which use these operators can be evaluated—either manually via
 * `engine.addOperator(...)`, or automatically by passing the engine as `context.engine` to
 * {@link formatRulesEngine}.
 *
 * @group Export
 */
export const jsonRulesEngineAdditionalOperators: Record<
  string,
  OperatorEvaluator<unknown, unknown>
> = {
  beginsWith: (factVal, compareVal) => `${factVal}`.startsWith(`${compareVal}`),
  doesNotBeginWith: (factVal, compareVal) => !`${factVal}`.startsWith(`${compareVal}`),
  endsWith: (factVal, compareVal) => `${factVal}`.endsWith(`${compareVal}`),
  doesNotEndWith: (factVal, compareVal) => !`${factVal}`.endsWith(`${compareVal}`),
  // These work the same as the non-`*Generic` operators in `json-rules-engine`,
  // but avoid the type validation that would prevent their use in some cases.
  containsGeneric: (factVal, compareVal) => `${factVal}`.includes(`${compareVal}`),
  doesNotContainGeneric: (factVal, compareVal) => !`${factVal}`.includes(`${compareVal}`),
  // Robust between/notBetween: accept array or comma-separated bounds (parsing/reordering numbers).
  // Invalid bounds (fewer than two valid values) match nothing for either operator.
  between: (factVal, compareVal) => inRange(factVal, compareVal) === true,
  notBetween: (factVal, compareVal) => inRange(factVal, compareVal) === false,
};

/** Wraps a condition so it only passes when the wrapped condition fails. */
const negate = (condition: TopLevelCondition): TopLevelCondition => ({ not: condition });

/** Combines guard conditions into a single `json-rules-engine` top-level condition. */
const combine = (guards: TopLevelCondition[]): TopLevelCondition =>
  guards.length === 1 ? guards[0] : { all: guards };

/**
 * Default processor for the `json-rules-engine` export format.
 *
 * Conditions are walked recursively. Each emitted rule is guarded by its ancestor antecedents
 * (structural nesting) and—in `"cascade"` mode—by the negated antecedents of its prior siblings,
 * producing if/else-if/else semantics. In `"cumulative"` mode prior-sibling negations are omitted,
 * so every condition is evaluated independently. A `defaultConsequent` behaves like the `else`
 * branch in `"cascade"` mode (firing only when every sibling antecedent at its level fails), and as
 * an always-true baseline in `"cumulative"` mode.
 *
 * @group Export
 */
export const defaultRulesEngineProcessorJsonRulesEngine: RulesEngineProcessor<RuleProperties[]> = (
  rulesEngine,
  opts
) => {
  // If a `json-rules-engine` Engine (or anything exposing `addOperator`) is supplied as the
  // `context.engine` option, register the additional operators on it so exported rules that use
  // them can be evaluated.
  const engine = opts.context?.engine;
  if (
    engine &&
    typeof engine === 'object' &&
    'addOperator' in engine &&
    typeof engine.addOperator === 'function'
  ) {
    for (const [operator, evaluator] of Object.entries(jsonRulesEngineAdditionalOperators)) {
      (engine as Engine).addOperator(operator, evaluator);
    }
  }

  const mode: EvaluationMode = opts.evaluationMode ?? rulesEngine.evaluationMode ?? 'cascade';

  const processAntecedent = (antecedent: REConditionAny['antecedent']): TopLevelCondition =>
    formatQuery(antecedent, {
      ...opts.formatQueryOptions,
      ruleProcessor:
        (opts.formatQueryOptions?.ruleProcessor as typeof defaultRuleProcessorJsonRulesEngine) ??
        defaultRuleProcessorJsonRulesEngine,
      ruleGroupProcessor:
        (opts.formatQueryOptions
          ?.ruleGroupProcessor as typeof defaultRuleGroupProcessorJsonRulesEngine) ??
        defaultRuleGroupProcessorJsonRulesEngine,
    }) as unknown as TopLevelCondition;

  const walk = (node: RulesEngine, ancestorGuards: TopLevelCondition[]): RuleProperties[] => {
    const rules: RuleProperties[] = [];
    const siblingNegations: TopLevelCondition[] = [];

    for (const c of node.conditions) {
      const ownAntecedent = processAntecedent(c.antecedent);
      const guards = [
        ...ancestorGuards,
        ...(mode === 'cascade' ? siblingNegations : []),
        ownAntecedent,
      ];

      const hasNested = Array.isArray(c.conditions) && c.conditions.length > 0;

      // Emit a rule for the consequent. A condition that only groups nested conditions
      // (no consequent) contributes no event of its own.
      if (c.consequent || !hasNested) {
        rules.push({ conditions: combine(guards), event: c.consequent ?? { type: '' } });
      }

      if (hasNested) {
        rules.push(...walk(c as RulesEngine, guards));
      }

      siblingNegations.push(negate(ownAntecedent));
    }

    if (node.defaultConsequent) {
      // In cascade mode the default consequent is the `else` branch: it fires only when every
      // sibling antecedent fails. In cumulative mode there is no `else`, so it is an always-true
      // baseline (still guarded by ancestor antecedents at nested levels).
      const guards = [...ancestorGuards, ...(mode === 'cascade' ? siblingNegations : [])];
      rules.push({
        conditions: guards.length === 0 ? { all: [] } : combine(guards),
        event: node.defaultConsequent,
      });
    }

    return rules;
  };

  return walk(rulesEngine as RulesEngine, []);
};
