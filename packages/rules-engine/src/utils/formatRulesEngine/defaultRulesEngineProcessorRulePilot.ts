import { formatQuery } from '@react-querybuilder/core';
import type { Condition, Rule as RulePilotRule } from 'rulepilot';
import type { EvaluationMode, REConditionAny, RulesEngineProcessor } from '../../types';
import { defaultRuleGroupProcessorRulePilot } from './defaultRuleGroupProcessorRulePilot';
import { defaultRuleProcessorRulePilot } from './defaultRuleProcessorRulePilot';
import { walkRulesEngine } from './walkRulesEngine';

/**
 * Default processor for the `"rulepilot"` export format. Returns a single
 * [rulepilot](https://github.com/andrewbrg/rulepilot) `Rule` whose ordered `conditions` reproduce
 * the rules engine's cascade: each condition pairs a guard (its own antecedent AND-ed with its
 * ancestor antecedents and the negated antecedents of prior siblings) with `result: consequent`.
 *
 * Because `RulePilot.evaluate` returns a **single** result—the first matching condition's—this
 * target models single-outcome decisioning. A flat cascade (if/else-if/else) maps exactly; for a
 * rules engine whose nested or overlapping conditions would fire *multiple* consequents under the
 * `"json-rules-engine"`/`"native"` targets, rulepilot yields only the first match. Cumulative mode
 * (every matching condition fires) therefore has no rulepilot representation and **throws**.
 *
 * Guards built from empty antecedents compile to an always-true `{ all: [] }`, which rulepilot's
 * validator rejects; evaluate such rules with `RulePilot.evaluate(rule, criteria, true)` to skip
 * pre-validation.
 *
 * @example
 * const rule = formatRulesEngine(re, 'rulepilot');
 * const result = await RulePilot.evaluate(rule, { experience: 12 }, true);
 *
 * @group Export
 */
export const defaultRulesEngineProcessorRulePilot: RulesEngineProcessor<RulePilotRule> = (
  rulesEngine,
  opts
) => {
  const mode: EvaluationMode = opts.evaluationMode ?? rulesEngine.evaluationMode ?? 'cascade';

  if (mode === 'cumulative') {
    throw new Error(
      "The 'rulepilot' export format does not support cumulative evaluation mode because rulepilot returns a single (first-matched) result."
    );
  }

  const processAntecedent = (antecedent: REConditionAny['antecedent']): Condition =>
    formatQuery(antecedent, {
      ...opts.formatQueryOptions,
      ruleProcessor:
        (opts.formatQueryOptions?.ruleProcessor as typeof defaultRuleProcessorRulePilot) ??
        defaultRuleProcessorRulePilot,
      ruleGroupProcessor:
        (opts.formatQueryOptions
          ?.ruleGroupProcessor as typeof defaultRuleGroupProcessorRulePilot) ??
        defaultRuleGroupProcessorRulePilot,
    }) as unknown as Condition;

  const flattened = walkRulesEngine<Condition>(rulesEngine, mode, {
    processAntecedent,
    combine: guards => ({ all: guards }),
    negate: guard => ({ none: [guard] }),
  });

  // Attach each consequent as its condition's `result`. Every `guard` is a fresh object produced by
  // `combine`/`negate`, so assigning in place (rather than spreading) is safe and avoids an alloc.
  return {
    conditions: flattened.map(({ guard, consequent }) => {
      guard.result = consequent;
      return guard;
    }),
  };
};
