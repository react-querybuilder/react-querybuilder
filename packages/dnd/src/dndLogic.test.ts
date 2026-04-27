/* oxlint-disable typescript/no-explicit-any */
import type {
  DraggedItem,
  DropResult,
  QueryActions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleType,
  Schema,
} from 'react-querybuilder';
import type { Mock } from 'vitest';
import {
  buildDropResult,
  canDropOnInlineCombinator,
  canDropOnRule,
  canDropOnRuleGroup,
  collectDropState,
  getDestinationPath,
  getDragItem,
  handleDrop,
} from './dndLogic';

vi.mock('./isHotkeyPressed', () => ({ isHotkeyPressed: vi.fn(() => false) }));

const { isHotkeyPressed } = (await import('./isHotkeyPressed')) as unknown as {
  isHotkeyPressed: Mock;
};

const createMockSchema = (overrides: Partial<Schema<any, any>> = {}): Schema<any, any> =>
  ({
    qbId: 'qb1',
    getQuery: vi.fn(
      () =>
        ({
          combinator: 'and',
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            { field: 'f2', operator: '=', value: 'v2' },
            { combinator: 'or', rules: [{ field: 'f3', operator: '=', value: 'v3' }] },
          ],
        }) as RuleGroupType
    ),
    dispatchQuery: vi.fn(),
    independentCombinators: false,
    ...overrides,
  }) as unknown as Schema<any, any>;

const createMockActions = (): QueryActions =>
  ({
    onGroupAdd: vi.fn(),
    onGroupRemove: vi.fn(),
    onPropChange: vi.fn(),
    onRuleAdd: vi.fn(),
    onRuleRemove: vi.fn(),
    moveRule: vi.fn(),
    groupRule: vi.fn(),
  }) as QueryActions;

const createDraggedItem = (overrides: Partial<DraggedItem> = {}): DraggedItem =>
  ({
    field: 'f1',
    operator: '=',
    value: 'v1',
    path: [0],
    qbId: 'qb1',
    ...overrides,
  }) as DraggedItem;

beforeEach(() => {
  isHotkeyPressed.mockReset();
  isHotkeyPressed.mockReturnValue(false);
});

// #region canDropOnRule
describe('canDropOnRule', () => {
  const rule: RuleType = { field: 'f2', operator: '=', value: 'v2' };

  it('allows drop when dragging from a different query builder', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ qbId: 'qb2' }),
        path: [1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(true);
  });

  it('disallows drop when ancestor of target', () => {
    const dragging = createDraggedItem({ path: [2], combinator: 'or', rules: [] } as any);
    expect(
      canDropOnRule({
        dragging,
        path: [2, 0],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(false);
  });

  it('disallows drop on itself', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [1] }),
        path: [1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(false);
  });

  it('disallows drop on the previous sibling (move mode)', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [1] }),
        path: [0],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(false);
  });

  it('allows drop on the previous sibling in group mode', () => {
    isHotkeyPressed.mockReturnValue(true);
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [1] }),
        path: [0],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(true);
  });

  it('disallows drop in group mode when target is disabled', () => {
    isHotkeyPressed.mockReturnValue(true);
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [1] }),
        path: [0],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: true,
        rule,
      })
    ).toBe(false);
  });

  it('disallows drop when custom canDrop returns false', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [0] }),
        path: [2],
        schema: createMockSchema(),
        canDrop: () => false,
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(false);
  });

  it('allows drop on a non-adjacent sibling', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [0] }),
        path: [2],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(true);
  });

  it('disallows drop on the previous item accounting for independent combinators', () => {
    expect(
      canDropOnRule({
        dragging: createDraggedItem({ path: [2] }),
        path: [0],
        schema: createMockSchema({ independentCombinators: true }),
        groupModeModifierKey: 'ctrl',
        disabled: false,
        rule,
      })
    ).toBe(false);
  });
});
// #endregion

// #region canDropOnRuleGroup
describe('canDropOnRuleGroup', () => {
  const ruleGroup = { combinator: 'and', rules: [] } as unknown as RuleGroupTypeAny;

  it('allows drop from a different query builder', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem({ qbId: 'qb2' }),
        path: [0],
        schema: createMockSchema(),
        disabled: false,
        ruleGroup,
      })
    ).toBe(true);
  });

  it('disallows drop when disabled', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem(),
        path: [1],
        schema: createMockSchema(),
        disabled: true,
        ruleGroup,
      })
    ).toBe(false);
  });

  it('disallows drop when ancestor of target', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem({ path: [1], combinator: 'and', rules: [] } as any),
        path: [1, 0],
        schema: createMockSchema(),
        disabled: false,
        ruleGroup,
      })
    ).toBe(false);
  });

  it('disallows drop on itself', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem({ path: [2], combinator: 'or', rules: [] } as any),
        path: [2],
        schema: createMockSchema(),
        disabled: false,
        ruleGroup,
      })
    ).toBe(false);
  });

  it('disallows drop of first child on its own group', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem({ path: [2, 0] }),
        path: [2],
        schema: createMockSchema(),
        disabled: false,
        ruleGroup,
      })
    ).toBe(false);
  });

  it('allows drop of non-first child on its own group', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem({ path: [2, 1] }),
        path: [2],
        schema: createMockSchema(),
        disabled: false,
        ruleGroup,
      })
    ).toBe(true);
  });

  it('disallows drop when custom canDrop returns false', () => {
    expect(
      canDropOnRuleGroup({
        dragging: createDraggedItem(),
        path: [1],
        schema: createMockSchema(),
        canDrop: () => false,
        disabled: false,
        ruleGroup,
      })
    ).toBe(false);
  });
});
// #endregion

