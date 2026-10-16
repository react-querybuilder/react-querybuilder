import type { RuleGroupProcessor, RuleGroupType } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';

/**
 * Rule group processor used by {@link formatQuery} for "qdrant" format. Produces a Qdrant
 * [`Filter`](https://qdrant.tech/documentation/concepts/filtering/) object.
 *
 * - `and` → `must`, `or` → `should`, `not` → `must_not` (native).
 * - Returns `{}` if no rules survive; omit the `filter` param in that case.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorQdrant: RuleGroupProcessor<Record<string, unknown>> = (
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

  const processRuleGroup = (rg: RuleGroupType): Record<string, unknown> | false => {
    if (
      !isRuleOrGroupValid(
        rg,
        validationMap[
          rg.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return false;
    }

    const processedRules = rg.rules
      .map(rule => {
        if (isRuleGroup(rule)) {
          return processRuleGroup(rule);
        }
        const [validationResult, fieldValidator] = validateRule(rule);
        if (
          !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
          rule.field === placeholderFieldName ||
          rule.operator === placeholderOperatorName ||
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

    if (processedRules.length === 0) {
      return false;
    }

    const isOr = lc(rg.combinator) === 'or';

    if (rg.not) {
      // NOT(a OR b) = NOT a AND NOT b
      return {
        must_not: isOr || processedRules.length === 1 ? processedRules : [{ must: processedRules }],
      };
    }

    return { [isOr ? 'should' : 'must']: processedRules };
  };

  const processed = processRuleGroup(convertFromIC(ruleGroup));
  return processed === false ? {} : processed;
};
