import { formatQuery } from '@react-querybuilder/core';
import type { API as NodeRulesAPI, Fact, Rule as NodeRule } from 'node-rules';
import type {
  EvaluationMode,
  NativePredicate,
  REConditionAny,
  RulesEngineProcessor,
} from '../../types';
import { defaultRuleGroupProcessorNative } from './defaultRuleGroupProcessorNative';
import { defaultRuleProcessorNative } from './defaultRuleProcessorNative';
import { walkRulesEngine } from './walkRulesEngine';

/**
 * Default processor for the `"node-rules"` export format. Returns an array of live
 * [node-rules](https://github.com/mithunsatheesh/node-rules) `Rule` objects with real
 * `condition`/`consequence` functions—ready to pass to `new RuleEngine(...)` or `register(...)`.
 * Antecedents are compiled to predicates (shared with the `"native"` target) so evaluation needs no
 * operator registration. Each fired condition's consequent is pushed onto `fact.events` (mirroring
 * the `json-rules-engine` result shape).
 *
 * Sibling/ancestor relationships and the `evaluationMode` are baked into each rule's guard, so every
 * rule simply continues with `R.next()`; cascade vs. cumulative semantics fall out of the shared
 * walk.
 *
 * @example
 * const R = new RuleEngine(formatRulesEngine(re, 'node-rules'));
 * R.execute({ experience: 12 }, ({ events }) => console.log(events));
 *
 * @group Export
 */
export const defaultRulesEngineProcessorNodeRules: RulesEngineProcessor<NodeRule[]> = (
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

  // node-rules is a forward-chaining engine: whenever a consequence mutates the fact it restarts
  // evaluation from the highest-priority rule. Pushing a consequent onto `fact.events` is such a
  // mutation, so without a guard a matched rule would re-fire forever. We therefore record which
  // rules have already fired in a WeakMap keyed on the (per-`execute`, deep-cloned) fact object
  // node-rules hands to each callback, ensuring every matching rule contributes exactly once.
  const firedByFact = new WeakMap<object, Set<number>>();

  return flattened.map((rule, index) => ({
    // Strictly descending and always >= 1: node-rules' sort treats a falsy `0` priority as
    // "unprioritized", so 1-based values keep the walk order deterministic.
    priority: flattened.length - index,
    condition: (R: NodeRulesAPI, fact: Fact) =>
      R.when(!firedByFact.get(fact)?.has(index) && rule.guard(fact)),
    consequence: (R: NodeRulesAPI, fact: Fact) => {
      let fired = firedByFact.get(fact);
      if (!fired) {
        fired = new Set();
        firedByFact.set(fact, fired);
      }
      fired.add(index);
      (fact.events ??= []).push(rule.consequent);
      R.next();
    },
  }));
};
