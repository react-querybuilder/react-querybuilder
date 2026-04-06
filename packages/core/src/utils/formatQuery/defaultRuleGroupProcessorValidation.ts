import type {
  RuleGroupICValidationResult,
  RuleGroupProcessor,
  RuleGroupValidationResult,
  RuleGroupTypeAny,
  RuleType,
  RuleValidationResult,
  RuleValidator,
  ValidationResult,
} from '../../types';
import { isRuleGroup, isRuleGroupType } from '../isRuleGroup';
import { isRuleOrGroupValid, isValidationResult } from '../isRuleOrGroupValid';

/**
 * Rule group processor used by {@link formatQuery} for "validation" format.
 *
 * Produces an annotated copy of the query tree with `valid` and optional `reasons`
 * properties on every rule and group. A group's `valid` reflects both its own
 * structural validity and the validity of all its descendants.
 *
 * @group Export
 */
export const defaultRuleGroupProcessorValidation: RuleGroupProcessor<
  RuleGroupValidationResult | RuleGroupICValidationResult
> = (ruleGroup, options) => {
  const {
    placeholderFieldName,
    placeholderOperatorName,
    placeholderValueName,
    validateRule,
    validationMap,
  } = options;

  const processRuleGroup = (
    rg: RuleGroupTypeAny
  ): RuleGroupValidationResult | RuleGroupICValidationResult => {
    const groupValidationEntry = validationMap[rg.id ?? ''];
    const groupSelfValid = isRuleOrGroupValid(rg, groupValidationEntry);

    const groupReasons = getReasons(groupValidationEntry);

    let allChildrenValid = true;
    const annotatedRules: (
      | RuleValidationResult
      | RuleGroupValidationResult
      | RuleGroupICValidationResult
      | string
    )[] = [];

    for (const rule of rg.rules) {
      // Independent combinators
      if (typeof rule === 'string') {
        annotatedRules.push(rule);
        continue;
      }

      // Sub-groups
      if (isRuleGroup(rule)) {
        const annotatedGroup = processRuleGroup(rule);
        if (!annotatedGroup.valid) {
          allChildrenValid = false;
        }
        annotatedRules.push(annotatedGroup);
        continue;
      }

      // Rules
      const [validationResult, fieldValidator] = validateRule(rule);
      const ruleValid =
        isRuleOrGroupValid(rule, validationResult, fieldValidator) &&
        rule.field !== placeholderFieldName &&
        rule.operator !== placeholderOperatorName &&
        !(placeholderValueName !== undefined && rule.value === placeholderValueName);

      if (!ruleValid) {
        allChildrenValid = false;
      }

      const ruleReasons =
        getReasons(validationResult) ?? getFieldValidatorReasons(rule, fieldValidator);

      const annotatedRule: RuleValidationResult = {
        ...rule,
        valid: ruleValid,
        ...(ruleReasons ? { reasons: ruleReasons } : null),
      };

      annotatedRules.push(annotatedRule);
    }

    const groupValid = groupSelfValid && allChildrenValid;

    if (isRuleGroupType(rg)) {
      const result: RuleGroupValidationResult = {
        ...rg,
        valid: groupValid,
        ...(groupReasons ? { reasons: groupReasons } : null),
        rules: annotatedRules as (RuleValidationResult | RuleGroupValidationResult)[],
      };
      return result;
    }

    const result: RuleGroupICValidationResult = {
      ...rg,
      valid: groupValid,
      ...(groupReasons ? { reasons: groupReasons } : null),
      rules: annotatedRules as (RuleValidationResult | RuleGroupICValidationResult | string)[],
    };
    return result;
  };

  return processRuleGroup(ruleGroup);
};

/**
 * Extracts `reasons` from a validation result, if present.
 */
const getReasons = (
  validationResult: boolean | ValidationResult | undefined
  // oxlint-disable-next-line typescript/no-explicit-any
): any[] | undefined => {
  if (
    typeof validationResult !== 'boolean' &&
    isValidationResult(validationResult) &&
    !validationResult.valid &&
    validationResult.reasons
  ) {
    return validationResult.reasons;
  }
  return undefined;
};

/**
 * Runs a field-level validator and extracts `reasons` if present.
 */
const getFieldValidatorReasons = (
  rule: RuleType,
  fieldValidator: RuleValidator | undefined
  // oxlint-disable-next-line typescript/no-explicit-any
): any[] | undefined => {
  if (typeof fieldValidator === 'function') {
    const vr = fieldValidator(rule);
    if (typeof vr !== 'boolean' && isValidationResult(vr) && !vr.valid && vr.reasons) {
      return vr.reasons;
    }
  }
  return undefined;
};
