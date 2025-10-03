import type { RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "jsonata" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorJSONata: RuleGroupProcessor<string> = (
  ruleGroup,
  options
) => {
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

  const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean) => {
    // Skip muted groups
    if (rg.muted) {
      return '';
    }

    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return outermost ? fallbackExpression : '';
    }

    const expression: string = rg.rules
      .filter(rule => typeof rule === 'string' || !rule.muted)
      .map(rule => {
        if (typeof rule === 'string') {
          return rule;
        }
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* istanbul ignore next */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
        ) {
          return '';
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes: (rule.valueSource ?? 'value') === 'value',
          fieldData,
        });
      })
      .filter(Boolean)
      .join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ');

    const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '$not' : ''}(`, ')'] : ['', ''];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(ruleGroup, true);
};
