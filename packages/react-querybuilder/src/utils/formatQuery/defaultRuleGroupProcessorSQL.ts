import type { RuleGroupProcessor, RuleGroupTypeAny } from '../../types/index.noReact';
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
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next */ '';
    }

    const processedRules = rg.rules
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
