import { formatQuery } from '@react-querybuilder/core';
import type { RuleProperties, TopLevelCondition } from 'json-rules-engine';
import type { Consequent, EvaluationMode, REConditionAny, RulesEngineProcessor } from '../../types';
import { defaultRuleGroupProcessorJsonRulesEngine } from './defaultRuleGroupProcessorJsonRulesEngine';
import { defaultRuleProcessorJsonRulesEngine } from './defaultRuleProcessorJsonRulesEngine';

/** Node shape shared by a rules engine and any of its nested conditions. */
interface RENode {
  conditions: REConditionAny[];
  defaultConsequent?: Consequent;
}

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

  const walk = (node: RENode, ancestorGuards: TopLevelCondition[]): RuleProperties[] => {
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
        rules.push(...walk(c as RENode, guards));
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

  return walk(rulesEngine as RENode, []);
};
