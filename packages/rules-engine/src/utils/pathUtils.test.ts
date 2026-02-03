import type { RulesEngineAny } from '../types';
import { findConditionID, findConditionPath, getConditionPathOfID } from './pathUtils';

const sampleRulesEngine: RulesEngineAny = {
  id: 'root',
  conditions: [
    {
      id: 'condition1',
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action1' },
    },
    {
      id: 'condition2',
      antecedent: { combinator: 'or', rules: [] },
      conditions: [
        {
          id: 'nested1',
          antecedent: { combinator: 'and', rules: [] },
          consequent: { type: 'action2' },
        },
      ],
    },
  ],
};

const sampleRulesEngineIC: RulesEngineAny = {
  id: 'rootIC',
  conditions: [
    {
      id: 'conditionIC1',
      antecedent: { combinator: 'and', rules: [], not: false },
      consequent: { type: 'action1' },
    },
    {
      id: 'conditionIC2',
      antecedent: { combinator: 'or', rules: [], not: true },
      conditions: [
        {
          id: 'nestedIC1',
          antecedent: { combinator: 'and', rules: [], not: false },
          consequent: { type: 'action2' },
        },
      ],
    },
  ],
};

describe('findConditionPath', () => {
  it('returns the rules engine itself for empty path', () => {
    const result = findConditionPath([], sampleRulesEngine);
    expect(result).toBe(sampleRulesEngine);
  });

  it('returns condition at specified path', () => {
    const result = findConditionPath([0], sampleRulesEngine);
    expect(result).toEqual(sampleRulesEngine.conditions[0]);
  });

  it('returns nested condition at specified path', () => {
    const result = findConditionPath([1, 0], sampleRulesEngine);
    // oxlint-disable-next-line no-explicit-any
    expect(result).toEqual((sampleRulesEngine.conditions[1] as any).conditions[0]);
  });

  it('returns null for invalid path', () => {
    const result = findConditionPath([5], sampleRulesEngine);
    expect(result).toBe(null);
  });

  it('returns null for path that goes too deep', () => {
    const result = findConditionPath([0, 0], sampleRulesEngine);
    expect(result).toBe(null);
  });

  it('returns null for path beyond available conditions', () => {
    const result = findConditionPath([1, 5], sampleRulesEngine);
    expect(result).toBe(null);
  });

  it('handles empty rules engine', () => {
    const emptyRE = { id: 'empty', conditions: [] };
    const result = findConditionPath([0], emptyRE);
    expect(result).toBe(null);
  });

  it('works with RulesEngineIC', () => {
    const result = findConditionPath([0], sampleRulesEngineIC);
    expect(result).toEqual(sampleRulesEngineIC.conditions[0]);
  });
});

describe('findConditionID', () => {
  it('returns the rules engine itself if ID matches', () => {
    const result = findConditionID('root', sampleRulesEngine);
    expect(result).toBe(sampleRulesEngine);
  });

  it('returns condition with matching ID', () => {
    const result = findConditionID('condition1', sampleRulesEngine);
    expect(result).toBe(sampleRulesEngine.conditions[0]);
  });

  it('returns nested condition with matching ID', () => {
    const result = findConditionID('nested1', sampleRulesEngine);
    // oxlint-disable-next-line no-explicit-any
    expect(result).toBe((sampleRulesEngine.conditions[1] as any).conditions[0]);
  });

  it('returns null for non-existent ID', () => {
    const result = findConditionID('nonexistent', sampleRulesEngine);
    expect(result).toBe(null);
  });

  it('returns null for empty rules engine', () => {
    const emptyRE = { id: 'empty', conditions: [] };
    const result = findConditionID('condition1', emptyRE);
    expect(result).toBe(null);
  });

  it('works with RulesEngineIC', () => {
    const result = findConditionID('rootIC', sampleRulesEngineIC);
    expect(result).toBe(sampleRulesEngineIC);
  });

  it('finds nested condition in RulesEngineIC', () => {
    const result = findConditionID('nestedIC1', sampleRulesEngineIC);
    // oxlint-disable-next-line no-explicit-any
    expect(result).toBe((sampleRulesEngineIC.conditions[1] as any).conditions[0]);
  });

  it('stops at first match for recursive nested structures', () => {
    const nestedRE: RulesEngineAny = {
      id: 'root',
      conditions: [
        {
          id: 'target',
          antecedent: { combinator: 'and', rules: [] },
          conditions: [{ id: 'target', antecedent: { combinator: 'and', rules: [] } }],
        },
      ],
    };
    const result = findConditionID('target', nestedRE);
    expect(result).toBe(nestedRE.conditions[0]);
  });
});

describe('getConditionPathOfID', () => {
  it('returns empty array for root ID', () => {
    const result = getConditionPathOfID('root', sampleRulesEngine);
    expect(result).toEqual([]);
  });

  it('returns path for top-level condition', () => {
    const result = getConditionPathOfID('condition1', sampleRulesEngine);
    expect(result).toEqual([0]);
  });

  it('returns path for second top-level condition', () => {
    const result = getConditionPathOfID('condition2', sampleRulesEngine);
    expect(result).toEqual([1]);
  });

  it('returns path for nested condition', () => {
    const result = getConditionPathOfID('nested1', sampleRulesEngine);
    expect(result).toEqual([1, 0]);
  });

  it('returns null for non-existent ID', () => {
    const result = getConditionPathOfID('nonexistent', sampleRulesEngine);
    expect(result).toBe(null);
  });

  it('returns null for empty rules engine', () => {
    const emptyRE = { id: 'empty', conditions: [] };
    const result = getConditionPathOfID('condition1', emptyRE);
    expect(result).toBe(null);
  });

  it('works with RulesEngineIC', () => {
    const result = getConditionPathOfID('rootIC', sampleRulesEngineIC);
    expect(result).toEqual([]);
  });

  it('finds path for nested condition in RulesEngineIC', () => {
    const result = getConditionPathOfID('nestedIC1', sampleRulesEngineIC);
    expect(result).toEqual([1, 0]);
  });

  it('handles deeply nested structures', () => {
    const deepRE: RulesEngineAny = {
      id: 'root',
      conditions: [
        {
          id: 'level1',
          antecedent: { combinator: 'and', rules: [] },
          conditions: [
            {
              id: 'level2',
              antecedent: { combinator: 'and', rules: [] },
              conditions: [{ id: 'level3', antecedent: { combinator: 'and', rules: [] } }],
            },
          ],
        },
      ],
    };
    const result = getConditionPathOfID('level3', deepRE);
    expect(result).toEqual([0, 0, 0]);
  });

  it('handles conditions without id property', () => {
    const reWithoutIds: RulesEngineAny = {
      id: 'root',
      conditions: [
        { antecedent: { combinator: 'and', rules: [] } },
        { id: 'hasId', antecedent: { combinator: 'and', rules: [] } },
      ],
    };
    const result = getConditionPathOfID('hasId', reWithoutIds);
    expect(result).toEqual([1]);
  });

  it('returns path for condition at index 0', () => {
    const result = getConditionPathOfID('condition1', sampleRulesEngine);
    expect(result).toEqual([0]);
  });
});
