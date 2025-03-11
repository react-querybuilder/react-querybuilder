import type * as ReactDnD from 'react-dnd';
import type { useDrag as useDragOriginal, useDrop as useDropOriginal } from 'react-dnd';
import type * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import type {
  Controls,
  DraggedItem,
  FullField,
  QueryBuilderContextProviderProps,
} from 'react-querybuilder';

/**
 * Combination of all exports from `react-dnd` and `react-dnd-html5-backend`.
 *
 * @group Hooks
 */
export type UseReactDnD = typeof ReactDnD & typeof ReactDndHtml5Backend;

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
export type QueryBuilderDndProps = QueryBuilderContextProviderProps & {
  /**
   * Provide this prop if `enableDragAndDrop` is `true` for the child element and
   * you want the component to render immediately with drag-and-drop enabled.
   * Otherwise, the component will asynchronously load `react-dnd` and
   * `react-dnd-html5-backend` and drag-and-drop features will only be enabled
   * once those packages have loaded.
   */
  dnd?: UseReactDnD;
  canDrop?(params: CustomCanDropParams): boolean;
};

/**
 * @group Props
 */
export interface QueryBuilderDndContextProps {
  useDrag?: typeof useDragOriginal;
  useDrop?: typeof useDropOriginal;
  baseControls: Pick<Controls<FullField, string>, 'rule' | 'ruleGroup' | 'combinatorSelector'>;
  canDrop?: (params: CustomCanDropParams) => boolean;
  copyModeModifierKey?: string;
  groupModeModifierKey?: string;
}
