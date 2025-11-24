import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "ldap" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorLDAP: RuleGroupProcessor<string> = (ruleGroup, options) => {
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

  const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
    if (
      !isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next -- @preserve */ ''])
    ) {
      return outermost ? fallbackExpression : '';
    }

    const rules: string[] = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* istanbul ignore next -- @preserve */
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
      .filter(Boolean);

    const expression = rules.join('');

    const [notPrefix, notSuffix] = rg.not ? ['(!', ')'] : ['', ''];
    const [prefix, suffix] =
      rules.length > 1
        ? [`${notPrefix}(${rg.combinator === 'or' ? '|' : '&'}`, `)${notSuffix}`]
        : [notPrefix, notSuffix];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
