import { formatQuery } from '@react-querybuilder/core';
import type { RuleProperties } from 'json-rules-engine';
import type {
  FormatRulesEngineOptions,
  RulesEngineAny,
  RulesEngineExportFormat,
  RulesEngineProcessor,
} from '../../types';
import { defaultRuleGroupProcessorJsonRulesEngine } from './defaultRuleGroupProcessorJsonRulesEngine';
import { defaultRuleProcessorJsonRulesEngine } from './defaultRuleProcessorJsonRulesEngine';

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
function formatRulesEngine(
  rulesEngine: RulesEngineAny,
  options: RulesEngineExportFormat | FormatRulesEngineOptions = {}
) {
  const opts = typeof options === 'string' ? { format: options } : options;

  if (typeof opts.rulesEngineProcessor === 'function') {
    return opts.rulesEngineProcessor(rulesEngine, opts);
  }

  if (opts.format === 'json-rules-engine' || opts.format === 'jsonrulesengine') {
    return rulesEngine.conditions.map<RuleProperties>(c => ({
      conditions: formatQuery(c.antecedent, {
        ...opts.formatQueryOptions,
        ruleProcessor:
          (opts.formatQueryOptions?.ruleProcessor as typeof defaultRuleProcessorJsonRulesEngine) ??
          defaultRuleProcessorJsonRulesEngine,
        ruleGroupProcessor:
          (opts.formatQueryOptions
            ?.ruleGroupProcessor as typeof defaultRuleGroupProcessorJsonRulesEngine) ??
          defaultRuleGroupProcessorJsonRulesEngine,
      }),
      event:
        // istanbul ignore next
        c.consequent ?? { type: '' },
    }));
  }

  return JSON.stringify(rulesEngine, null, 2);
}

export { formatRulesEngine };
