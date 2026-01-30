import type { REConditionAny, RulesEngineAny } from '../types';
import { regenerateREIDs } from './regenerateREIDs';

it('regenerates ID for simple rule condition', () => {
  const condition = { id: 'old-id', field: 'name', operator: '=', value: 'test' };
  // oxlint-disable-next-line no-explicit-any
  const result = regenerateREIDs(condition as any);
  expect(result.id).toBeDefined();
  expect(result.id).not.toBe('old-id');
  expect(result.field).toBe('name');
  expect(result.operator).toBe('=');
  expect(result.value).toBe('test');
});

it('regenerates ID for RulesEngineAny condition', () => {
  const condition: REConditionAny = {
    id: 'old-id',
    antecedent: {
      id: 'old-antecedent-id',
      combinator: 'and',
      rules: [{ id: 'old-rule-id', field: 'name', operator: '=', value: 'test' }],
    },
    consequent: { type: 'action' },
  };
  const result = regenerateREIDs(condition);
  expect(result.id).not.toBe('old-id');
  expect(result.antecedent.id).toBeDefined();
  expect(result.antecedent.rules[0].id).toBeDefined();
  expect(result.consequent).toEqual({ type: 'action' });
});

it('regenerates ID for RulesEngine', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'old-re-id',
    conditions: [
      {
        id: 'old-condition-id',
        antecedent: { id: 'old-antecedent-id', combinator: 'and', rules: [] },
        consequent: { type: 'action1' },
      },
    ],
    defaultConsequent: { id: 'old-default-id', type: 'default' },
  };
  const result = regenerateREIDs(rulesEngine);
  expect(result.id).not.toBe('old-re-id');
  expect(result.conditions[0].id).not.toBe('old-condition-id');
  expect(result.conditions[0].antecedent.id).toBeDefined();
  expect(result.defaultConsequent?.id).not.toBe('old-default-id');
});

it('regenerates nested RulesEngine IDs', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'root-id',
    conditions: [
      {
        id: 'condition1-id',
        antecedent: { id: 'antecedent1-id', combinator: 'and', rules: [] },
        conditions: [
          {
            id: 'nested-condition-id',
            antecedent: { id: 'nested-antecedent-id', combinator: 'or', rules: [] },
            consequent: { type: 'nested-action' },
          },
        ],
      },
    ],
  };
  const result = regenerateREIDs(rulesEngine);
  expect(result.id).not.toBe('root-id');
  expect(result.conditions[0].id).not.toBe('condition1-id');
  expect((result.conditions[0] as RulesEngineAny).conditions[0].id).not.toBe('nested-condition-id');
  expect((result.conditions[0] as RulesEngineAny).conditions[0].antecedent.id).toBeDefined();
});

it('uses custom ID generator', () => {
  let counter = 0;
  const customIdGenerator = () => `custom-${++counter}`;
  const rulesEngine: RulesEngineAny = {
    id: 'old-id',
    conditions: [
      {
        id: 'old-condition-id',
        antecedent: { id: 'old-antecedent-id', combinator: 'and', rules: [] },
      },
    ],
  };
  const result = regenerateREIDs(rulesEngine, { idGenerator: customIdGenerator });
  expect(result.id).toBe('custom-1');
  expect(result.conditions[0].id).toBe('custom-2');
  expect(result.conditions[0].antecedent.id).toBeDefined();
});

it('handles RulesEngineIC', () => {
  const rulesEngineIC: RulesEngineAny = {
    id: 'old-ic-id',
    conditions: [
      {
        id: 'old-ic-condition-id',
        antecedent: { id: 'old-ic-antecedent-id', combinator: 'and', rules: [], not: false },
        consequent: { type: 'ic-action' },
      },
    ],
  };
  const result = regenerateREIDs(rulesEngineIC);
  expect(result.id).not.toBe('old-ic-id');
  expect(result.conditions[0].id).not.toBe('old-ic-condition-id');
  expect(result.conditions[0].antecedent.id).toBeDefined();
  expect(result.conditions[0].antecedent.not).toBe(false);
});

