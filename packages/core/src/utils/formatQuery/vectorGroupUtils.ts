import type { FormatQueryFinalOptions, RuleGroupType, RuleGroupTypeAny } from '../../types';
import { convertFromIC } from '../convertQuery';
import { isRuleGroup } from '../isRuleGroup';
import { isRuleOrGroupValid } from '../isRuleOrGroupValid';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';
import type { FormatCapabilities } from './formatCapabilities';
import { negateRuleGroup } from './negation';

/**
 * Shared group walker for vector DB formats: validation, placeholders, IC conversion, and
 * De Morgan push-down when `!caps.nativeNot`. `combine` gets ≥1 processed children; `not` is
 * only ever `true` for native-`not` formats. Returns `false` if nothing survives.
 *
 * @internal
 */
export const processVectorRuleGroup = <T>(
  ruleGroup: RuleGroupTypeAny,
  options: FormatQueryFinalOptions,
  caps: FormatCapabilities,
  combine: (children: T[], isOr: boolean, not: boolean, outermost: boolean) => T
): T | false => {
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

  const processRuleGroup = (rgIn: RuleGroupType, outermost = false): T | false => {
    if (
      !isRuleOrGroupValid(
        rgIn,
        validationMap[
          rgIn.id ?? /* v8 ignore start -- @preserve */ '' /* v8 ignore stop -- @preserve */
        ]
      )
    ) {
      return false;
    }

    const rg = rgIn.not && !caps.nativeNot ? negateRuleGroup(rgIn) : rgIn;

    const children: T[] = [];
    for (const rule of rg.rules) {
      if (isRuleGroup(rule)) {
        const g = processRuleGroup(rule);
        if (g !== false) children.push(g);
        continue;
      }
      const [validationResult, fieldValidator] = validateRule(rule);
      if (
        !isRuleOrGroupValid(rule, validationResult, fieldValidator) ||
        rule.field === placeholderFieldName ||
        rule.operator === placeholderOperatorName ||
        (placeholderValueName !== undefined && rule.value === placeholderValueName)
      ) {
        continue;
      }
      const fieldData = getOption(fields, rule.field);
      const processed = ruleProcessor(rule, {
        ...options,
        parseNumbers: getParseNumberBoolean(fieldData?.inputType),
        fieldData,
      }) as T | false | undefined;
      if (processed !== false && processed !== undefined && processed !== '') {
        children.push(processed);
      }
    }

    if (children.length === 0) return false;

    return combine(children, lc(rg.combinator) === 'or', !!rg.not, outermost);
  };

  return processRuleGroup(convertFromIC(ruleGroup), true);
};
