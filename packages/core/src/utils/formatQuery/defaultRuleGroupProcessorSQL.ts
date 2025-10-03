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

    // First filter out muted items
    const filteredRules = rg.rules.filter(rule => {
      // Filter out muted rules and groups
      if (typeof rule !== 'string' && rule.muted) {
        return false;
      }
      return true;
    });

    // Clean up orphaned combinators in IC format
    const cleanedRules = !isRuleGroupType(rg)
      ? (() => {
          const result: typeof filteredRules = [];
          let lastWasRule = false;

          for (let i = 0; i < filteredRules.length; i++) {
            const current = filteredRules[i];

            if (typeof current === 'string') {
              // Only add combinator if the last item was a rule and there's a rule after this
              const nextIsRule = i + 1 < filteredRules.length && typeof filteredRules[i + 1] !== 'string';
              if (lastWasRule && nextIsRule) {
                result.push(current);
                lastWasRule = false;
              }
            } else {
              // It's a rule or group
              result.push(current);
              lastWasRule = true;
            }
          }

          return result;
        })()
      : filteredRules;

    const processedRules = cleanedRules
      .map(rule => {
        // Independent combinators
        if (typeof rule === 'string') {
          return rule;
        }

        // Groups
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule, rg.rules.length === 1);
        }

        // Basic rule validation
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          return '';
        }

        const escapeQuotes = (rule.valueSource ?? 'value') === 'value';

        const fieldData = getOption(fields, rule.field);

        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes,
          fieldData,
        });
      })
      .filter(Boolean);

    if (processedRules.length === 0) {
      return fallbackExpression;
    }

    return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
  };

  return processRuleGroup(ruleGroup, true);
};
