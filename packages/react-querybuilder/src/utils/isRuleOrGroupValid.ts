import type {
  RuleGroupTypeAny,
  RuleType,
  RuleValidator,
  ValidationResult,
} from '../types/index.noReact';
import { isPojo } from './misc';

/**
 * Determines if an object is useful as a validation result.
 */
export const isValidationResult = (vr?: ValidationResult): vr is ValidationResult =>
  isPojo(vr) && typeof vr.valid === 'boolean';

/**
 * Determines if a rule or group is valid based on a validation result (if defined)
 * or a validator function. Returns `true` if neither are defined.
 */
export const isRuleOrGroupValid = (
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
