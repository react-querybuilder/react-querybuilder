import { formatQuery } from '@react-querybuilder/core';
import type {
  EvaluationMode,
  NativePredicate,
  REConditionAny,
  RulesEngineEvaluator,
  RulesEngineProcessor,
} from '../../types';
import { defaultRuleGroupProcessorNative } from './defaultRuleGroupProcessorNative';
import { defaultRuleProcessorNative } from './defaultRuleProcessorNative';
import { walkRulesEngine } from './walkRulesEngine';

/**
 * Default processor for the `"native"` export format. Returns an in-process
 * {@link RulesEngineEvaluator}: a function that, given a facts object, returns the consequents of
 * every condition that fires—in order, honoring the `evaluationMode`. Antecedents are compiled to
 * predicates with no runtime dependencies.
 *
 * @example
 * const evaluate = formatRulesEngine(re, 'native');
 * const firedConsequents = evaluate({ experience: 12 });
 *
 * @group Export
 */
export const defaultRulesEngineProcessorNative: RulesEngineProcessor<RulesEngineEvaluator> = (
  rulesEngine,
  opts
) => {
  const mode: EvaluationMode = opts.evaluationMode ?? rulesEngine.evaluationMode ?? 'cascade';

  const processAntecedent = (antecedent: REConditionAny['antecedent']): NativePredicate =>
    formatQuery(antecedent, {
      ...opts.formatQueryOptions,
      ruleProcessor:
        (opts.formatQueryOptions?.ruleProcessor as typeof defaultRuleProcessorNative) ??
        defaultRuleProcessorNative,
      ruleGroupProcessor:
        (opts.formatQueryOptions?.ruleGroupProcessor as typeof defaultRuleGroupProcessorNative) ??
        defaultRuleGroupProcessorNative,
    }) as unknown as NativePredicate;

  const flattened = walkRulesEngine<NativePredicate>(rulesEngine, mode, {
    processAntecedent,
    combine: predicates => facts => predicates.every(predicate => predicate(facts)),
    negate: predicate => facts => !predicate(facts),
  });

  return facts => flattened.filter(rule => rule.guard(facts)).map(rule => rule.consequent);
};
