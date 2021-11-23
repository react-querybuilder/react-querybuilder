import { standardClassnames } from '../../defaults';
import getValidationClassNames from '../getValidationClassNames';

describe('getValidationClassNames', () => {
  it('should work', () => {
    expect(getValidationClassNames(true)).toBe(standardClassnames.valid);
    expect(getValidationClassNames(false)).toBe(standardClassnames.invalid);
    expect(getValidationClassNames({ valid: true })).toBe(standardClassnames.valid);
    expect(getValidationClassNames({ valid: false })).toBe(standardClassnames.invalid);
    expect(getValidationClassNames(null)).toBe('');
  });
});
