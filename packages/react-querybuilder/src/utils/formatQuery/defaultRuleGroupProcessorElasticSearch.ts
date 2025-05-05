import type { RuleGroupProcessor, RuleGroupType } from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "elasticsearch" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorElasticSearch: RuleGroupProcessor<Record<string, unknown>> = (
  ruleGroup,
  options
) => {
  const {
    fields,
    getParseNumberBoolean,
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    ruleProcessor,
    validateRule,
    validationMap,
  } = options;

  const query = convertFromIC(ruleGroup);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const processRuleGroup = (rg: RuleGroupType): Record<string, any> | false => {
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return false;
    }

    const processedRules = rg.rules
      .map(rule => {
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
          return false;
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          fieldData,
        });
      })
      .filter(Boolean);

    if (processedRules.length === 0) {
      return false;
    }

    return {
      bool: rg.not
        ? {
            must_not: /^or$/i.test(rg.combinator)
              ? { bool: { should: processedRules } }
              : processedRules,
          }
        : { [/^or$/i.test(rg.combinator) ? 'should' : 'must']: processedRules },
    };
  };

  const processedRuleGroup = processRuleGroup(query);
  return processedRuleGroup === false ? {} : processedRuleGroup;
};
