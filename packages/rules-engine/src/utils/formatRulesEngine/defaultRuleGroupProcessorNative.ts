import type { RuleGroupProcessor, RuleGroupType } from '@react-querybuilder/core';
import {
  convertFromIC,
  getOption,
  isRuleGroup,
  isRuleOrGroupValid,
} from '@react-querybuilder/core';
import type { NativePredicate } from '../../types';

const alwaysTrue: NativePredicate = () => true;

/**
 * Default rule group processor for the `"native"` export format. Compiles a rule group into a
 * {@link NativePredicate} that ANDs (`"and"`) or ORs (`"or"`) its child predicates and negates the
 * result when `not` is set. Invalid/placeholder rules are filtered out exactly as in the other
 * export targets; an empty (or invalid outermost) group compiles to an always-true predicate.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorNative: RuleGroupProcessor<NativePredicate> = (
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

  const processRuleGroup = (rg: RuleGroupType, outermost?: boolean): NativePredicate | null => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return outermost ? alwaysTrue : null;
    }

    const processedRules = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule, false);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
          /* v8 ignore start -- @preserve */
          (placeholderValueName !== undefined && rule.value === placeholderValueName)
          /* v8 ignore stop -- @preserve */
        ) {
          return null;
        }
        const fieldData = getOption(fields, rule.field);
        return ruleProcessor(rule, {
          ...options,
          parseNumbers: getParseNumberBoolean(fieldData?.inputType),
          fieldData,
        }) as NativePredicate;
      })
      .filter(Boolean) as NativePredicate[];

    if (!outermost && processedRules.length === 0) {
      return null;
    }

    const combined: NativePredicate =
      rg.combinator === 'or'
        ? facts => processedRules.some(predicate => predicate(facts))
        : facts => processedRules.every(predicate => predicate(facts));

    return rg.not ? facts => !combined(facts) : combined;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true) as NativePredicate;
};
