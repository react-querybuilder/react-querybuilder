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
    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next -- @preserve */ ''])) {
      // TODO: test for the last case and remove "ignore" comment
      return outermostOrLonelyInGroup ? fallbackExpression : /* istanbul ignore next -- @preserve */ '';
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
        const processedGroup = processRuleGroup(rule, rg.rules.length === 1);
        // istanbul ignore else -- @preserve
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

      // Basic rule validation
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName ||
        (placeholderValueName !== undefined && rule.value === placeholderValueName)
      ) {
        continue;
      }

      const escapeQuotes = (rule.valueSource ?? 'value') === 'value';

      const fieldData = getOption(fields, rule.field);

      const processedRule = ruleProcessor(rule, {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        escapeQuotes,
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

    if (processedRules.length === 0) {
      return fallbackExpression;
    }

    return `${rg.not ? 'NOT ' : ''}(${processedRules.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ')})`;
  };

  return processRuleGroup(ruleGroup, true);
};
