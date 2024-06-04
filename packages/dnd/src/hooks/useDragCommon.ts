import type {
  DndDropTargetType,
  DragCollection,
  DraggedItem,
  DropResult,
  Path,
  QueryActions,
  RuleGroupTypeAny,
  RuleType,
  Schema,
} from 'react-querybuilder';
import { getParentPath, insert } from 'react-querybuilder';

type UseDragCommonProps = {
  path: Path;
  ruleOrGroup: RuleType | RuleGroupTypeAny;
  type: DndDropTargetType;
  disabled?: boolean;
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  actions: QueryActions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Schema<any, any>;
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: (typeof import('react-dnd'))['useDrag'];
};

export const useDragCommon = ({
  type,
  path,
  ruleOrGroup,
  disabled,
  // Unused for now
  // independentCombinators,
  actions,
  schema,
  useDrag,
}: UseDragCommonProps) =>
  useDrag!<DraggedItem, DropResult, DragCollection>(
    () => ({
      type,
      item: { ...ruleOrGroup, path, qbId: schema.qbId },
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId() ?? '',
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();

        if (!dropResult) return;

        const parentHoverPath = getParentPath(dropResult.path);
        const hoverIndex = dropResult.path[dropResult.path.length - 1];
        const destinationPath =
          dropResult.type === 'ruleGroup'
            ? [...dropResult.path, 0]
            : dropResult.type === 'inlineCombinator'
              ? [...parentHoverPath, hoverIndex]
              : [...parentHoverPath, hoverIndex + 1];

        if (schema.qbId !== dropResult.qbId) {
          const otherBuilderQuery = dropResult.getQuery();
          // istanbul ignore else
          if (otherBuilderQuery) {
            dropResult.dispatchQuery(insert(otherBuilderQuery, item, destinationPath));
            // istanbul ignore else
            if (dropResult.dropEffect !== 'copy') {
              actions.onRuleRemove(item.path);
            }
          }
        } else {
          actions.moveRule(item.path, destinationPath, dropResult.dropEffect === 'copy');
        }
      },
    }),
    [disabled, path]
  );
