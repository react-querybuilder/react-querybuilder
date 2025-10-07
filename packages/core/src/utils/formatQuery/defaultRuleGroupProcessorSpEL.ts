import type { RuleGroupProcessor, RuleGroupTypeAny } from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { getOption } from '../optGroupUtils';

/**
 * Default rule processor used by {@link formatQuery} for "spel" format.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorSpEL: RuleGroupProcessor<string> = (ruleGroup, options) => {
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

  const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean): string => {
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return outermost ? fallbackExpression : '';
    }

    const processedRules = [];
    let precedingCombinator = '';
    let firstRule = true;

    for (const rule of rg.rules) {
      // Independent combinators
      if (typeof rule === 'string') {
        precedingCombinator = rule;
        continue;
      }

      // Groups
      if (isRuleGroup(rule)) {
        const processedGroup = processRuleGroup(rule);
        if (processedGroup) {
          if (!firstRule && precedingCombinator) {
            processedRules.push(precedingCombinator);
            precedingCombinator = '';
          }
          firstRule = false;
          processedRules.push(processedGroup);
        }
        continue;
      }

      // Rules
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName ||
        /* istanbul ignore next */
        (placeholderValueName !== undefined && rule.value === placeholderValueName)
      ) {
        continue;
      }

      const fieldData = getOption(fields, rule.field);
      const processedRule = ruleProcessor(rule, {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        escapeQuotes: (rule.valueSource ?? 'value') === 'value',
        fieldData,
      });

      if (processedRule) {
        if (!firstRule && precedingCombinator) {
          processedRules.push(precedingCombinator);
          precedingCombinator = '';
        }
        firstRule = false;
        processedRules.push(processedRule);
      }
    }

    const expression = processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ');

    const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(ruleGroup, true);
};
