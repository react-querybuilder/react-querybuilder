import isRuleOrGroupValid from '../isRuleOrGroupValid';

describe('isRuleOrGroupValid', () => {
  // no validationResult or validator
  it('should validate a rule with no validationResult or validator', () => {
    expect(isRuleOrGroupValid({ field: 'field', operator: '=', value: '' })).toBe(true);
  });
  it('should validate a group with no validationResult or validator', () => {
    expect(isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] })).toBe(true);
  });

  // boolean validationResult
  it('should validate a rule with validationResult = true', () => {
    expect(isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, true)).toBe(true);
  });
  it('should validate a group with validationResult = true', () => {
    expect(isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] }, true)).toBe(true);
  });
  it('should invalidate a rule with validationResult = false', () => {
    expect(isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, false)).toBe(false);
  });
  it('should invalidate a group with validationResult = false', () => {
    expect(isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] }, false)).toBe(false);
  });

  // object validationResult
  it('should validate a rule with validationResult.valid = true', () => {
    expect(isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, { valid: true })).toBe(
      true
    );
  });
  it('should validate a group with validationResult.valid = true', () => {
    expect(isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] }, { valid: true })).toBe(
      true
    );
  });
  it('should invalidate a rule with validationResult.valid = false', () => {
    expect(isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, { valid: false })).toBe(
      false
    );
  });
  it('should invalidate a group with validationResult.valid = false', () => {
    expect(isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] }, { valid: false })).toBe(
      false
    );
  });

  // validator function - groups
  it('should validate a group with validator function', () => {
    expect(
      isRuleOrGroupValid({ id: 'root', combinator: 'and', rules: [] }, undefined, () => false)
    ).toBe(true);
  });

  // validator function - rules
  it('should validate a rule with validator() = true', () => {
    expect(
      isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, undefined, () => true)
    ).toBe(true);
  });
  it('should invalidate a rule with validator() = false', () => {
    expect(
      isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, undefined, () => false)
    ).toBe(false);
  });
  it('should validate a rule with validator().valid = true', () => {
    expect(
      isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, undefined, () => ({
        valid: true
      }))
    ).toBe(true);
  });
  it('should invalidate a rule with validator().valid = false', () => {
    expect(
      isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, undefined, () => ({
        valid: false
      }))
    ).toBe(false);
  });

  // both validationResult and validator
  it('should ignore validator when validationResult is present', () => {
    expect(
      isRuleOrGroupValid({ field: 'field', operator: '=', value: '' }, false, () => true)
    ).toBe(false);
  });
});
