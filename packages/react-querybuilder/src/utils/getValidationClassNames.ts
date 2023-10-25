import { standardClassnames } from '../defaults';
import type { ValidationResult } from '../types/index.noReact';

/**
 * Gets the standard classname for valid or invalid components
 * based on the given validation result.
 */
export const getValidationClassNames = (validationResult: boolean | ValidationResult) => {
  const valid =
    typeof validationResult === 'boolean'
      ? validationResult
      : typeof validationResult === 'object' && validationResult !== null
      ? validationResult.valid
      : null;
  return typeof valid === 'boolean'
    ? valid
      ? standardClassnames.valid
      : standardClassnames.invalid
    : '';
};
