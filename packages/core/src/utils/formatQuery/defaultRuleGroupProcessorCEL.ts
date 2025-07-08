import type {
  DefaultCombinatorName,
  RuleGroupProcessor,
  RuleGroupTypeAny,
} from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';
import { celCombinatorMap } from './utils';

/**
 * Rule group processor used by {@link formatQuery} for "cel" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorCEL: RuleGroupProcessor<string> = (ruleGroup, options) => {
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
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return outermost ? fallbackExpression : '';
    }

    const expression: string = rg.rules
      .map(rule => {
        if (typeof rule === 'string') {
          return celCombinatorMap[rule as DefaultCombinatorName];
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
      .join(
        isRuleGroupType(rg) ? ` ${celCombinatorMap[rg.combinator as DefaultCombinatorName]} ` : ' '
      );

    const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(ruleGroup, true);
};
