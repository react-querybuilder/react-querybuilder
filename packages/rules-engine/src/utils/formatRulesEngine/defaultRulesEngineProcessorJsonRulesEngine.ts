import { formatQuery } from '@react-querybuilder/core';
import type { RuleProperties } from 'json-rules-engine';
import type { RulesEngineProcessor } from '../../types';
import { defaultRuleGroupProcessorJsonRulesEngine } from './defaultRuleGroupProcessorJsonRulesEngine';
import { defaultRuleProcessorJsonRulesEngine } from './defaultRuleProcessorJsonRulesEngine';

/**
 * Default processor for the `json-rules-engine` export format.
 *
 * @group Export
 */
export const defaultRulesEngineProcessorJsonRulesEngine: RulesEngineProcessor<RuleProperties[]> = (
  rulesEngine,
  opts = {}
) =>
  rulesEngine.conditions.map<RuleProperties>(c => ({
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
