import type { Ref } from 'react';
import type {
  DropEffect,
  Path,
  QueryActions,
  RuleGroupTypeAny,
  RuleType,
  Schema,
} from 'react-querybuilder';
import type { CustomCanDropParams } from './types';

/**
 * Parameters for the adapter's `useRuleDnD` hook.
 */
export interface DndAdapterRuleDnDParams {
  path: Path;
  disabled: boolean;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  actions: QueryActions;
  rule: RuleType;
  canDrop?: (params: CustomCanDropParams) => boolean;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
  hideDefaultDragPreview?: boolean;
}

/**
 * Parameters for the adapter's `useRuleGroupDnD` hook.
 */
export interface DndAdapterRuleGroupDnDParams {
  path: Path;
  disabled: boolean;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  actions: QueryActions;
  ruleGroup: RuleGroupTypeAny;
  canDrop?: (params: CustomCanDropParams) => boolean;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
  hideDefaultDragPreview?: boolean;
}

/**
 * Parameters for the adapter's `useInlineCombinatorDnD` hook.
 */
export interface DndAdapterInlineCombinatorDnDParams {
  path: Path;
  // oxlint-disable-next-line typescript/no-explicit-any
  schema: Schema<any, any>;
  rules?: (RuleType | RuleGroupTypeAny | string)[];
  canDrop?: (params: CustomCanDropParams) => boolean;
  copyModeModifierKey: string;
  groupModeModifierKey: string;
}

/**
 * Return type for the adapter's `useRuleDnD` hook. Matches the existing
 * `UseRuleDnD` interface from `react-querybuilder`.
 */
export interface AdapterUseRuleDnDResult {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  dragRef: Ref<HTMLSpanElement>;
  dndRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

/**
 * Return type for the adapter's `useRuleGroupDnD` hook. Matches the existing
 * `UseRuleGroupDnD` interface from `react-querybuilder`.
 */
export interface AdapterUseRuleGroupDnDResult {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  isOver: boolean;
  dropMonitorId: string | symbol;
  previewRef: Ref<HTMLDivElement>;
  dragRef: Ref<HTMLSpanElement>;
  dropRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

/**
 * Return type for the adapter's `useInlineCombinatorDnD` hook.
 */
export interface AdapterUseInlineCombinatorDnDResult {
  isOver: boolean;
  dropMonitorId: string | symbol | null;
  dropRef: Ref<HTMLDivElement>;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  dropNotAllowed?: boolean;
}

/**
 * Props for the adapter's DnD context provider component.
 */
export interface DndAdapterProviderProps {
  debugMode?: boolean;
  /**
   * When `true`, the adapter should enable update-while-dragging behavior:
   * computing a shadow query on hover and committing it on drop instead of
   * using the standard drop-indicator approach.
   */
  updateWhileDragging?: boolean;
  children: React.ReactNode;
}

/**
 * The DnD adapter interface. Implementations of this interface provide
 * drag-and-drop functionality for react-querybuilder using a specific
 * DnD library.
 *
 * Built-in adapters: {@link createReactDnDAdapter} (for `react-dnd`)
 * and {@link createDndKitAdapter} (for `@dnd-kit/core`).
 *
 * @group DnD
 */
export interface DndAdapter {
  /**
   * Provider component that wraps the query builder tree with the
   * DnD library's context.
   */
  DndProvider: React.ComponentType<DndAdapterProviderProps>;

  /**
   * Hook providing drag-and-drop behavior for a rule component.
   * Returns refs and state to attach to the rule's DOM elements.
   */
  useRuleDnD: (params: DndAdapterRuleDnDParams) => AdapterUseRuleDnDResult;

  /**
   * Hook providing drag-and-drop behavior for a rule group component.
   * Returns refs and state to attach to the group's DOM elements.
   */
  useRuleGroupDnD: (params: DndAdapterRuleGroupDnDParams) => AdapterUseRuleGroupDnDResult;

  /**
   * Hook providing drop-target behavior for an inline combinator.
   * Returns a drop ref and hover state.
   */
  useInlineCombinatorDnD: (
    params: DndAdapterInlineCombinatorDnDParams
  ) => AdapterUseInlineCombinatorDnDResult;
}

/**
 * Type guard to check if a value is a {@link DndAdapter}.
 */
export const isDndAdapter = (value: unknown): value is DndAdapter =>
  typeof value === 'object' &&
  value !== null &&
  'DndProvider' in value &&
  'useRuleDnD' in value &&
  'useRuleGroupDnD' in value &&
  'useInlineCombinatorDnD' in value;
