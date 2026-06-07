import type { RuleGroupProcessor, RuleGroupType } from '@react-querybuilder/core';
import {
  convertFromIC,
  getOption,
  isRuleGroup,
  isRuleOrGroupValid,
} from '@react-querybuilder/core';
import type { Condition, Constraint } from 'rulepilot';

/**
 * Default rule group processor for the `"rulepilot"` export format. Compiles a rule group into a
 * rulepilot {@link Condition}: `and` → `{ all }`, `or` → `{ any }`, and a negated group (`not`) is
 * wrapped in `{ none: [...] }` (rulepilot has no `not`). Invalid/placeholder rules—and rules whose
 * operator rulepilot cannot represent (the rule processor returns `null` for those)—are filtered
 * out exactly as in the other export targets. An empty nested group is dropped; an empty outermost
 * group compiles to an always-true `{ all: [] }`.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorRulePilot: RuleGroupProcessor<Condition> = (
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
  ): Outermost extends true ? Condition : Condition | null => {
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
        : (null as Outermost extends true ? Condition : Condition | null);
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
        }) as Constraint | Condition | null;
      })
      .filter(Boolean) as (Constraint | Condition)[];

    if (!outermost && processedRules.length === 0) {
      return null as Outermost extends true ? Condition : Condition | null;
    }

    const cond: Condition =
      rg.combinator === 'or' ? { any: processedRules } : { all: processedRules };

    return (rg.not ? { none: [cond] } : cond) as Outermost extends true
      ? Condition
      : Condition | null;
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
