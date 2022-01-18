import { standardClassnames } from '../../defaults';
import { getValidationClassNames } from '../getValidationClassNames';

it('should get the correct classnames', () => {
  expect(getValidationClassNames(true)).toBe(standardClassnames.valid);
  expect(getValidationClassNames(false)).toBe(standardClassnames.invalid);
  expect(getValidationClassNames({ valid: true })).toBe(standardClassnames.valid);
  expect(getValidationClassNames({ valid: false })).toBe(standardClassnames.invalid);
  expect(getValidationClassNames(null as any)).toBe('');
});
