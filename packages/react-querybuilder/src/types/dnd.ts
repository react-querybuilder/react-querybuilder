import type { Path } from './basic';
import type { RuleType } from './ruleGroups';
import type { RuleGroupTypeAny } from './ruleGroupsIC';

export type DndDropTargetType = 'rule' | 'ruleGroup' | 'inlineCombinator';

export type DraggedItem =
  | (RuleType & { path: Path; qbId: string })
  | (RuleGroupTypeAny & { path: Path; qbId: string });

export type DropEffect = 'move' | 'copy';

export interface DropResult {
  path: Path;
  type: DndDropTargetType;
  dropEffect?: DropEffect;
  groupItems?: boolean;
  qbId: string;
  getQuery: () => RuleGroupTypeAny;
  dispatchQuery: (query: RuleGroupTypeAny) => void;
}
export interface DragCollection {
  isDragging: boolean;
  dragMonitorId: string | symbol;
}
export interface DropCollection {
  dropNotAllowed: boolean;
  isOver: boolean;
  dropMonitorId: string | symbol;
  dropEffect?: DropEffect;
  groupItems?: boolean;
}
