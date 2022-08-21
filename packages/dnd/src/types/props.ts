import type { ReactElement, Ref } from 'react';
import type {
  InlineCombinatorProps,
  QueryActions,
  QueryBuilderProps,
  RuleGroupProps,
  RuleProps,
} from 'react-querybuilder';

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

export interface DnD {
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  hooks: Pick<typeof import('react-dnd'), 'useDrag' | 'useDrop'>;
  rule: {
    isDragging: boolean;
    dragMonitorId: string | symbol | null;
    isOver: boolean;
    dropMonitorId: string | symbol | null;
    dragRef: Ref<HTMLSpanElement>;
    dndRef: Ref<HTMLDivElement>;
  };
  ruleGroup: {
    isDragging: boolean;
    dragMonitorId: string | symbol | null;
    isOver: boolean;
    dropMonitorId: string | symbol | null;
    previewRef: Ref<HTMLDivElement>;
    dragRef: Ref<HTMLSpanElement>;
    dropRef: Ref<HTMLDivElement>;
  };
}

export type QueryBuilderDndProps = {
  /**
   * Provide this prop if `enableDragAndDrop` is `true` for the child element and
   * you want the component to render immediately with drag-and-drop enabled.
   * Otherwise, the component will asynchronously load `react-dnd` and
   * `react-dnd-html5-backend` and drag-and-drop features will only be enabled
   * once those packages have loaded.
   */
  dnd?: UseReactDnD;
  children: ReactElement<QueryBuilderProps<any>>;
};
