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

  const processRuleGroup = (rg: RuleGroupTypeAny, outermost?: boolean) => {
    // Skip muted groups
    if (rg.muted) {
      return '';
    }

    if (!isRuleOrGroupValid(rg, validationMap[rg.id ?? /* istanbul ignore next */ ''])) {
      return outermost ? fallbackExpression : '';
    }

    const processedParts: string[] = [];
    let lastValidRuleIndex = -1;

    for (let i = 0; i < rg.rules.length; i++) {
      const rule = rg.rules[i];

      // Skip combinators for now, we'll handle them when we hit the next valid rule
      if (typeof rule === 'string') {
        continue;
      }

      // Skip muted rules/groups
      if (rule.muted) {
        continue;
      }

      let processedRule: string | undefined;

      if (isRuleGroup(rule)) {
        const result = processRuleGroup(rule);
        if (result) {
          processedRule = result;
        }
      } else {
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
        const result = ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          escapeQuotes: (rule.valueSource ?? 'value') === 'value',
          fieldData,
        });

        if (result) {
          processedRule = result;
        }
      }

      if (processedRule) {
        // If this is not the first valid rule and we're in IC format, find the combinator
        if (lastValidRuleIndex >= 0 && !isRuleGroupType(rg)) {
          // Find the combinator that immediately precedes this valid rule
          let combinator: string | undefined;
          for (let j = i - 1; j >= 0; j--) {
            const item = rg.rules[j];
            if (typeof item === 'string') {
              combinator = item;
              break;
            }
            // Skip muted rules
            if (item.muted) {
              continue;
            }
            // If we hit a non-muted rule, stop looking
            break;
          }
          if (combinator) {
            processedParts.push(combinator);
          }
        }

        processedParts.push(processedRule);
        lastValidRuleIndex = i;
      }
    }

    const expression = processedParts.join(isRuleGroupType(rg) ? ` ${rg.combinator} ` : ' ');

    const [prefix, suffix] = rg.not || !outermost ? [`${rg.not ? '!' : ''}(`, ')'] : ['', ''];

    return expression ? `${prefix}${expression}${suffix}` : fallbackExpression;
  };

  return processRuleGroup(ruleGroup, true);
};
