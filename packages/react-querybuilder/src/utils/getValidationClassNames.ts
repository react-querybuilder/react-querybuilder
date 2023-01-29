import type { ValidationResult } from '@react-querybuilder/ts/dist/index.noReact';
import { standardClassnames } from '../defaults';

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
