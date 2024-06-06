import type { Path } from './basic';
import type { Schema } from './propsUsingReact';
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
  qbId: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getQuery: Schema<any, any>['getQuery'];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dispatchQuery: Schema<any, any>['dispatchQuery'];
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