// #region canDropOnInlineCombinator
describe('canDropOnInlineCombinator', () => {
  const hoveringItem: RuleType = { field: 'f1', operator: '=', value: 'v1' };

  it('disallows drop in group mode', () => {
    isHotkeyPressed.mockReturnValue(true);
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [0] }),
        path: [1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });

  it('disallows drop when ancestor of target', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [0], combinator: 'and', rules: [] } as any),
        path: [0, 1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });

  it('disallows drop on self', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [1] }),
        path: [1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });

  it('disallows drop on the combinator immediately after the item', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [0] }),
        path: [1],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });

  it('disallows drop when custom canDrop returns false', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [0] }),
        path: [3],
        schema: createMockSchema(),
        canDrop: () => false,
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });

  it('allows drop on a non-adjacent combinator', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [0] }),
        path: [3],
        schema: createMockSchema(),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(true);
  });

  it('disallows drop when independent combinators and combinator is just above item', () => {
    expect(
      canDropOnInlineCombinator({
        dragging: createDraggedItem({ path: [2] }),
        path: [1],
        schema: createMockSchema({ independentCombinators: true }),
        groupModeModifierKey: 'ctrl',
        hoveringItem,
      })
    ).toBe(false);
  });
});
// #endregion

// #region buildDropResult
describe('buildDropResult', () => {
  it('builds a drop result with move effect', () => {
    const schema = createMockSchema();
    const result = buildDropResult({
      type: 'rule',
      path: [1],
      schema,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(result).toEqual({
      type: 'rule',
      path: [1],
      qbId: 'qb1',
      getQuery: schema.getQuery,
      dispatchQuery: schema.dispatchQuery,
      groupItems: false,
      dropEffect: 'move',
    });
  });

  it('builds a drop result with copy effect when modifier pressed', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'alt');
    const schema = createMockSchema();
    const result = buildDropResult({
      type: 'ruleGroup',
      path: [0],
      schema,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(result.dropEffect).toBe('copy');
    expect(result.groupItems).toBe(false);
  });

  it('builds a drop result with group mode when modifier pressed', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'ctrl');
    const schema = createMockSchema();
    const result = buildDropResult({
      type: 'rule',
      path: [2],
      schema,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(result.dropEffect).toBe('move');
    expect(result.groupItems).toBe(true);
  });
});
// #endregion

// #region collectDropState
describe('collectDropState', () => {
  it('returns default state when no modifiers pressed', () => {
    expect(collectDropState('alt', 'ctrl')).toEqual({ dropEffect: 'move', groupItems: false });
  });

  it('returns copy when copy modifier pressed', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'alt');
    expect(collectDropState('alt', 'ctrl')).toEqual({ dropEffect: 'copy', groupItems: false });
  });

  it('returns groupItems when group modifier pressed', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'ctrl');
    expect(collectDropState('alt', 'ctrl')).toEqual({ dropEffect: 'move', groupItems: true });
  });
});
// #endregion

// #region getDestinationPath
describe('getDestinationPath', () => {
  const baseDropResult: DropResult = {
    path: [1],
    type: 'rule',
    qbId: 'qb1',
    getQuery: vi.fn(),
    dispatchQuery: vi.fn(),
  };

  it('returns the path when grouping', () => {
    expect(getDestinationPath({ ...baseDropResult, path: [2] }, true)).toEqual([2]);
  });

  it('returns [path, 0] for ruleGroup drops', () => {
    expect(getDestinationPath({ ...baseDropResult, type: 'ruleGroup', path: [2] }, false)).toEqual([
      2, 0,
    ]);
  });

  it('returns parent + hoverIndex for inlineCombinator drops', () => {
    expect(
      getDestinationPath({ ...baseDropResult, type: 'inlineCombinator', path: [1, 3] }, false)
    ).toEqual([1, 3]);
  });

  it('returns parent + (hoverIndex + 1) for rule drops', () => {
    expect(getDestinationPath({ ...baseDropResult, type: 'rule', path: [1] }, false)).toEqual([2]);
  });

  it('handles nested rule drops', () => {
    expect(getDestinationPath({ ...baseDropResult, type: 'rule', path: [2, 1] }, false)).toEqual([
      2, 2,
    ]);
  });
});
// #endregion

