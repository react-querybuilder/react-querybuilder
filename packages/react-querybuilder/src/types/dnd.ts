import type { Path } from './basic';

export type DndDropTargetType = 'rule' | 'ruleGroup' | 'inlineCombinator';

export interface DraggedItem {
  path: Path;
}

export type DropEffect = 'move' | 'copy';

export interface DropResult {
  path: Path;
  type: DndDropTargetType;
  dropEffect?: DropEffect;
}
export interface DragCollection {
  isDragging: boolean;
  dragMonitorId: string | symbol;
}
export interface DropCollection {
  isOver: boolean;
  dropMonitorId: string | symbol;
  dropEffect?: DropEffect;
}
