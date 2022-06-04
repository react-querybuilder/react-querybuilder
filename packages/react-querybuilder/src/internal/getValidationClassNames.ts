import { standardClassnames } from '../defaults';
import type { ValidationResult } from '../types/index.noReact';

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
