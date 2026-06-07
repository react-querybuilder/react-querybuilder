import type { RuleProperties } from 'json-rules-engine';
import type { Rule as NodeRule } from 'node-rules';
import type { Rule as RulePilotRule } from 'rulepilot';
import type {
  FormatRulesEngineOptions,
  RulesEngineAny,
  RulesEngineEvaluator,
  RulesEngineExportFormat,
  RulesEngineProcessor,
} from '../../types';
import { defaultRulesEngineProcessorJsonRulesEngine } from './defaultRulesEngineProcessorJsonRulesEngine';
import { defaultRulesEngineProcessorNative } from './defaultRulesEngineProcessorNative';
import { defaultRulesEngineProcessorNodeRules } from './defaultRulesEngineProcessorNodeRules';
import { defaultRulesEngineProcessorRulePilot } from './defaultRulesEngineProcessorRulePilot';

function formatRulesEngine(rulesEngine: RulesEngineAny): string;
function formatRulesEngine<TResult = unknown>(
  rulesEngine: RulesEngineAny,
  options: FormatRulesEngineOptions & { rulesEngineProcessor: RulesEngineProcessor<TResult> }
): TResult;
/**
 * Generates an array of 'json-rules-engine' rules from a rules engine object. The array can be
 * the first argument to `new Engine` or looped to add the rules one at a time.
 *
 * @example const engine = new Engine(formatRulesEngine(re, 'json-rules-engine'))
 *
 * @example formatRulesEngine(re, 'json-rules-engine').forEach(rule => engine.addRule(rule))
 *
 * @group Export
 */
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: 'json-rules-engine' | (FormatRulesEngineOptions & { format: 'json-rules-engine' })
): RuleProperties[];
/**
 * Compiles a rules engine object into an in-process evaluator: a function that, given a facts
 * object, returns the consequents of every condition that fires—in order, honoring the
 * `evaluationMode`. The evaluator has no runtime dependencies.
 *
 * @example
 * const evaluate = formatRulesEngine(re, 'native');
 * const firedConsequents = evaluate({ experience: 12 });
 *
 * @group Export
 */
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: 'native' | (FormatRulesEngineOptions & { format: 'native' })
): RulesEngineEvaluator;
/**
 * Compiles a rules engine object into a single [rulepilot](https://github.com/andrewbrg/rulepilot)
 * `Rule` whose ordered `conditions` reproduce the cascade, each paired with `result: consequent`.
 * `RulePilot.evaluate` returns the first matching condition's result, so this target models
 * single-outcome decisioning; cumulative evaluation mode throws.
 *
 * @example
 * const rule = formatRulesEngine(re, 'rulepilot');
 * const result = await RulePilot.evaluate(rule, { experience: 12 }, true);
 *
 * @group Export
 */
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: 'rulepilot' | (FormatRulesEngineOptions & { format: 'rulepilot' })
): RulePilotRule;
/**
 * Compiles a rules engine object into an array of live
 * [node-rules](https://github.com/mithunsatheesh/node-rules) `Rule` objects, ready to register on a
 * `RuleEngine`. Each fired condition's consequent is collected onto `fact.events`.
 *
 * @example
 * const R = new RuleEngine(formatRulesEngine(re, 'node-rules'));
 * R.execute({ experience: 12 }, ({ events }) => console.log(events));
 *
 * @group Export
 */
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: 'node-rules' | (FormatRulesEngineOptions & { format: 'node-rules' })
): NodeRule[];
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: RulesEngineExportFormat | FormatRulesEngineOptions = {}
) {
  const opts = typeof options === 'string' ? { format: options } : options;
  // Widened to `string` so the legacy no-dash `"jsonrulesengine"` alias can be matched without a
  // never-overlaps type error, and so added formats don't narrow this dispatch chain.
  const format: string | undefined = opts.format;

  if (typeof opts.rulesEngineProcessor === 'function') {
    return opts.rulesEngineProcessor(rulesEngine, opts);
  }

  if (format === 'json-rules-engine' || format === 'jsonrulesengine') {
    return defaultRulesEngineProcessorJsonRulesEngine(rulesEngine, opts);
  }

  if (format === 'native') {
    return defaultRulesEngineProcessorNative(rulesEngine, opts);
  }

  if (format === 'rulepilot') {
    return defaultRulesEngineProcessorRulePilot(rulesEngine, opts);
  }

  if (format === 'node-rules') {
    return defaultRulesEngineProcessorNodeRules(rulesEngine, opts);
  }

  return JSON.stringify(rulesEngine, null, 2);
}

export { formatRulesEngine };
