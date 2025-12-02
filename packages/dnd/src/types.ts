import type * as ReactDnD from 'react-dnd';
import type { useDrag as useDragOriginal, useDrop as useDropOriginal } from 'react-dnd';
import type * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import type * as ReactDndTouchBackend from 'react-dnd-touch-backend';
import type {
  Controls,
  DraggedItem,
  FullField,
  QueryBuilderContextProviderProps,
} from 'react-querybuilder';
import type { SetOptional } from 'type-fest';

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
 * Type of the `dnd` prop on `QueryBuilderDnD`/`QueryBuilderDndWithoutProvider`.
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
   * Provide this prop if `enableDragAndDrop` is `true` for the child element and
   * you want the component to render immediately with drag-and-drop enabled.
   * Otherwise, the component will asynchronously load `react-dnd`, `react-dnd-html5-backend`,
   * and `react-dnd-touch-backend`. Drag-and-drop features will only be enabled
   * once those packages have loaded.
   */
  dnd?: DndProp;
  canDrop?: (params: CustomCanDropParams) => boolean;
  /**
   * Key code for the modifier key that puts a drag-and-drop action in "copy" mode.
   * Can be combined with "group" modifier key.
   *
   * @default "alt"
   */
  copyModeModifierKey?: string;
  /**
   * Key code for the modifier key that puts a drag-and-drop action in "group" mode.
   * Can be combined with "copy" modifier key.
   *
   * @default "ctrl"
   */
  groupModeModifierKey?: string;
  /**
   * Do not render the "ghost" preview image when dragging.
   */
  hideDefaultDragPreview?: boolean;
}

/**
 * {@link QueryBuilderDndContext} props.
 *
 * @group Props
 */
export interface QueryBuilderDndContextProps extends Pick<
  QueryBuilderDndProps,
  'canDrop' | 'copyModeModifierKey' | 'groupModeModifierKey' | 'hideDefaultDragPreview'
> {
  useDrag?: typeof useDragOriginal;
  useDrop?: typeof useDropOriginal;
  baseControls: Pick<Controls<FullField, string>, 'rule' | 'ruleGroup' | 'combinatorSelector'>;
}
