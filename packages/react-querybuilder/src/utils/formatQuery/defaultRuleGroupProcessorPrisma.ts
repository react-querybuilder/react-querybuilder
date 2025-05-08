import type { RuleGroupProcessor, RuleGroupType } from '../../types/index.noReact';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Default fallback object used by {@link formatQuery} for "prisma" format.
 *
 * @group Export
 */
// TODO?: make this configurable
export const prismaFallback = {} as const;

/**
 * Rule group processor used by {@link formatQuery} for "prisma" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorPrisma: RuleGroupProcessor = (ruleGroup, options) => {
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
      return outermost ? prismaFallback : false;
    }

    const combinator = rg.combinator.toUpperCase();
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
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          fieldData,
        });
      })
      .filter(Boolean);

    return expressions.length > 0
      ? expressions.length === 1 && !hasChildRules
        ? expressions[0]
        : { [combinator]: expressions }
      : prismaFallback;
  };

  const result = processRuleGroup(convertFromIC(ruleGroup), true);

  return ruleGroup.not ? { NOT: result } : result;
};
