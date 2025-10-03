import type { RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorSQL: RuleGroupProcessor<string> = (ruleGroup, options) => {
  const {
    fields,
    fallbackExpression,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    validateRule,
    validationMap,
  } = options;

  const processRuleGroup = (rg: RuleGroupTypeAny, outermostOrLonelyInGroup?: boolean): string => {
    // Skip muted groups
    if (rg.muted) {
      return outermostOrLonelyInGroup ? fallbackExpression : '';
    }

    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
    }

    const processedRules: string[] = [];
    let lastValidRuleIndex = -1;

    for (let i = 0; i < rg.rules.length; i++) {
      const rule = rg.rules[i];

      // Skip combinators for now, we'll handle them when we hit the next valid rule
      if (typeof rule === 'string') {
        continue;
      }

      // Skip muted rules/groups
      if (rule.muted) {
        continue;
      }

      let processedRule: string | undefined;

      // Groups
      if (isRuleGroup(rule)) {
        const result = processRuleGroup(
          rule,
          rg.rules.filter(r => typeof r !== 'string' && !r.muted).length === 1
        );
        if (result) {
          processedRule = result;
        }
      } else {
        // Basic rule validation
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          continue;
        }

        const escapeQuotes = (rule.valueSource ?? 'value') === 'value';
        const fieldData = getOption(fields, rule.field);

        const result = ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes,
          fieldData,
        });

        if (result) {
          processedRule = result;
        }
      }

      if (processedRule) {
        // If this is not the first valid rule and we're in IC format, find the combinator
        if (lastValidRuleIndex >= 0 && !isRuleGroupType(rg)) {
          // Find the combinator that immediately precedes this valid rule
          // (i.e., the last combinator before this rule)
          let combinator: string | undefined;
          for (let j = i - 1; j >= 0; j--) {
            const item = rg.rules[j];
            if (typeof item === 'string') {
              combinator = item;
              break;
            }
            // Skip muted rules
            if (item.muted) {
              continue;
            }
            // If we hit a non-muted rule, stop looking
            break;
          }
          if (combinator) {
            processedRules.push(combinator);
          }
        }

        processedRules.push(processedRule);
        lastValidRuleIndex = i;
      }
    }

    if (processedRules.length === 0) {
      return fallbackExpression;
    }

    return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
  };

  return processRuleGroup(ruleGroup, true);
};