it('preserves original object immutably', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'original-id',
    conditions: [
      {
        id: 'original-condition-id',
        antecedent: { id: 'original-antecedent-id', combinator: 'and', rules: [] },
      },
    ],
  };
  const original = JSON.parse(JSON.stringify(rulesEngine));
  const result = regenerateREIDs(rulesEngine);

  expect(rulesEngine).toEqual(original);
  expect(result).not.toBe(rulesEngine);
  expect(result.conditions).not.toBe(rulesEngine.conditions);
  expect(result.conditions[0]).not.toBe(rulesEngine.conditions[0]);
});

it('handles non-object input', () => {
  // oxlint-disable no-explicit-any
  const result1 = regenerateREIDs(null as any);
  const result2 = regenerateREIDs(undefined as any);
  const result3 = regenerateREIDs('string' as any);
  const result4 = regenerateREIDs(123 as any);
  // oxlint-enable no-explicit-any

  expect(result1).toBe(null);
  expect(result2).toBe(undefined);
  expect(result3).toBe('string');
  expect(result4).toBe(123);
});

it('handles object that is not a rule group or rules engine', () => {
  const obj = { id: 'old-id', someProperty: 'value' };
  // oxlint-disable-next-line no-explicit-any
  const result = regenerateREIDs(obj as any);
  expect(result.id).not.toBe('old-id');
  expect(result.someProperty).toBe('value');
});

it('handles empty conditions array', () => {
  const rulesEngine: RulesEngineAny = { id: 'old-id', conditions: [] };
  const result = regenerateREIDs(rulesEngine);
  expect(result.id).not.toBe('old-id');
  expect(result.conditions).toEqual([]);
});

it('handles condition without defaultConsequent', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'old-id',
    conditions: [
      {
        id: 'old-condition-id',
        antecedent: { id: 'old-antecedent-id', combinator: 'and', rules: [] },
      },
    ],
  };
  const result = regenerateREIDs(rulesEngine);
  expect(result.id).not.toBe('old-id');
  expect(result.defaultConsequent).toBeUndefined();
});

it('regenerates defaultConsequent ID when present', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'old-id',
    conditions: [],
    defaultConsequent: { id: 'old-default-id', type: 'default' },
  };
  const result = regenerateREIDs(rulesEngine);
  expect(result.defaultConsequent?.id).not.toBe('old-default-id');
  expect(result.defaultConsequent?.type).toBe('default');
});

it('generates unique IDs for multiple items', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'old-id',
    conditions: [
      { id: 'condition1', antecedent: { id: 'antecedent1', combinator: 'and', rules: [] } },
      { id: 'condition2', antecedent: { id: 'antecedent2', combinator: 'or', rules: [] } },
    ],
  };
  const result = regenerateREIDs(rulesEngine);
  const ids = [
    result.id,
    result.conditions[0].id,
    result.conditions[0].antecedent.id,
    result.conditions[1].id,
    result.conditions[1].antecedent.id,
  ];
  const uniqueIds = new Set(ids);
  expect(uniqueIds.size).toBe(ids.length);
});

it('preserves all non-id properties', () => {
  const rulesEngine: RulesEngineAny = {
    id: 'old-id',
    conditions: [
      {
        id: 'old-condition-id',
        antecedent: {
          id: 'old-antecedent-id',
          combinator: 'and',
          rules: [],
          disabled: true,
          path: [0],
        },
        consequent: { type: 'action', payload: { data: 'test' } },
        disabled: false,
        path: [0, 1],
      },
    ],
    disabled: true,
    path: [],
  };
  const result = regenerateREIDs(rulesEngine);
  expect(result.disabled).toBe(true);
  expect(result.path).toEqual([]);
  expect(result.conditions[0].disabled).toBe(false);
  expect(result.conditions[0].path).toEqual([0, 1]);
  expect(result.conditions[0].antecedent.disabled).toBe(true);
  expect(result.conditions[0].antecedent.path).toEqual([0]);
  expect(result.conditions[0].consequent).toEqual({ type: 'action', payload: { data: 'test' } });
});
