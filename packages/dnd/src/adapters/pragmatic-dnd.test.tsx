import { act, render, renderHook, screen } from '@testing-library/react';
import * as React from 'react';
import type {
  DraggedItem,
  QueryActions,
  RuleGroupType,
  RuleType,
  Schema,
} from 'react-querybuilder';
import { QueryBuilder, TestID } from 'react-querybuilder';
import type { Mock } from 'vitest';
import { isDndAdapter } from '../adapter';
import { QueryBuilderDnD } from '../QueryBuilderDnD';
import { createPragmaticDndAdapter } from './pragmatic-dnd';
import type { PragmaticDndExports } from './pragmatic-dnd';

// #region Mock helpers

// oxlint-disable typescript/no-explicit-any
interface DraggableRegistration {
  element: HTMLElement;
  dragHandle?: Element;
  getInitialData?: (...args: any[]) => Record<string, unknown>;
  canDrag?: (...args: any[]) => boolean;
  onDragStart?: (...args: any[]) => void;
  onDrop?: (...args: any[]) => void;
}

interface DropTargetRegistration {
  element: Element;
  getData?: (...args: any[]) => Record<string | symbol, unknown>;
  canDrop?: (...args: any[]) => boolean;
  onDragEnter?: (...args: any[]) => void;
  onDragLeave?: (...args: any[]) => void;
  onDrop?: (...args: any[]) => void;
}
// oxlint-disable typescript/no-explicit-any

interface MonitorRegistration {
  onDragStart?: (args: { source: { data: Record<string, unknown> } }) => void;
  onDrop?: (args: {
    source: { data: Record<string, unknown> };
    location: { current: { dropTargets: { data: Record<string, unknown> }[] } };
  }) => void;
}

const createMockPragmaticDnd = () => {
  const draggables: DraggableRegistration[] = [];
  const dropTargets: DropTargetRegistration[] = [];
  const monitors: MonitorRegistration[] = [];

  return {
    draggable: vi.fn((args: DraggableRegistration) => {
      draggables.push(args);
      return () => {
        const idx = draggables.indexOf(args);
        if (idx >= 0) draggables.splice(idx, 1);
      };
    }),
    dropTargetForElements: vi.fn((args: DropTargetRegistration) => {
      dropTargets.push(args);
      return () => {
        const idx = dropTargets.indexOf(args);
        if (idx >= 0) dropTargets.splice(idx, 1);
      };
    }),
    monitorForElements: vi.fn((args: MonitorRegistration) => {
      monitors.push(args);
      return () => {
        const idx = monitors.indexOf(args);
        if (idx >= 0) monitors.splice(idx, 1);
      };
    }),
    combine: vi.fn((...fns: (() => void)[]) => () => {
      for (const fn of fns) fn();
    }),
    _draggables: draggables,
    _dropTargets: dropTargets,
    _monitors: monitors,
  };
};

// oxlint-disable typescript/no-explicit-any
const mockSchema = (overrides?: Partial<Schema<any, any>>): Schema<any, any> =>
  ({
    qbId: 'test-qb',
    getQuery: () => ({
      combinator: 'and',
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        { field: 'f2', operator: '=', value: 'v2' },
      ],
    }),
    dispatchQuery: vi.fn(),
    independentCombinators: false,
    classNames: {},
    suppressStandardClassnames: false,
    ...overrides,
  }) as Schema<any, any>;
// oxlint-enable typescript/no-explicit-any

const mockActions = (): QueryActions =>
  ({ moveRule: vi.fn(), groupRule: vi.fn(), onRuleRemove: vi.fn() }) as unknown as QueryActions;

const mockRule = (overrides?: Partial<RuleType>): RuleType => ({
  field: 'f1',
  operator: '=',
  value: 'v1',
  ...overrides,
});

const mockRuleGroup = (): RuleGroupType => ({ combinator: 'and', rules: [] });

// #endregion

