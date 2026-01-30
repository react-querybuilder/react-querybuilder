import {
  isRulesEngine,
  isRulesEngineAny,
  isRulesEngineCondition,
  isRulesEngineConditionAny,
  isRulesEngineConditionIC,
  isRulesEngineConsequent,
  isRulesEngineIC,
} from './isRulesEngine';

describe('isRulesEngineAny', () => {
  it('returns true for valid RulesEngine', () => {
    const re = { conditions: [{ antecedent: { combinator: 'and', rules: [] } }] };
    expect(isRulesEngineAny(re)).toBe(true);
  });

  it('returns true for valid RulesEngineIC', () => {
    const reIC = { conditions: [{ antecedent: { combinator: 'and', rules: [], not: false } }] };
    expect(isRulesEngineAny(reIC)).toBe(true);
  });

  it('returns false for non-object', () => {
    expect(isRulesEngineAny(null)).toBe(false);
    expect(isRulesEngineAny(undefined)).toBe(false);
    expect(isRulesEngineAny('string')).toBe(false);
    expect(isRulesEngineAny(123)).toBe(false);
    expect(isRulesEngineAny(true)).toBe(false);
  });

  it('returns false for object without conditions', () => {
    expect(isRulesEngineAny({})).toBe(false);
    expect(isRulesEngineAny({ other: 'prop' })).toBe(false);
  });

  it('returns false for object with non-array conditions', () => {
    expect(isRulesEngineAny({ conditions: 'not-array' })).toBe(false);
    expect(isRulesEngineAny({ conditions: {} })).toBe(false);
    expect(isRulesEngineAny({ conditions: null })).toBe(false);
  });

  it('returns true for object with empty conditions array', () => {
    expect(isRulesEngineAny({ conditions: [] })).toBe(true);
  });
});

describe('isRulesEngine', () => {
  it('returns true for valid RulesEngine', () => {
    const re = { conditions: [{ antecedent: { combinator: 'and', rules: [] } }] };
    expect(isRulesEngine(re)).toBe(true);
  });

  it('returns false for RulesEngineIC', () => {
    const reIC = { conditions: [{ antecedent: { rules: [], not: false } }] };
    expect(isRulesEngine(reIC)).toBe(false);
  });

  it('returns false for invalid RulesEngine', () => {
    expect(isRulesEngine(null)).toBe(false);
    expect(isRulesEngine({})).toBe(false);
    expect(isRulesEngine({ conditions: [] })).toBe(false);
  });

  it('returns false for empty conditions', () => {
    expect(isRulesEngine({ conditions: [] })).toBe(false);
  });
});

describe('isRulesEngineIC', () => {
  it('returns true for valid RulesEngineIC', () => {
    const reIC = { conditions: [{ antecedent: { rules: [], not: false } }] };
    expect(isRulesEngineIC(reIC)).toBe(true);
  });

  it('returns false for RulesEngine', () => {
    const re = { conditions: [{ antecedent: { combinator: 'and', rules: [] } }] };
    expect(isRulesEngineIC(re)).toBe(false);
  });

  it('returns false for invalid RulesEngineIC', () => {
    expect(isRulesEngineIC(null)).toBe(false);
    expect(isRulesEngineIC({})).toBe(false);
    expect(isRulesEngineIC({ conditions: [] })).toBe(false);
  });
});

describe('isRulesEngineConsequent', () => {
  it('returns true for valid Consequent', () => {
    const consequent = { type: 'action' };
    expect(isRulesEngineConsequent(consequent)).toBe(true);
  });

  it('returns true for Consequent with additional properties', () => {
    const consequent = { type: 'action', id: '123', payload: { data: 'test' } };
    expect(isRulesEngineConsequent(consequent)).toBe(true);
  });

  it('returns false for object without type', () => {
    expect(isRulesEngineConsequent({})).toBe(false);
    expect(isRulesEngineConsequent({ id: '123' })).toBe(false);
  });

  it('returns false for object with non-string type', () => {
    expect(isRulesEngineConsequent({ type: 123 })).toBe(false);
    expect(isRulesEngineConsequent({ type: null })).toBe(false);
    expect(isRulesEngineConsequent({ type: true })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isRulesEngineConsequent(null)).toBe(false);
    expect(isRulesEngineConsequent(undefined)).toBe(false);
    expect(isRulesEngineConsequent('string')).toBe(false);
    expect(isRulesEngineConsequent(123)).toBe(false);
  });
});

describe('isRulesEngineConditionAny', () => {
  it('returns true for valid RECondition', () => {
    const condition = { antecedent: { combinator: 'and', rules: [] } };
    expect(isRulesEngineConditionAny(condition)).toBe(true);
  });

  it('returns true for valid REConditionIC', () => {
    const conditionIC = { antecedent: { rules: [], not: false } };
    expect(isRulesEngineConditionAny(conditionIC)).toBe(true);
  });

  it('returns false for object without antecedent', () => {
    expect(isRulesEngineConditionAny({})).toBe(false);
    expect(isRulesEngineConditionAny({ other: 'prop' })).toBe(false);
  });

  it('returns false for object with invalid antecedent', () => {
    expect(isRulesEngineConditionAny({ antecedent: 'not-rule-group' })).toBe(false);
    expect(isRulesEngineConditionAny({ antecedent: null })).toBe(false);
    expect(isRulesEngineConditionAny({ antecedent: {} })).toBe(false);
  });

  it('returns false for non-object', () => {
    expect(isRulesEngineConditionAny(null)).toBe(false);
    expect(isRulesEngineConditionAny(undefined)).toBe(false);
    expect(isRulesEngineConditionAny('string')).toBe(false);
  });
});

describe('isRulesEngineCondition', () => {
  it('returns true for valid RECondition', () => {
    const condition = { antecedent: { combinator: 'and', rules: [] } };
    expect(isRulesEngineCondition(condition)).toBe(true);
  });

  it('returns false for REConditionIC', () => {
    const conditionIC = { antecedent: { rules: [], not: false } };
    expect(isRulesEngineCondition(conditionIC)).toBe(false);
  });

  it('returns false for invalid condition', () => {
    expect(isRulesEngineCondition(null)).toBe(false);
    expect(isRulesEngineCondition({})).toBe(false);
  });
});

describe('isRulesEngineConditionIC', () => {
  it('returns true for valid REConditionIC', () => {
    const conditionIC = { antecedent: { rules: [], not: false } };
    expect(isRulesEngineConditionIC(conditionIC)).toBe(true);
  });

  it('returns false for RECondition', () => {
    const condition = { antecedent: { combinator: 'and', rules: [] } };
    expect(isRulesEngineConditionIC(condition)).toBe(false);
  });

  it('returns false for invalid condition', () => {
    expect(isRulesEngineConditionIC(null)).toBe(false);
    expect(isRulesEngineConditionIC({})).toBe(false);
  });
});
