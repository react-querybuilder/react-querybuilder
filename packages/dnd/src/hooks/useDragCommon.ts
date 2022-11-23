import type {
  DndDropTargetType,
  DragCollection,
  DraggedItem,
  DropResult,
  QueryActions,
} from '@react-querybuilder/ts';
import { getParentPath } from 'react-querybuilder';

type UseDragCommonProps = {
  path: number[];
  type: DndDropTargetType;
  disabled?: boolean;
  independentCombinators?: boolean;
  moveRule: QueryActions['moveRule'];
  // eslint-disable-next-line @typescript-eslint/consistent-type-imports
  useDrag: typeof import('react-dnd')['useDrag'];
};

export const useDragCommon = ({
  type,
  path,
  disabled,
  moveRule,
  // Unused for now
  // independentCombinators,
  useDrag,
}: UseDragCommonProps) =>
  useDrag<DraggedItem, DropResult, DragCollection>(
    () => ({
      type,
      item: { path },
      canDrag: !disabled,
      collect: monitor => ({
        isDragging: !disabled && monitor.isDragging(),
        dragMonitorId: monitor.getHandlerId() ?? '',
      }),
      end(item, monitor) {
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

        moveRule(item.path, destinationPath, dropResult.dropEffect === 'copy');
      },
    }),
    [disabled, path]
  );
