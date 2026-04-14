import type { RuleGroupProcessor, RuleGroupType } from '@react-querybuilder/core';
import {
  convertFromIC,
  getOption,
  isRuleGroup,
  isRuleOrGroupValid,
} from '@react-querybuilder/core';
import type { ConditionProperties, TopLevelCondition } from 'json-rules-engine';

export const defaultRuleGroupProcessorJsonRulesEngine: RuleGroupProcessor<TopLevelCondition> = (
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

  const processRuleGroup = <Outermost extends boolean>(
    rg: RuleGroupType,
    outermost?: Outermost
  ): Outermost extends true ? TopLevelCondition : TopLevelCondition | null => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return outermost
        ? { all: [] }
        : (null as Outermost extends true ? TopLevelCondition : TopLevelCondition | null);
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
        }) as ConditionProperties;
      })
      .filter(Boolean) as (ConditionProperties | TopLevelCondition)[];

    if (!outermost && processedRules.length === 0) {
      return null as Outermost extends true ? TopLevelCondition : TopLevelCondition | null;
    }

    const cond = rg.combinator === 'or' ? { any: processedRules } : { all: processedRules };

    return rg.not ? { not: cond } : cond;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