// #region handleDrop
describe('handleDrop', () => {
  it('does nothing when dropResult is null', () => {
    const actions = createMockActions();
    handleDrop({
      item: createDraggedItem(),
      dropResult: null,
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(actions.moveRule).not.toHaveBeenCalled();
    expect(actions.groupRule).not.toHaveBeenCalled();
  });

  it('calls moveRule for same-QB move', () => {
    const actions = createMockActions();
    handleDrop({
      item: createDraggedItem({ path: [0] }),
      dropResult: {
        type: 'rule',
        path: [2],
        qbId: 'qb1',
        getQuery: vi.fn(),
        dispatchQuery: vi.fn(),
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(actions.moveRule).toHaveBeenCalledWith([0], [3], false);
  });

  it('calls moveRule with clone=true for same-QB copy', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'alt');
    const actions = createMockActions();
    handleDrop({
      item: createDraggedItem({ path: [0] }),
      dropResult: {
        type: 'rule',
        path: [2],
        qbId: 'qb1',
        getQuery: vi.fn(),
        dispatchQuery: vi.fn(),
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(actions.moveRule).toHaveBeenCalledWith([0], [3], true);
  });

  it('calls groupRule for same-QB group', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'ctrl');
    const actions = createMockActions();
    handleDrop({
      item: createDraggedItem({ path: [0] }),
      dropResult: {
        type: 'rule',
        path: [2],
        qbId: 'qb1',
        getQuery: vi.fn(),
        dispatchQuery: vi.fn(),
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });
    expect(actions.groupRule).toHaveBeenCalledWith([0], [2], false);
  });

  it('inserts into other QB and removes from source for cross-QB move', () => {
    const otherQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const dispatchQuery = vi.fn();
    const actions = createMockActions();
    const item = createDraggedItem({ path: [0], qbId: 'qb1' });

    handleDrop({
      item,
      dropResult: {
        type: 'ruleGroup',
        path: [],
        qbId: 'qb2',
        getQuery: () => otherQuery,
        dispatchQuery,
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });

    expect(dispatchQuery).toHaveBeenCalledTimes(1);
    expect(actions.onRuleRemove).toHaveBeenCalledWith([0]);
  });

  it('inserts into other QB without removing for cross-QB copy', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'alt');
    const otherQuery: RuleGroupType = { combinator: 'and', rules: [] };
    const dispatchQuery = vi.fn();
    const actions = createMockActions();
    const item = createDraggedItem({ path: [0], qbId: 'qb1' });

    handleDrop({
      item,
      dropResult: {
        type: 'ruleGroup',
        path: [],
        qbId: 'qb2',
        getQuery: () => otherQuery,
        dispatchQuery,
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });

    expect(dispatchQuery).toHaveBeenCalledTimes(1);
    expect(actions.onRuleRemove).not.toHaveBeenCalled();
  });

  it('groups into other QB for cross-QB group', () => {
    isHotkeyPressed.mockImplementation((key: string) => key === 'ctrl');
    const otherQuery: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'f1', operator: '=', value: 'v1' }],
    };
    const dispatchQuery = vi.fn();
    const actions = createMockActions();
    const item = createDraggedItem({ path: [0], qbId: 'qb1' });

    handleDrop({
      item,
      dropResult: {
        type: 'rule',
        path: [0],
        qbId: 'qb2',
        getQuery: () => otherQuery,
        dispatchQuery,
      },
      schema: createMockSchema(),
      actions,
      copyModeModifierKey: 'alt',
      groupModeModifierKey: 'ctrl',
    });

    // Cross-QB group: dispatches a grouped query and removes from source
    expect(dispatchQuery).toHaveBeenCalledTimes(1);
    const dispatched = dispatchQuery.mock.calls[0][0] as RuleGroupType;
    // The result should have a nested group containing both the original rule and the dragged item
    expect(dispatched.rules).toHaveLength(1);
    expect((dispatched.rules[0] as RuleGroupType).rules).toHaveLength(2);
    expect(actions.onRuleRemove).toHaveBeenCalledWith([0]);
  });
});
// #endregion

// #region getDragItem
describe('getDragItem', () => {
  it('creates a drag item from path and schema', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        { field: 'f2', operator: '=', value: 'v2' },
      ],
    };
    const schema = createMockSchema({ getQuery: () => query });

    const item = getDragItem([1], schema);
    expect(item).toEqual({ field: 'f2', operator: '=', value: 'v2', path: [1], qbId: 'qb1' });
  });

  it('creates a drag item for a nested group', () => {
    const nestedGroup: RuleGroupType = { combinator: 'or', rules: [] };
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'f1', operator: '=', value: 'v1' }, nestedGroup],
    };
    const schema = createMockSchema({ getQuery: () => query });

    const item = getDragItem([1], schema);
    expect(item.path).toEqual([1]);
    expect(item.qbId).toBe('qb1');
    expect((item as any).combinator).toBe('or');
  });
});
// #endregion
