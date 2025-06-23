import type { RuleGroupProcessor, RuleGroupType } from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';

/**
 * Default fallback object used by {@link formatQuery} for "mongodb_query" format.
 *
 * @group Export
 */
export const mongoDbFallback = { $and: [{ $expr: true }] } as const;

/**
 * Rule group processor used by {@link formatQuery} for "mongodb_query" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorMongoDBQuery: RuleGroupProcessor = (
  ruleGroup,
  options,
  meta
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

  const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return outermost ? mongoDbFallback : false;
    }

    const combinator = `$${lc(rg.combinator)}`;
    let hasChildRules = false;

    const expressions: Record<string, unknown>[] = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          const processedRuleGroup = processRuleGroup(rule);
          if (processedRuleGroup) {
            hasChildRules = true;
            return processedRuleGroup;
          }
          return false;
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
        return ruleProcessor(
          rule,
          {
            ...options,
            parseNumbers: getParseNumberBoolean(fieldData?.inputType),
            fieldData,
          },
          meta
        );
      })
      .filter(Boolean);

    return expressions.length > 0
      ? expressions.length === 1 && !hasChildRules
        ? expressions[0]
        : { [combinator]: expressions }
      : mongoDbFallback;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
