import type { ReactElement, Ref } from 'react';
import type {
  InlineCombinatorProps,
  QueryActions,
  QueryBuilderProps,
  RuleGroupProps,
  RuleGroupType,
  RuleGroupTypeIC,
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

// Attempt #1:
// export type QueryBuilderDndProps = Parameters<typeof QueryBuilder>[0] & {
//   /**
//    * For internal use only, unless `enableDragAndDrop` is `true` and you want the component
//    * to render immediately with drag-and-drop enabled. Otherwise, the component will
//    * asynchronously load react-dnd and enable the drag-and-drop feature only once that
//    * (along with react-dnd-html5-backend) has loaded.
//    */
//   dnd?: UseReactDnD;
// };

// Attempt #2:
// export type QueryBuilderDndProps<RG extends RuleGroupType | RuleGroupTypeIC> = Parameters<
//   typeof QueryBuilder<RG>
// >[0] & {
//   /**
//    * For internal use only, unless `enableDragAndDrop` is `true` and you want the component
//    * to render immediately with drag-and-drop enabled. Otherwise, the component will
//    * asynchronously load react-dnd and enable the drag-and-drop feature only once that
//    * (along with react-dnd-html5-backend) has loaded.
//    */
//   dnd?: UseReactDnD;
// };

// Attempt #3:
// type QueryBuilderDndPropsBase<RG extends RuleGroupType | RuleGroupTypeIC> = (RG extends {
//   combinator: string;
// }
//   ? {
//       independentCombinators?: false;
//     }
//   : {
//       /**
//        * Allows and/or configuration between rules
//        */
//       independentCombinators: true;
//     }) &
//   QueryBuilderProps<RG>;

// /**
//  * Props for the `<QueryBuilder />` component. Note that if `independentCombinators`
//  * is `true`, then `query` and `defaultQuery` must be of type `RuleGroupTypeIC`. Otherwise,
//  * they must be of type `RuleGroupType`. Only one of `query` or `defaultQuery` can be
//  * provided. If `query` is present, then `defaultQuery` must be undefined, and vice versa.
//  * If rendered initially with a `query` prop, then `query` must always be defined in every
//  * subsequent render or errors will be logged to the console (in "development" mode only).
//  */
// export type QueryBuilderDndProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> = (
//   | (QueryBuilderDndPropsBase<RG> & {
//       /**
//        * Initial query object for uncontrolled components
//        */
//       defaultQuery?: RG;
//       query?: never;
//     })
//   | (QueryBuilderDndPropsBase<RG> & {
//       defaultQuery?: never;
//       /**
//        * Query object for controlled components
//        */
//       query?: RG;
//     })
// ) & {
//   /**
//    * Provide this prop if `enableDragAndDrop` is `true` and you want the component to
//    * render immediately with drag-and-drop enabled. Otherwise, the component will
//    * asynchronously load react-dnd and react-dnd-html5-backend. Drag-and-drop
//    * features will be enabled once those packages have loaded.
//    */
//   dnd?: UseReactDnD;
// };

// Attempt #4:
export type QueryBuilderDndProps<RG extends RuleGroupType | RuleGroupTypeIC = RuleGroupType> =
  QueryBuilderProps<RG> & {
    /**
     * Provide this prop if `enableDragAndDrop` is `true` and you want the component to
     * render immediately with drag-and-drop enabled. Otherwise, the component will
     * asynchronously load react-dnd and react-dnd-html5-backend. Drag-and-drop
     * features will be enabled once those packages have loaded.
     */
    dnd?: UseReactDnD;
  };
