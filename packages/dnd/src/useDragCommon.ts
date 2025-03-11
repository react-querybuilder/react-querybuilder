import type { ConnectDragPreview, ConnectDragSource, useDrag as originalUseDrag } from 'react-dnd';
import type {
  DndDropTargetType,
  DragCollection,
  DraggedItem,
  DropResult,
  Path,
  QueryActions,
  Schema,
} from 'react-querybuilder';
import { add, findPath, getParentPath, group, insert } from 'react-querybuilder';

type UseDragCommonProps = {
  path: Path;
  type: DndDropTargetType;
  disabled?: boolean;
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  actions: QueryActions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  schema: Schema<any, any>;
  useDrag: typeof originalUseDrag;
};

/**
 * @group Hooks
 */
export const useDragCommon = ({
  type,
  path,
  disabled,
  // Unused for now
  // independentCombinators,
  actions,
  schema,
  useDrag,
}: UseDragCommonProps): [DragCollection, ConnectDragSource, ConnectDragPreview] =>
  useDrag!<DraggedItem, DropResult, DragCollection>(
    () => ({
      type,
      item: () => ({ ...findPath(path, schema.getQuery()!)!, path, qbId: schema.qbId }),
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId() ?? '',
      }),
      end: (item, monitor) => {
        const dropResult = monitor.getDropResult();

        if (!dropResult) return;

        const parentHoverPath = getParentPath(dropResult.path);
        const hoverIndex = dropResult.path.at(-1)!;
        const destinationPath = dropResult.groupItems
          ? dropResult.path
          : dropResult.type === 'ruleGroup'
            ? [...dropResult.path, 0]
            : dropResult.type === 'inlineCombinator'
              ? [...parentHoverPath, hoverIndex]
              : [...parentHoverPath, hoverIndex + 1];

        if (schema.qbId === dropResult.qbId) {
          if (dropResult.groupItems) {
            actions.groupRule(item.path, destinationPath, dropResult.dropEffect === 'copy');
          } else {
            actions.moveRule(item.path, destinationPath, dropResult.dropEffect === 'copy');
          }
        } else {
          const otherBuilderQuery = dropResult.getQuery();
          // istanbul ignore else
          if (otherBuilderQuery) {
            if (dropResult.groupItems) {
              dropResult.dispatchQuery(
                group(
                  add(otherBuilderQuery, item, []),
                  [otherBuilderQuery.rules.length],
                  destinationPath,
                  { clone: false }
                )
              );
            } else {
              dropResult.dispatchQuery(insert(otherBuilderQuery, item, destinationPath));
            }
            // istanbul ignore else
            if (dropResult.dropEffect !== 'copy') {
              actions.onRuleRemove(item.path);
            }
          }
        }
      },
    }),
    [disabled, path]
  );
