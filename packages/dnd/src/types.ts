import type * as ReactDnD from 'react-dnd';
import type * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import type * as ReactDndTouchBackend from 'react-dnd-touch-backend';
import type {
  Controls,
  DndDropTargetType,
  DraggedItem,
  DropEffect,
  FullField,
  Path,
  QueryBuilderContextProviderProps,
  RuleGroupTypeAny,
} from 'react-querybuilder';
import type { SetOptional } from 'type-fest';
import type { DndAdapter } from './adapter';

type ReactDndBackendFactory = typeof ReactDndHtml5Backend.HTML5Backend;

interface OptionalKnownDndBackends
  extends
    Partial<Pick<typeof ReactDndHtml5Backend, 'HTML5Backend'>>,
    Partial<Pick<typeof ReactDndTouchBackend, 'TouchBackend'>> {}

/**
 * Combination of all exports from `react-dnd` and the backends from
 * `react-dnd-html5-backend` and `react-dnd-touch-backend`.
 *
 * @group Hooks
 */
export type UseReactDnD = typeof ReactDnD & {
  ReactDndBackend: ReactDndBackendFactory;
} & OptionalKnownDndBackends;

/**
 * Type of the `dnd` prop on `QueryBuilderDnD`/`QueryBuilderDndWithoutProvider`
 * when passing raw `react-dnd` exports (legacy API).
 *
 * @group Props
 */
export type DndProp = SetOptional<UseReactDnD, 'ReactDndBackend'> & OptionalKnownDndBackends;

/**
 * Parameters passed to custom `canDrop` functions.
 */
export interface CustomCanDropParams {
  dragging: DraggedItem;
  hovering: DraggedItem;
  groupItems?: boolean;
}

/**
 * {@link QueryBuilderDnD} props.
 *
 * @group Props
 */
export interface QueryBuilderDndProps extends QueryBuilderContextProviderProps {
  /**
   * A {@link DndAdapter} or raw `react-dnd` exports. When raw `react-dnd` exports are
   * provided (legacy API), they are automatically wrapped in a `react-dnd` adapter.
   *
   * If omitted, the component will asynchronously load `react-dnd`, `react-dnd-html5-backend`,
   * and `react-dnd-touch-backend`. Drag-and-drop features will only be enabled
   * once those packages have loaded.
   */
  dnd?: DndAdapter | DndProp;
  canDrop?: (params: CustomCanDropParams) => boolean;
  /**
   * Key code for the modifier key that puts a drag-and-drop action in "copy" mode.
   * Can be combined with "group" modifier key.
   *
   * @default "alt"
   */
  copyModeModifierKey?: string;
  /**
   * Milliseconds after hovering a drop target before the drop effect
   * automatically switches to "copy". Set to `undefined` or `0` to disable.
   */
  copyModeAfterHoverMs?: number;
  /**
   * Key code for the modifier key that puts a drag-and-drop action in "group" mode.
   * Can be combined with "copy" modifier key.
   *
   * @default "ctrl"
   */
  groupModeModifierKey?: string;
  /**
   * Milliseconds after hovering a drop target before the drop will
   * automatically create a new group. Set to `undefined` or `0` to disable.
   */
  groupModeAfterHoverMs?: number;
  /**
   * Do not render the "ghost" preview image when dragging.
   */
  hideDefaultDragPreview?: boolean;
  /**
   * Enable visual rearrangement of the query tree during drag. When enabled,
   * rules and groups visually move to their prospective positions as the user
   * drags, instead of only showing a drop indicator line.
   *
   * `onQueryChange` is only fired on drop, not during intermediate movements.
   *
   * @default false
   */
  updateWhileDragging?: boolean;
  /**
   * Callback invoked on each drag position change when {@link updateWhileDragging}
   * is enabled. Receives the dragged item, the shadow query representing the
   * prospective layout, and the preview path of the dragged item.
   */
  onDragMove?: OnDragMoveCallback;
}

/**
 * State provided during an active drag with `updateWhileDragging` enabled.
 *
 * @group DnD
 */
export interface DragPreviewState {
  /** The shadow/preview query showing the dragged item at its prospective position. */
  shadowQuery: RuleGroupTypeAny;
  /** The original query before the drag started (for cancel/revert). */
  originalQuery: RuleGroupTypeAny;
  /** Path of the dragged item in the original query. */
  draggedPath: Path;
  /** Path of the dragged item in the shadow query (its preview position). */
  previewPath: Path;
  /** Current drop effect based on modifier keys. */
  dropEffect: DropEffect;
  /** Whether group mode is active. */
  groupItems: boolean;
  /** The qbId of the query builder being dragged within. */
  qbId: string;
}

/**
 * Callback invoked on each drag position change when `updateWhileDragging` is enabled.
 *
 * @group DnD
 */
export type OnDragMoveCallback = (params: {
  draggedItem: DraggedItem;
  shadowQuery: RuleGroupTypeAny;
  originalQuery: RuleGroupTypeAny;
  previewPath: Path;
}) => void;

/**
 * Parameters describing a drag target position for shadow query computation.
 *
 * @group DnD
 */
export interface DragTargetPosition {
  targetPath: Path;
  targetType: DndDropTargetType;
  quadrant: 'upper' | 'lower';
}

/**
 * {@link QueryBuilderDndContext} props.
 *
 * @group Props
 */
export interface QueryBuilderDndContextProps extends Pick<
  QueryBuilderDndProps,
  | 'canDrop'
  | 'copyModeModifierKey'
  | 'copyModeAfterHoverMs'
  | 'groupModeModifierKey'
  | 'groupModeAfterHoverMs'
  | 'hideDefaultDragPreview'
  | 'updateWhileDragging'
  | 'onDragMove'
> {
  adapter?: DndAdapter;
  baseControls: Pick<Controls<FullField, string>, 'rule' | 'ruleGroup' | 'combinatorSelector'>;
}
