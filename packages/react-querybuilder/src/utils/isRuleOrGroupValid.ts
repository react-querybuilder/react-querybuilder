import type { RuleGroupTypeAny, RuleType } from '../types/ruleGroups';
import type { RuleValidator, ValidationResult } from '../types/validation';

/**
 * Determines if this is a valid ValidationResult
 */
const isValidationResult = (vr?: ValidationResult): vr is ValidationResult =>
  typeof vr === 'object' && vr !== null && typeof vr.valid === 'boolean';

const isRuleOrGroupValid = (
  rg: RuleType | RuleGroupTypeAny,
  validationResult?: boolean | ValidationResult,
  validator?: RuleValidator
) => {
  if (typeof validationResult === 'boolean') {
    return validationResult;
  }
  if (isValidationResult(validationResult)) {
    return validationResult.valid;
  }
  if (typeof validator === 'function' && !('rules' in rg)) {
    const vr = validator(rg);
    if (typeof vr === 'boolean') {
      return vr;
    }
    // istanbul ignore else
    if (isValidationResult(vr)) {
      return vr.valid;
    }
  }
  return true;
};

export default isRuleOrGroupValid;
