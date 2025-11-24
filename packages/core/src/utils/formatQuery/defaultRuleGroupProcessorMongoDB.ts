import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';

const isBracketed = (str: string) => str.startsWith('{') && str.endsWith('}');

/**
 * Rule group processor used by {@link formatQuery} for "mongodb" format.
 *
 * Note that the "mongodb" format is deprecated in favor of the "mongodb_query" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorMongoDB: RuleGroupProcessor<string> = (
  ruleGroup,
  options,
  meta
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

  const processRuleGroup = (rg: RuleGroupType, outermost?: boolean) => {
    if (
      !isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next -- @preserve */ ''])
    ) {
      return outermost ? fallbackExpression : '';
    }

    const combinator = `"$${lc(rg.combinator)}"`;
    let hasChildRules = false;

    const expressions: string[] = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          const processedRuleGroup = processRuleGroup(rule);
          if (processedRuleGroup) {
            hasChildRules = true;
            // Don't wrap in curly braces if the result already is.
            return isBracketed(processedRuleGroup) ? processedRuleGroup : `{${processedRuleGroup}}`;
          }
          return '';
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
        : `${combinator}:[${expressions.join(',')}]`
      : fallbackExpression;
  };

  const processedQuery = processRuleGroup(convertFromIC(ruleGroup), true);
  return isBracketed(processedQuery) ? processedQuery : `{${processedQuery}}`;
};
