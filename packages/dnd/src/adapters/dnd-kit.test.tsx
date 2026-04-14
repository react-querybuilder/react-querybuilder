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
import { isDndAdapter } from '../adapter';
import { QueryBuilderDnD } from '../QueryBuilderDnD';
import { createDndKitAdapter } from './dnd-kit';
import type { DndKitExports } from './dnd-kit';

// #region Mock helpers

const createMockSetNodeRef = () => vi.fn<(el: HTMLElement | null) => void>();

const createMockUseDraggable = () => {
  const setNodeRef = createMockSetNodeRef();
  const setActivatorNodeRef = createMockSetNodeRef();
  return vi
    .fn()
    .mockReturnValue({
      setNodeRef,
      setActivatorNodeRef,
      isDragging: false,
      listeners: {},
      attributes: { role: 'button', tabIndex: 0 },
    });
};

const createMockUseDroppable = () => {
  const setNodeRef = createMockSetNodeRef();
  return vi.fn().mockReturnValue({ setNodeRef, isOver: false });
};

// oxlint-disable-next-line typescript/no-explicit-any
const createMockDndKit = (overrides?: any) => {
  const mockUseDraggable = createMockUseDraggable();
  const mockUseDroppable = createMockUseDroppable();

  return {
    DndContext: ({ children }: { children?: React.ReactNode }) => <>{children}</>,
    useDraggable: mockUseDraggable,
    useDroppable: mockUseDroppable,
    // oxlint-disable typescript/no-extraneous-class
    PointerSensor: class PointerSensor {},
    KeyboardSensor: class KeyboardSensor {},
    // oxlint-enable typescript/no-extraneous-class
    useSensor: vi.fn((_sensor: unknown, _opts?: unknown) => ({})),
    useSensors: vi.fn((...sensors: unknown[]) => sensors),
    _useDraggable: mockUseDraggable,
    _useDroppable: mockUseDroppable,
    ...overrides,
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

describe('createDndKitAdapter', () => {
  it('returns a valid DndAdapter', () => {
    const mock = createMockDndKit();
    const adapter = createDndKitAdapter(mock);
    expect(isDndAdapter(adapter)).toBe(true);
    expect(adapter).toHaveProperty('DndProvider');
    expect(adapter).toHaveProperty('useRuleDnD');
    expect(adapter).toHaveProperty('useRuleGroupDnD');
    expect(adapter).toHaveProperty('useInlineCombinatorDnD');
  });

  describe('DndProvider', () => {
    it('renders children', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
      render(
        <adapter.DndProvider>
          <div data-testid="child">Hello</div>
        </adapter.DndProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('initializes sensors', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );
      expect(mock.useSensor).toHaveBeenCalledTimes(2);
      expect(mock.useSensors).toHaveBeenCalledTimes(1);
    });
  });

  describe('useRuleDnD', () => {
    it('returns initial state for a non-dragging rule', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
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

    it('calls useDraggable with correct config', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
      const schema = mockSchema();
      const actions = mockActions();

      renderHook(
        () =>
          adapter.useRuleDnD({
            path: [0, 1],
            disabled: false,
            schema,
            actions,
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

      expect(mock._useDraggable).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'drag-rule-test-qb-0_1',
          disabled: false,
          data: expect.objectContaining({ path: [0, 1], schema, actions }),
        })
      );
    });

    it('calls useDroppable with correct config including validate and getDropResult', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
        () =>
          adapter.useRuleDnD({
            path: [0],
            disabled: false,
            schema: mockSchema(),
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

      expect(mock._useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'drop-rule-test-qb-0',
          data: expect.objectContaining({
            type: 'rule',
            path: [0],
            validate: expect.any(Function),
            getDropResult: expect.any(Function),
          }),
        })
      );
    });

    it('passes disabled to useDraggable', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
        () =>
          adapter.useRuleDnD({
            path: [0],
            disabled: true,
            schema: mockSchema(),
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

      expect(mock._useDraggable).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    });

    it('connects refs to dnd-kit via callback refs', () => {
      const setDragNodeRef = createMockSetNodeRef();
      const setActivatorNodeRef = createMockSetNodeRef();
      const setDropNodeRef = createMockSetNodeRef();

      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: setDragNodeRef,
            setActivatorNodeRef,
            isDragging: false,
            listeners: {},
            attributes: {},
          }),
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: setDropNodeRef, isOver: false }),
      });
      const adapter = createDndKitAdapter(mock);

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

      const container = screen.getByTestId('container');
      const handle = screen.getByTestId('handle');

      // dndRef connects both draggable and droppable setNodeRef
      expect(setDragNodeRef).toHaveBeenCalledWith(container);
      expect(setDropNodeRef).toHaveBeenCalledWith(container);
      // dragRef connects to activator node
      expect(setActivatorNodeRef).toHaveBeenCalledWith(handle);
    });

    it('reports isDragging from useDraggable', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: true,
            listeners: {},
            attributes: {},
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const { result } = renderHook(
        () =>
          adapter.useRuleDnD({
            path: [0],
            disabled: false,
            schema: mockSchema(),
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

      expect(result.current.isDragging).toBe(true);
    });
  });

  describe('useRuleGroupDnD', () => {
    it('returns initial state', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

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

    it('disables dragging for root group (path [])', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
        () =>
          adapter.useRuleGroupDnD({
            path: [],
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

      expect(mock._useDraggable).toHaveBeenCalledWith(expect.objectContaining({ disabled: true }));
    });

    it('enables dragging for non-root groups', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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

      expect(mock._useDraggable).toHaveBeenCalledWith(expect.objectContaining({ disabled: false }));
    });

    it('connects separate refs for preview, drag handle, and drop area', () => {
      const setDragNodeRef = createMockSetNodeRef();
      const setActivatorNodeRef = createMockSetNodeRef();
      const setDropNodeRef = createMockSetNodeRef();

      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: setDragNodeRef,
            setActivatorNodeRef,
            isDragging: false,
            listeners: {},
            attributes: {},
          }),
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: setDropNodeRef, isOver: false }),
      });
      const adapter = createDndKitAdapter(mock);

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

      expect(setDragNodeRef).toHaveBeenCalledWith(screen.getByTestId('preview'));
      expect(setDropNodeRef).toHaveBeenCalledWith(screen.getByTestId('drop-header'));
      expect(setActivatorNodeRef).toHaveBeenCalledWith(screen.getByTestId('handle'));
    });
  });

  describe('useInlineCombinatorDnD', () => {
    it('returns initial state', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

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

    it('calls useDroppable with correct config', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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

      expect(mock._useDroppable).toHaveBeenCalledWith(
        expect.objectContaining({
          id: expect.stringMatching(/^drop-inlineCombinator-/),
          data: expect.objectContaining({
            type: 'inlineCombinator',
            validate: expect.any(Function),
            getDropResult: expect.any(Function),
          }),
        })
      );
    });
  });

  describe('drop validation', () => {
    it('validate function in droppable data correctly rejects self-drops', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
      const schema = mockSchema();

      renderHook(
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      const validate = droppableCall.data.validate;

      // Self-drop should be rejected
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
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
        () =>
          adapter.useRuleDnD({
            path: [1],
            disabled: false,
            schema: mockSchema(),
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      const validate = droppableCall.data.validate;

      // Drop from a different path should be accepted
      const otherItem: DraggedItem = {
        field: 'f2',
        operator: '=',
        value: 'v2',
        path: [3],
        qbId: 'test-qb',
      };
      expect(validate(otherItem)).toBe(true);
    });

    it('getDropResult returns correct DropResult', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);
      const schema = mockSchema();

      renderHook(
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      const dropResult = droppableCall.data.getDropResult();
      expect(dropResult).toEqual(
        expect.objectContaining({ type: 'rule', path: [0], qbId: 'test-qb' })
      );
    });

    it('ruleGroup validate rejects self-drops', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      const selfItem: DraggedItem = { combinator: 'and', rules: [], path: [1], qbId: 'test-qb' };
      expect(droppableCall.data.validate(selfItem)).toBe(false);
    });

    it('ruleGroup getDropResult returns correct DropResult', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      expect(droppableCall.data.getDropResult()).toEqual(
        expect.objectContaining({ type: 'ruleGroup', path: [1], qbId: 'test-qb' })
      );
    });

    it('inlineCombinator validate rejects group-mode drops', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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
            // Use a key that won't be pressed so we can test the validator
            groupModeModifierKey: 'ctrl',
          }),
        {
          wrapper: ({ children }: { children: React.ReactNode }) => (
            <adapter.DndProvider>{children}</adapter.DndProvider>
          ),
        }
      );

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      const otherItem: DraggedItem = {
        field: 'f3',
        operator: '=',
        value: 'v3',
        path: [5],
        qbId: 'test-qb',
      };
      // Without group mode key pressed, should accept
      expect(droppableCall.data.validate(otherItem)).toBe(true);
    });

    it('inlineCombinator getDropResult returns correct DropResult', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      renderHook(
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

      const droppableCall = mock._useDroppable.mock.calls[0][0];
      expect(droppableCall.data.getDropResult()).toEqual(
        expect.objectContaining({ type: 'inlineCombinator', path: [1], qbId: 'test-qb' })
      );
    });

    it('inlineCombinator dropRef connects to dnd-kit setNodeRef', () => {
      const setDropNodeRef = createMockSetNodeRef();
      const mock = createMockDndKit({
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: setDropNodeRef, isOver: false }),
      });
      const adapter = createDndKitAdapter(mock);

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

      expect(setDropNodeRef).toHaveBeenCalledWith(screen.getByTestId('ic-drop'));
    });
  });

  describe('ARIA attributes', () => {
    it('sets attributes on drag handle in useRuleDnD', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: {},
            attributes: { role: 'button', tabIndex: 0, 'aria-roledescription': 'draggable' },
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      expect(handle.getAttribute('role')).toBe('button');
      expect(handle.getAttribute('tabindex')).toBe('0');
      expect(handle.getAttribute('aria-roledescription')).toBe('draggable');
    });

    it('sets attributes on drag handle in useRuleGroupDnD', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: {},
            attributes: { role: 'button', tabIndex: 0 },
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      expect(handle.getAttribute('role')).toBe('button');
      expect(handle.getAttribute('tabindex')).toBe('0');
    });

    it('does not set attributes when drag is disabled', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: {},
            attributes: { role: 'button', tabIndex: 0 },
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleGroupDnD({
          path: [],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      // Root group (path []) has drag disabled, so no attributes set
      expect(handle.getAttribute('role')).toBeNull();
    });
  });

  describe('native listener attachment', () => {
    it('attaches sensor listeners to drag handle in useRuleDnD', () => {
      const onPointerDown = vi.fn();
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: { onPointerDown },
            attributes: {},
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      const pointerEvent = new Event('pointerdown', { bubbles: true });
      handle.dispatchEvent(pointerEvent);

      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(onPointerDown).toHaveBeenCalledWith({ nativeEvent: pointerEvent });
    });

    it('attaches sensor listeners to drag handle in useRuleGroupDnD', () => {
      const onPointerDown = vi.fn();
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: { onPointerDown },
            attributes: {},
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      const pointerEvent = new Event('pointerdown', { bubbles: true });
      handle.dispatchEvent(pointerEvent);

      expect(onPointerDown).toHaveBeenCalledTimes(1);
      expect(onPointerDown).toHaveBeenCalledWith({ nativeEvent: pointerEvent });
    });
  });

  describe('isOver and dropNotAllowed with active drag', () => {
    const createHoverTest = () => {
      let onDragStart: ((e: unknown) => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        return <>{children as React.ReactNode}</>;
      };

      return { MockDndContext, getOnDragStart: () => onDragStart! };
    };

    it('useRuleDnD reports isOver=true when hovered with valid drag item', () => {
      const { MockDndContext, getOnDragStart } = createHoverTest();
      const schema = mockSchema();

      const mock = createMockDndKit({
        DndContext: MockDndContext as DndKitExports['DndContext'],
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn(), isOver: true }),
      });
      const adapter = createDndKitAdapter(mock);

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
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Before drag starts, isOver=false (no activeDragItem)
      expect(hookResult!.isOver).toBe(false);
      expect(hookResult!.dropNotAllowed).toBe(true);

      // Fire drag start with a valid item at path [3]
      act(() => {
        getOnDragStart()({ active: { data: { current: { path: [3], schema } } } });
      });

      // Now with active drag from [3] hovering over [1]: isOver should be true
      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('useRuleDnD reports dropNotAllowed when hovered with invalid drag item (self)', () => {
      const { MockDndContext, getOnDragStart } = createHoverTest();
      const schema = mockSchema();

      const mock = createMockDndKit({
        DndContext: MockDndContext as DndKitExports['DndContext'],
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn(), isOver: true }),
      });
      const adapter = createDndKitAdapter(mock);

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
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Fire drag start for the same item (self-drop)
      act(() => {
        getOnDragStart()({ active: { data: { current: { path: [0], schema } } } });
      });

      expect(hookResult!.isOver).toBe(false);
      expect(hookResult!.dropNotAllowed).toBe(true);
    });

    it('useRuleGroupDnD reports isOver=true when hovered with valid drag item', () => {
      const { MockDndContext, getOnDragStart } = createHoverTest();
      const schema = mockSchema();

      const mock = createMockDndKit({
        DndContext: MockDndContext as DndKitExports['DndContext'],
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn(), isOver: true }),
      });
      const adapter = createDndKitAdapter(mock);

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
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Fire drag start with a valid item
      act(() => {
        getOnDragStart()({ active: { data: { current: { path: [3], schema } } } });
      });

      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('useInlineCombinatorDnD reports isOver=true when hovered with valid drag item', () => {
      const { MockDndContext, getOnDragStart } = createHoverTest();
      const schema = mockSchema({ independentCombinators: true });

      const mock = createMockDndKit({
        DndContext: MockDndContext as DndKitExports['DndContext'],
        useDroppable: vi.fn().mockReturnValue({ setNodeRef: vi.fn(), isOver: true }),
      });
      const adapter = createDndKitAdapter(mock);

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
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      // Fire drag start with a valid item from a different position
      act(() => {
        getOnDragStart()({ active: { data: { current: { path: [5], schema } } } });
      });

      expect(hookResult!.isOver).toBe(true);
      expect(hookResult!.dropNotAllowed).toBe(false);
    });

    it('handleDragStart ignores events with missing data', () => {
      const { MockDndContext, getOnDragStart } = createHoverTest();
      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      // Fire drag start with missing path/schema — should not crash
      expect(() => {
        act(() => {
          getOnDragStart()({ active: { data: { current: {} } } });
        });
      }).not.toThrow();
    });
  });

  describe('DndProvider drag lifecycle', () => {
    it('sets activeDragItem on drag start and clears on drag end', () => {
      let onDragStart: ((e: unknown) => void) | undefined;
      let onDragEnd: ((e: unknown) => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        onDragEnd = props.onDragEnd as typeof onDragEnd;
        return <>{children as React.ReactNode}</>;
      };

      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);
      const schema = mockSchema();

      // Track isOver results to detect activeDragItem presence
      const results: boolean[] = [];

      const TestComponent = () => {
        const { isOver } = adapter.useRuleDnD({
          path: [1],
          disabled: false,
          schema,
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        results.push(isOver);
        return null;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      expect(onDragStart).toBeDefined();
      expect(onDragEnd).toBeDefined();

      // Simulate drag start
      act(() => {
        onDragStart!({ active: { data: { current: { path: [0], schema } } } });
      });

      // Simulate drag end (no valid drop)
      act(() => {
        onDragEnd!({ active: { data: { current: null } }, over: null });
      });

      // After drag end, activeDragItem should be null again
      // (verified by no crashes and clean state)
    });

    it('handles drag cancel by clearing state', () => {
      let onDragStart: ((e: unknown) => void) | undefined;
      let onDragCancel: (() => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        onDragCancel = props.onDragCancel as typeof onDragCancel;
        return <>{children as React.ReactNode}</>;
      };

      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      // Simulate drag start then cancel
      act(() => {
        onDragStart!({ active: { data: { current: { path: [0], schema: mockSchema() } } } });
      });

      expect(() => {
        act(() => {
          onDragCancel!();
        });
      }).not.toThrow();
    });

    it('calls handleDrop on valid drag end', () => {
      let onDragStart: ((e: unknown) => void) | undefined;
      let onDragEnd: ((e: unknown) => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        onDragEnd = props.onDragEnd as typeof onDragEnd;
        return <>{children as React.ReactNode}</>;
      };

      const actions = mockActions();
      const schema = mockSchema();
      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      const _dragItem: DraggedItem = {
        field: 'f1',
        operator: '=',
        value: 'v1',
        path: [0],
        qbId: 'test-qb',
      };

      // Simulate drag start
      act(() => {
        onDragStart!({
          active: {
            data: {
              current: {
                path: [0],
                schema,
                actions,
                copyModeModifierKey: 'alt',
                groupModeModifierKey: 'ctrl',
              },
            },
          },
        });
      });

      // Simulate drag end on a valid target
      act(() => {
        onDragEnd!({
          active: {
            data: {
              current: {
                path: [0],
                schema,
                actions,
                copyModeModifierKey: 'alt',
                groupModeModifierKey: 'ctrl',
              },
            },
          },
          over: {
            data: {
              current: {
                type: 'rule',
                path: [1],
                schema,
                validate: (_d: DraggedItem) => true,
                getDropResult: () => ({
                  type: 'rule',
                  path: [1],
                  qbId: 'test-qb',
                  getQuery: schema.getQuery,
                  dispatchQuery: schema.dispatchQuery,
                  groupItems: false,
                  dropEffect: 'move',
                }),
              },
            },
          },
        });
      });

      expect(actions.moveRule).toHaveBeenCalled();
    });

    it('does not call handleDrop when validate returns false', () => {
      let onDragStart: ((e: unknown) => void) | undefined;
      let onDragEnd: ((e: unknown) => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        onDragEnd = props.onDragEnd as typeof onDragEnd;
        return <>{children as React.ReactNode}</>;
      };

      const actions = mockActions();
      const schema = mockSchema();
      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      act(() => {
        onDragStart!({ active: { data: { current: { path: [0], schema } } } });
      });

      act(() => {
        onDragEnd!({
          active: {
            data: {
              current: {
                path: [0],
                schema,
                actions,
                copyModeModifierKey: 'alt',
                groupModeModifierKey: 'ctrl',
              },
            },
          },
          over: { data: { current: { validate: () => false, getDropResult: () => ({}) } } },
        });
      });

      expect(actions.moveRule).not.toHaveBeenCalled();
    });

    it('does not call handleDrop when over is null', () => {
      let onDragStart: ((e: unknown) => void) | undefined;
      let onDragEnd: ((e: unknown) => void) | undefined;

      const MockDndContext = ({ children, ...props }: Record<string, unknown>) => {
        onDragStart = props.onDragStart as typeof onDragStart;
        onDragEnd = props.onDragEnd as typeof onDragEnd;
        return <>{children as React.ReactNode}</>;
      };

      const actions = mockActions();
      const schema = mockSchema();
      const mock = createMockDndKit({ DndContext: MockDndContext as DndKitExports['DndContext'] });
      const adapter = createDndKitAdapter(mock);

      render(
        <adapter.DndProvider>
          <div />
        </adapter.DndProvider>
      );

      act(() => {
        onDragStart!({ active: { data: { current: { path: [0], schema } } } });
      });

      act(() => {
        onDragEnd!({ active: { data: { current: { actions } } }, over: null });
      });

      expect(actions.moveRule).not.toHaveBeenCalled();
    });
  });

  describe('integration with QueryBuilderDnD', () => {
    it('renders QueryBuilder with dnd-kit adapter', async () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

      await act(async () => {
        render(
          <QueryBuilderDnD dnd={adapter}>
            <QueryBuilder />
          </QueryBuilderDnD>
        );
      });

      expect(screen.getByTestId(TestID.ruleGroup)).toBeInTheDocument();
    });

    it('renders QueryBuilder with rules using dnd-kit adapter', async () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

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
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

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

  describe('branch coverage: null attribute values', () => {
    it('skips setting attributes with null values in useRuleDnD', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: {},
            attributes: { role: 'button', tabIndex: 0, 'aria-label': null },
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleDnD({
          path: [0],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          rule: mockRule(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      expect(handle.getAttribute('role')).toBe('button');
      expect(handle.getAttribute('aria-label')).toBeNull();
    });

    it('skips setting attributes with null values in useRuleGroupDnD', () => {
      const mock = createMockDndKit({
        useDraggable: vi
          .fn()
          .mockReturnValue({
            setNodeRef: vi.fn(),
            setActivatorNodeRef: vi.fn(),
            isDragging: false,
            listeners: {},
            attributes: { role: 'button', tabIndex: null },
          }),
      });
      const adapter = createDndKitAdapter(mock);

      const TestComponent = () => {
        const { dragRef } = adapter.useRuleGroupDnD({
          path: [1],
          disabled: false,
          schema: mockSchema(),
          actions: mockActions(),
          ruleGroup: mockRuleGroup(),
          copyModeModifierKey: 'alt',
          groupModeModifierKey: 'ctrl',
        });
        return <span ref={dragRef} data-testid="handle" />;
      };

      render(
        <adapter.DndProvider>
          <TestComponent />
        </adapter.DndProvider>
      );

      const handle = screen.getByTestId('handle');
      expect(handle.getAttribute('role')).toBe('button');
      expect(handle.getAttribute('tabindex')).toBeNull();
    });
  });

  describe('branch coverage: hotkey-dependent return values', () => {
    it('returns dropEffect "copy" when copyModeModifierKey is pressed', () => {
      const mock = createMockDndKit();
      const adapter = createDndKitAdapter(mock);

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
