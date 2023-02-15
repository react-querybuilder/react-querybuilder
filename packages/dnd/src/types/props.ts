import type {
  Controls,
  InlineCombinatorProps,
  QueryActions,
  QueryBuilderContextProviderProps,
  RuleGroupProps,
  RuleProps,
} from '@react-querybuilder/ts';
import type { ReactElement } from 'react';

export interface RuleGroupDndProps {
  disabled: boolean;
  parentDisabled: boolean;
  path: number[];
  moveRule: QueryActions['moveRule'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
  children: ReactElement<RuleGroupProps>;
}

export interface RuleDndProps {
  moveRule: QueryActions['moveRule'];
  disabled: boolean;
  parentDisabled: boolean;
  path: number[];
  independentCombinators: boolean;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
  children: ReactElement<RuleProps>;
}

export interface InlineCombinatorDndProps extends InlineCombinatorProps {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop: typeof import('react-dnd')['useDrop'];
}

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
export type UseReactDnD = typeof import('react-dnd') & typeof import('react-dnd-html5-backend');

export type QueryBuilderDndProps = QueryBuilderContextProviderProps & {
  /**
   * Provide this prop if `enableDragAndDrop` is `true` for the child element and
   * you want the component to render immediately with drag-and-drop enabled.
   * Otherwise, the component will asynchronously load `react-dnd` and
   * `react-dnd-html5-backend` and drag-and-drop features will only be enabled
   * once those packages have loaded.
   */
  dnd?: UseReactDnD;
  /**
   * Dragged rules/groups will be moved immediately to the location over which
   * they are hovered instead of waiting to be dropped.
   */
  moveWhileDragging?: boolean;
};

export type QueryBuilderDndContextProps = {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag?: typeof import('react-dnd')['useDrag'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrop?: typeof import('react-dnd')['useDrop'];
  baseControls: Pick<Controls, 'rule' | 'ruleGroup' | 'combinatorSelector'>;
  moveWhileDragging?: boolean;
};
