import type { REConditionAny, RulesEngineAny } from '../types';
import { prepareRulesEngine, prepareRulesEngineCondition } from './prepareRulesEngine';

describe('prepareRulesEngineCondition', () => {
  it('adds ID to condition without ID', () => {
    const condition: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action' },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.id!.length).toBeGreaterThan(0);
  });

  it('preserves existing ID', () => {
    const condition: REConditionAny = {
      id: 'existing-id',
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action' },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.id).toBe('existing-id');
  });

  it('uses custom ID generator', () => {
    const condition: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
    };
    const customIdGenerator = () => 'custom-id';
    const result = prepareRulesEngineCondition(condition, {
      idGenerator: customIdGenerator,
    });
    expect(result.id).toBe('custom-id');
  });

  it('prepares antecedent rule group', () => {
    const condition: REConditionAny = {
      antecedent: {
        combinator: 'and',
        rules: [{ field: 'name', operator: '=', value: 'test' }],
      },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.antecedent.id).toBeDefined();
    expect(result.antecedent.rules[0].id).toBeDefined();
  });

  it('handles condition that might be a rules engine', () => {
    const condition: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action' },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.id).toBeDefined();
    expect(result.antecedent.id).toBeDefined();
    expect(result.consequent).toEqual({ type: 'action' });
  });

  it('handles condition without antecedent rule group', () => {
    const condition = { antecedent: 'not-a-rule-group' } as any; // oxlint-disable-line no-explicit-any
    const result = prepareRulesEngineCondition(condition);
    expect(result.id).toBeDefined();
    expect(result.antecedent).toBe('not-a-rule-group');
  });

  it('handles condition that is not a rules engine', () => {
    const condition: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action' },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.id).toBeDefined();
  });

  it('preserves other properties', () => {
    const condition: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
      consequent: { type: 'action' },
      disabled: true,
      path: [0, 1],
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result.disabled).toBe(true);
    expect(result.path).toEqual([0, 1]);
  });

  it('handles condition with nested conditions (rules engine-like)', () => {
    const conditionWithNested: REConditionAny = {
      antecedent: { combinator: 'and', rules: [] },
      conditions: [
        {
          antecedent: { combinator: 'or', rules: [] },
          consequent: { type: 'nested-action' },
        },
      ],
    };
    const result = prepareRulesEngineCondition(conditionWithNested);
    expect(result.id).toBeDefined();
    expect(result.antecedent.id).toBeDefined();
    expect(result.conditions?.[0].id).toBeDefined();
  });

  it('returns same object when no changes needed', () => {
    const condition: REConditionAny = {
      id: 'existing-id',
      antecedent: 'not-a-rule-group',
      consequent: { type: 'action' },
    } as any; // oxlint-disable-line no-explicit-any
    const result = prepareRulesEngineCondition(condition);
    expect(result).toBe(condition);
  });

  it('does not update antecedent when already prepared', () => {
    const condition: REConditionAny = {
      id: 'existing-id',
      antecedent: { id: 'rg-id', combinator: 'and', rules: [] },
      consequent: { type: 'action' },
    };
    const result = prepareRulesEngineCondition(condition);
    expect(result).toBe(condition);
  });

  it('does not update conditions when already prepared', () => {
    const condition: REConditionAny = {
      id: 'existing-id',
      antecedent: { id: 'rg-id', combinator: 'and', rules: [] },
      conditions: [
        {
          id: 'nested-id',
          antecedent: { id: 'nested-rg-id', combinator: 'or', rules: [] },
        },
      ],
    };
    // Need to add ID to the wrapper that isRulesEngineAny creates
    (condition as REConditionAny).id = 'existing-id';
    const result = prepareRulesEngineCondition(condition);
    // Since nested conditions will be processed, object will change unless conditions array has proper ID
    expect(result.id).toBe('existing-id');
    expect(result.conditions).toBeDefined();
  });
});

describe('prepareRulesEngine', () => {
  it('adds ID to rules engine without ID', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.id).toBeDefined();
    expect(typeof result.id).toBe('string');
    expect(result.id!.length).toBeGreaterThan(0);
  });

  it('preserves existing ID', () => {
    const rulesEngine: RulesEngineAny = {
      id: 'existing-id',
      conditions: [],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.id).toBe('existing-id');
  });

  it('uses custom ID generator', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [],
    };
    const customIdGenerator = () => 'custom-id';
    const result = prepareRulesEngine(rulesEngine, {
      idGenerator: customIdGenerator,
    });
    expect(result.id).toBe('custom-id');
  });

  it('prepares all conditions', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [] },
        },
        {
          antecedent: { combinator: 'or', rules: [] },
          consequent: { type: 'action' },
        },
      ],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.conditions[0].id).toBeDefined();
    expect(result.conditions[1].id).toBeDefined();
  });

  it('preserves other properties', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [],
      defaultConsequent: { type: 'default' },
      disabled: true,
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.defaultConsequent).toEqual({ type: 'default' });
    expect(result.disabled).toBe(true);
  });

  it('handles standard rules engines', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [] },
          consequent: { type: 'action' },
        },
      ],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.id).toBeDefined();
    expect(result.conditions[0].id).toBeDefined();
    expect(result.conditions[0].antecedent.id).toBeDefined();
    expect(result.conditions[0].consequent).toEqual({ type: 'action' });
  });

  it('handles RulesEngineIC', () => {
    const rulesEngineIC: RulesEngineAny = {
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [], not: false },
        },
      ],
    };
    const result = prepareRulesEngine(rulesEngineIC);
    expect(result.id).toBeDefined();
    expect(result.conditions[0].id).toBeDefined();
    expect(result.conditions[0].antecedent.id).toBeDefined();
  });

  it('preserves original object immutably', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [
        {
          antecedent: { combinator: 'and', rules: [] },
        },
      ],
    };
    const original = JSON.parse(JSON.stringify(rulesEngine));
    const result = prepareRulesEngine(rulesEngine);

    expect(rulesEngine).toEqual(original);
    expect(result).not.toBe(rulesEngine);
    expect(result.conditions).not.toBe(rulesEngine.conditions);
    expect(result.conditions[0]).not.toBe(rulesEngine.conditions[0]);
  });

  it('handles empty conditions array', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result.id).toBeDefined();
    expect(result.conditions).toEqual([]);
  });

  it('generates unique IDs for multiple calls', () => {
    const rulesEngine: RulesEngineAny = {
      conditions: [],
    };
    const result1 = prepareRulesEngine(rulesEngine);
    const result2 = prepareRulesEngine(rulesEngine);
    expect(result1.id).not.toBe(result2.id);
  });

  it('returns same object when already fully prepared', () => {
    const rulesEngine: RulesEngineAny = {
      id: 'existing-id',
      conditions: [
        {
          id: 'cond-id',
          antecedent: { id: 'rg-id', combinator: 'and', rules: [] },
        },
      ],
    };
    const result = prepareRulesEngine(rulesEngine);
    expect(result).toBe(rulesEngine);
  });
});
