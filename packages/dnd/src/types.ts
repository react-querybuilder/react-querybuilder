import type { ReactElement } from 'react';
import type {
  Controls,
  DraggedItem,
  InlineCombinatorProps,
  Path,
  QueryActions,
  QueryBuilderContextProviderProps,
  RuleGroupProps,
  RuleProps,
} from 'react-querybuilder';

/**
 * {@link RuleGroupDnD} props.
 */
export interface RuleGroupDndProps {
  disabled: boolean;
  parentDisabled: boolean;
  path: Path;
  moveRule: QueryActions['moveRule'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
  children: ReactElement<RuleGroupProps>;
}

/**
 * {@link RuleDnD} props.
 */
export interface RuleDndProps {
  moveRule: QueryActions['moveRule'];
  disabled: boolean;
  parentDisabled: boolean;
  path: Path;
  independentCombinators: boolean;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
  children: ReactElement<RuleProps>;
}

/**
 * {@link InlineCombinatorDnD} props.
 */
export interface InlineCombinatorDndProps extends InlineCombinatorProps {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
}

/**
 * Combination of all exports from `react-dnd` and `react-dnd-html5-backend`.
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type UseReactDnD = typeof import('react-dnd') & typeof import('react-dnd-html5-backend');

/**
 * Parameters passed to custom `canDrop` functions.
 */
export interface CustomCanDropParams {
  item: DraggedItem;
  path: Path;
}

/**
 * {@link QueryBuilderDnD} props.
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

export type QueryBuilderDndContextProps = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag?: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop?: typeof import('react-dnd')['useDrop'];
  baseControls: Pick<Controls, 'rule' | 'ruleGroup' | 'combinatorSelector'>;
  canDrop?(params: CustomCanDropParams): boolean;
};