describe('createPragmaticDndAdapter', () => {
  it('returns a valid DndAdapter', () => {
    const mock = createMockPragmaticDnd();
    const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
    expect(isDndAdapter(adapter)).toBe(true);
    expect(adapter).toHaveProperty('DndProvider');
    expect(adapter).toHaveProperty('useRuleDnD');
    expect(adapter).toHaveProperty('useRuleGroupDnD');
    expect(adapter).toHaveProperty('useInlineCombinatorDnD');
  });

  describe('DndProvider', () => {
    it('renders children', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      render(
        <adapter.DndProvider>
          <div data-testid="child">Hello</div>
        </adapter.DndProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('registers a global monitor', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );
      expect(mock.monitorForElements).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRuleDnD', () => {
    it('returns initial state for a non-dragging rule', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      const { result } = renderHook(
        () =>
          adapter.useRuleDnD({
            path: [0],
            disabled: false,
            schema,
            actions: mockActions(),
            rule: mockRule(),
            copyModeModifierKey: 'alt',
            groupModeModifierKey: 'ctrl',
          }),
        {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <adapter.DndProvider>{children}</adapter.DndProvider>
          ),
        }
      );

      expect(result.current.isDragging).toBe(false);
      expect(result.current.isOver).toBe(false);
      expect(result.current.dropNotAllowed).toBe(false);
      expect(result.current.dragMonitorId).toMatch(/^drag-rule-/);
      expect(result.current.dropMonitorId).toMatch(/^drop-rule-/);
      expect(typeof result.current.dndRef).toBe('function');
      expect(typeof result.current.dragRef).toBe('function');
    });

    it('registers draggable and drop target when refs are attached', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef} data-testid="container">
            <span ref={dragRef} data-testid="handle">
              Drag
            </span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(mock.draggable).toHaveBeenCalledTimes(1);
      expect(mock.dropTargetForElements).toHaveBeenCalledTimes(1);

      const dragCall = (mock.draggable as Mock).mock.calls[0][0];
      expect(dragCall.element).toBe(screen.getByTestId('container'));
      expect(dragCall.dragHandle).toBe(screen.getByTestId('handle'));
    });

    it('provides correct data in getInitialData', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();
      const actions = mockActions();

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0, 1],
          disabled: false,
          schema,
          actions,
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dragReg = mock._draggables[0];
      const data = dragReg.getInitialData!();
      expect(data.__rqbPath).toEqual([0, 1]);
      expect(data.__rqbSchema).toBe(schema);
      expect(data.__rqbActions).toBe(actions);
    });

    it('passes disabled to canDrag', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: true,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dragReg = mock._draggables[0];
      expect(dragReg.canDrag!()).toBe(false);
    });

    it('reports isDragging when drag starts and stops', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(hookResult!.isDragging).toBe(false);

      const dragReg = mock._draggables[0];

      act(() => {
        dragReg.onDragStart!();
      });
      expect(hookResult!.isDragging).toBe(true);

      act(() => {
        dragReg.onDrop!();
      });
      expect(hookResult!.isDragging).toBe(false);
    });

    it('provides validate and getDropResult in drop target data', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      expect(data.__rqbType).toBe('rule');
      expect(typeof data.__rqbValidate).toBe('function');
      expect(typeof data.__rqbGetDropResult).toBe('function');
    });
  });

  describe('useRuleGroupDnD', () => {
    it('returns initial state', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const { result } = renderHook(
        () =>
          adapter.useRuleGroupDnD({
            path: [1],
            disabled: false,
            schema: mockSchema(),
            actions: mockActions(),
            ruleGroup: mockRuleGroup(),
            copyModeModifierKey: 'alt',
            groupModeModifierKey: 'ctrl',
          }),
        {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <adapter.DndProvider>{children}</adapter.DndProvider>
          ),
        }
      );

      expect(result.current.isDragging).toBe(false);
      expect(result.current.isOver).toBe(false);
      expect(result.current.dragMonitorId).toMatch(/^drag-ruleGroup-/);
      expect(result.current.dropMonitorId).toMatch(/^drop-ruleGroup-/);
      expect(typeof result.current.previewRef).toBe('function');
      expect(typeof result.current.dragRef).toBe('function');
      expect(typeof result.current.dropRef).toBe('function');
    });

    it('does not register draggable for root group (path [])', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef}>
            <div ref={dropRef}>
              <span ref={dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Root group should not have a draggable registered
      expect(mock.draggable).not.toHaveBeenCalled();
      // But should still have a drop target
      expect(mock.dropTargetForElements).toHaveBeenCalledTimes(1);
    });

    it('registers draggable for non-root groups', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef}>
            <div ref={dropRef}>
              <span ref={dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(mock.draggable).toHaveBeenCalledTimes(1);
      expect(mock.dropTargetForElements).toHaveBeenCalledTimes(1);
    });

    it('connects separate refs for preview, drag handle, and drop area', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef} data-testid="preview">
            <div ref={dropRef} data-testid="drop-header">
              <span ref={dragRef} data-testid="handle">
                Drag
              </span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dragCall = (mock.draggable as Mock).mock.calls[0][0];
      expect(dragCall.element).toBe(screen.getByTestId('preview'));
      expect(dragCall.dragHandle).toBe(screen.getByTestId('handle'));

      const dropCall = (mock.dropTargetForElements as Mock).mock.calls[0][0];
      expect(dropCall.element).toBe(screen.getByTestId('drop-header'));
    });

    it('provides correct data in getInitialData for non-root group', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();
      const actions = mockActions();

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema,
          actions,
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef}>
            <div ref={dropRef}>
              <span ref={dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dragReg = mock._draggables[0];
      const data = dragReg.getInitialData!();
      expect(data.__rqbPath).toEqual([1]);
      expect(data.__rqbSchema).toBe(schema);
      expect(data.__rqbActions).toBe(actions);
      expect(dragReg.canDrag!()).toBe(true);
    });

    it('reports isDragging when drag starts and stops for non-root group', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      let hookResult: ReturnType<typeof adapter.useRuleGroupDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.previewRef}>
            <div ref={hookResult.dropRef}>
              <span ref={hookResult.dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(hookResult!.isDragging).toBe(false);

      const dragReg = mock._draggables[0];

      act(() => {
        dragReg.onDragStart!();
      });
      expect(hookResult!.isDragging).toBe(true);

      act(() => {
        dragReg.onDrop!();
      });
      expect(hookResult!.isDragging).toBe(false);
    });
  });

  describe('useInlineCombinatorDnD', () => {
    it('returns initial state', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const { result } = renderHook(
        () =>
          adapter.useInlineCombinatorDnD({
            path: [1],
            schema: mockSchema({ independentCombinators: true }),
            rules: [
              { field: 'f1', operator: '=', value: 'v1' },
              'and',
              { field: 'f2', operator: '=', value: 'v2' },
            ],
            copyModeModifierKey: 'alt',
            groupModeModifierKey: 'ctrl',
          }),
        {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <adapter.DndProvider>{children}</adapter.DndProvider>
          ),
        }
      );

      expect(result.current.isOver).toBe(false);
      expect(result.current.dropMonitorId).toMatch(/^drop-inlineCombinator-/);
      expect(typeof result.current.dropRef).toBe('function');
    });

    it('registers a drop target (no draggable)', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dropRef } = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dropRef} data-testid="ic-drop">
            combinator
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Only a drop target, no draggable
      expect(mock.dropTargetForElements).toHaveBeenCalledTimes(1);
      expect(mock.draggable).not.toHaveBeenCalled();
    });

    it('provides validate and getDropResult in data', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dropRef } = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dropRef} data-testid="ic-drop">
            combinator
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      expect(data.__rqbType).toBe('inlineCombinator');
      expect(typeof data.__rqbValidate).toBe('function');
      expect(typeof data.__rqbGetDropResult).toBe('function');
    });
  });

  describe('drop validation', () => {
    it('validate function rejects self-drops for rules', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const validate = data.__rqbValidate as (item: DraggedItem) => boolean;

      const selfItem: DraggedItem = {
        field: 'f1',
        operator: '=',
        value: 'v1',
        path: [0],
        qbId: 'test-qb',
      };
      expect(validate(selfItem)).toBe(false);
    });

    it('validate function accepts drops from different paths', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const validate = data.__rqbValidate as (item: DraggedItem) => boolean;

      const otherItem: DraggedItem = {
        field: 'f2',
        operator: '=',
        value: 'v2',
        path: [3],
        qbId: 'test-qb',
      };
      expect(validate(otherItem)).toBe(true);
    });

    it('getDropResult returns correct DropResult for rule', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const getDropResult = data.__rqbGetDropResult as () => unknown;
      expect(getDropResult()).toEqual(
        expect.objectContaining({ type: 'rule', path: [0], qbId: 'test-qb' })
      );
    });

    it('ruleGroup validate rejects self-drops', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef}>
            <div ref={dropRef}>
              <span ref={dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const validate = data.__rqbValidate as (item: DraggedItem) => boolean;

      const selfItem: DraggedItem = { combinator: 'and', rules: [], path: [1], qbId: 'test-qb' };
      expect(validate(selfItem)).toBe(false);
    });

    it('ruleGroup getDropResult returns correct DropResult', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { previewRef, dragRef, dropRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={previewRef}>
            <div ref={dropRef}>
              <span ref={dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const getDropResult = data.__rqbGetDropResult as () => unknown;
      expect(getDropResult()).toEqual(
        expect.objectContaining({ type: 'ruleGroup', path: [1], qbId: 'test-qb' })
      );
    });

    it('inlineCombinator validate accepts valid drops', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dropRef } = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <div ref={dropRef}>combinator</div>;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const validate = data.__rqbValidate as (item: DraggedItem) => boolean;

      const otherItem: DraggedItem = {
        field: 'f3',
        operator: '=',
        value: 'v3',
        path: [5],
        qbId: 'test-qb',
      };
      expect(validate(otherItem)).toBe(true);
    });

    it('inlineCombinator validate handles undefined rules', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dropRef } = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          rules: undefined,
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <div ref={dropRef}>combinator</div>;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const validate = data.__rqbValidate as (item: DraggedItem) => boolean;

      const otherItem: DraggedItem = {
        field: 'f3',
        operator: '=',
        value: 'v3',
        path: [5],
        qbId: 'test-qb',
      };
      // Should not throw, even with undefined rules
      expect(() => validate(otherItem)).not.toThrow();
    });

    it('inlineCombinator getDropResult returns correct DropResult', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const TestComponent = () => {
        const { dropRef } = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <div ref={dropRef}>combinator</div>;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const dropReg = mock._dropTargets[0];
      const data = dropReg.getData!();
      const getDropResult = data.__rqbGetDropResult as () => unknown;
      expect(getDropResult()).toEqual(
        expect.objectContaining({ type: 'inlineCombinator', path: [1], qbId: 'test-qb' })
      );
    });
  });

  describe('isOver and dropNotAllowed with active drag', () => {
    it('useRuleDnD reports isOver=true when hovered with valid drag item', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Before drag starts, isOver=false
      expect(hookResult!.isOver).toBe(false);
      expect(hookResult!.dropNotAllowed).toBe(false);

      // Simulate monitor drag start from path [3]
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [3], __rqbSchema: schema } },
        });
      });

      // Simulate hover via onDragEnter
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });

      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('useRuleDnD reports dropNotAllowed when hovered with invalid drag item (self)', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Simulate dragging self (path [0])
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [0], __rqbSchema: schema } },
        });
      });

      // Simulate hover
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });

      expect(hookResult!.isOver).toBe(false);
      expect(hookResult!.dropNotAllowed).toBe(true);
    });

    it('useRuleGroupDnD reports isOver=true when hovered with valid drag item', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleGroupDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.previewRef}>
            <div ref={hookResult.dropRef}>
              <span ref={hookResult.dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Simulate drag from path [3]
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [3], __rqbSchema: schema } },
        });
      });

      // Simulate hover on drop target
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });

      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('useInlineCombinatorDnD reports isOver=true when hovered with valid drag item', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema({ independentCombinators: true });

      let hookResult: ReturnType<typeof adapter.useInlineCombinatorDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useInlineCombinatorDnD({
          path: [1],
          schema,
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <div ref={hookResult.dropRef}>combinator</div>;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Simulate drag from path [5]
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [5], __rqbSchema: schema } },
        });
      });

      // Simulate hover
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });

      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('isOver resets on drag leave', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Simulate drag start
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [3], __rqbSchema: schema } },
        });
      });

      // Hover
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      // Leave
      act(() => {
        mock._dropTargets[0].onDragLeave!();
      });
      expect(hookResult!.isOver).toBe(false);
    });

    it('rule drop target onDrop resets isOver', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [3], __rqbSchema: schema } },
        });
      });

      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      // onDrop resets isOver
      act(() => {
        mock._dropTargets[0].onDrop!();
      });
      expect(hookResult!.isOver).toBe(false);
    });

    it('ruleGroup drop target onDragLeave and onDrop reset isOver', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleGroupDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.previewRef}>
            <div ref={hookResult.dropRef}>
              <span ref={hookResult.dragRef}>Drag</span>
            </div>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [3], __rqbSchema: schema } },
        });
      });

      // Hover + leave
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      act(() => {
        mock._dropTargets[0].onDragLeave!();
      });
      expect(hookResult!.isOver).toBe(false);

      // Hover + drop
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      act(() => {
        mock._dropTargets[0].onDrop!();
      });
      expect(hookResult!.isOver).toBe(false);
    });

    it('inlineCombinator drop target onDragLeave and onDrop reset isOver', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema({ independentCombinators: true });

      let hookResult: ReturnType<typeof adapter.useInlineCombinatorDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useInlineCombinatorDnD({
          path: [1],
          schema,
          rules: [
            { field: 'f1', operator: '=', value: 'v1' },
            'and',
            { field: 'f2', operator: '=', value: 'v2' },
          ],
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <div ref={hookResult.dropRef}>combinator</div>;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [5], __rqbSchema: schema } },
        });
      });

      // Hover + leave
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      act(() => {
        mock._dropTargets[0].onDragLeave!();
      });
      expect(hookResult!.isOver).toBe(false);

      // Hover + drop
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      expect(hookResult!.isOver).toBe(true);

      act(() => {
        mock._dropTargets[0].onDrop!();
      });
      expect(hookResult!.isOver).toBe(false);
    });
  });

  describe('DndProvider drag lifecycle', () => {
    it('sets activeDragItem on drag start and clears on drop', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const schema = mockSchema();

      let hookResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      const TestComponent = () => {
        hookResult = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={hookResult.dndRef}>
            <span ref={hookResult.dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Drag start
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [0], __rqbSchema: schema } },
        });
      });

      // Simulate hover to test activeDragItem presence
      act(() => {
        mock._dropTargets[0].onDragEnter!();
      });
      // Path [0] dragged over path [1] - valid drop
      expect(hookResult!.isOver).toBe(true);

      // Drop with no valid target (clears state)
      act(() => {
        mock._monitors[0].onDrop!({
          source: { data: { __rqbPath: [0], __rqbSchema: schema } },
          location: { current: { dropTargets: [] } },
        });
      });

      // After drop, activeDragItem should be null (isOver=false because no active item)
      expect(hookResult!.isOver).toBe(false);
    });

    it('handleDragStart ignores events with missing data', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      expect(() => {
        act(() => {
          mock._monitors[0].onDragStart!({ source: { data: {} } });
        });
      }).not.toThrow();
    });

    it('calls handleDrop on valid drop', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const actions = mockActions();
      const schema = mockSchema();

      const TestComponent = () => {
        const { dndRef, dragRef } = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions,
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return (
          <div ref={dndRef}>
            <span ref={dragRef}>Drag</span>
          </div>
        );
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Start drag from path [0]
      act(() => {
        mock._monitors[0].onDragStart!({
          source: {
            data: {
              __rqbPath: [0],
              __rqbSchema: schema,
              __rqbActions: actions,
              __rqbCopyModeModifierKey: 'alt',
              __rqbGroupModeModifierKey: 'ctrl',
            },
          },
        });
      });

      // Get the drop target data
      const dropReg = mock._dropTargets[0];
      const targetData = dropReg.getData!();

      // Simulate drop on path [1] target
      act(() => {
        mock._monitors[0].onDrop!({
          source: {
            data: {
              __rqbPath: [0],
              __rqbSchema: schema,
              __rqbActions: actions,
              __rqbCopyModeModifierKey: 'alt',
              __rqbGroupModeModifierKey: 'ctrl',
            },
          },
          location: { current: { dropTargets: [{ data: targetData as Record<string, unknown> }] } },
        });
      });

      expect(actions.moveRule).toHaveBeenCalled();
    });

    it('does not call handleDrop when validate returns false', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const actions = mockActions();
      const schema = mockSchema();

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      // Start drag
      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [0], __rqbSchema: schema } },
        });
      });

      // Drop with a target that rejects
      act(() => {
        mock._monitors[0].onDrop!({
          source: {
            data: {
              __rqbPath: [0],
              __rqbSchema: schema,
              __rqbActions: actions,
              __rqbCopyModeModifierKey: 'alt',
              __rqbGroupModeModifierKey: 'ctrl',
            },
          },
          location: {
            current: {
              dropTargets: [
                { data: { __rqbValidate: () => false, __rqbGetDropResult: () => ({}) } },
              ],
            },
          },
        });
      });

      expect(actions.moveRule).not.toHaveBeenCalled();
    });

    it('does not call handleDrop when no drop targets', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);
      const actions = mockActions();
      const schema = mockSchema();

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      act(() => {
        mock._monitors[0].onDragStart!({
          source: { data: { __rqbPath: [0], __rqbSchema: schema } },
        });
      });

      act(() => {
        mock._monitors[0].onDrop!({
          source: { data: { __rqbActions: actions } },
          location: { current: { dropTargets: [] } },
        });
      });

      expect(actions.moveRule).not.toHaveBeenCalled();
    });
  });

  describe('integration with QueryBuilderDnD', () => {
    it('renders QueryBuilder with pragmatic-dnd adapter', async () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      await act(async () => {
        render(
          <QueryBuilderDnD dnd={adapter}>
            <QueryBuilder />
          </QueryBuilderDnD>
        );
      });

      expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
    });

    it('renders QueryBuilder with rules using pragmatic-dnd adapter', async () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      await act(async () => {
        render(
          <QueryBuilderDnD dnd={adapter}>
            <QueryBuilder
              query={{
                combinator: 'and',
                rules: [
                  { field: 'f1', operator: '=', value: 'v1' },
                  { field: 'f2', operator: '=', value: 'v2' },
                ],
              }}
            />
          </QueryBuilderDnD>
        );
      });

      expect(screen.getAllByTestId(TestID.rule)).toHaveLength(2);
      expect(screen.getAllByTestId(TestID.dragHandle)).toHaveLength(2);
    });

    it('sets data-dnd attribute', async () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      const { container } = await act(async () =>
        render(
          <QueryBuilderDnD dnd={adapter}>
            <QueryBuilder />
          </QueryBuilderDnD>
        )
      );

      expect(container.querySelector('[data-dnd="enabled"]')).toBeInTheDocument();
    });
  });

  describe('branch coverage: hotkey-dependent return values', () => {
    it('returns dropEffect "copy" when copyModeModifierKey is pressed', () => {
      const mock = createMockPragmaticDnd();
      const adapter = createPragmaticDndAdapter(mock as unknown as PragmaticDndExports);

      // Simulate pressing Alt key
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Alt', code: 'AltLeft' }));

      let ruleResult: ReturnType<typeof adapter.useRuleDnD> | undefined;
      let groupResult: ReturnType<typeof adapter.useRuleGroupDnD> | undefined;
      let icResult: ReturnType<typeof adapter.useInlineCombinatorDnD> | undefined;

      const TestComponent = () => {
        ruleResult = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        groupResult = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        icResult = adapter.useInlineCombinatorDnD({
          path: [1],
          schema: mockSchema({ independentCombinators: true }),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(ruleResult!.dropEffect).toBe('copy');
      expect(groupResult!.dropEffect).toBe('copy');
      expect(icResult!.dropEffect).toBe('copy');

      // Release the key
      document.dispatchEvent(new KeyboardEvent('keyup', { key: 'Alt', code: 'AltLeft' }));
    });
  });
});
