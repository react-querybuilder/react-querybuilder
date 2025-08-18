/**
 * DnD Library Abstraction Types
 *
 * These types provide a common interface for different drag-and-drop libraries
 * while maintaining compatibility with the existing react-querybuilder API.
 */

import * as React from 'react';
import type { Path, RuleGroupTypeAny } from 'react-querybuilder';

export interface DragCollection {
  isDragging: boolean;
  dragMonitorId: string | symbol;
}

export interface DropCollection {
  isOver: boolean;
  dropMonitorId: string | symbol;
  dropEffect?: 'copy' | 'move';
  groupItems?: boolean;
}

export interface DraggedItem {
  type: 'rule' | 'ruleGroup';
  path: Path;
  qbId: string;
  // field?: string;
  // operator?: string;
  // value?: any;
  // [key: string]: any;
}

export interface DropResult {
  type: 'rule' | 'ruleGroup' | 'inlineCombinator';
  path: Path;
  qbId: string;
  getQuery: () => RuleGroupTypeAny;
  dispatchQuery: (query: RuleGroupTypeAny) => void;
  groupItems?: boolean;
  dropEffect?: 'copy' | 'move';
}

export interface DragHookResult {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  dragRef: React.Ref<HTMLElement>; // (element: React.Ref<HTMLElement>) => void;
  previewRef: React.Ref<HTMLElement>; // (element: React.Ref<HTMLElement>) => void;
}

export interface DropHookResult {
  isOver: boolean;
  dropMonitorId: string | symbol;
  dropEffect?: 'copy' | 'move';
  groupItems?: boolean;
  dropRef: React.Ref<HTMLElement>; // (element: React.Ref<HTMLElement>) => void;
}

export interface DragHookOptions {
  type: string;
  item: () => DraggedItem;
  canDrag?: boolean;
  end?: (item: DraggedItem, result: DropResult | null) => void;
  modifierKeys?: {
    copyModeKey?: string;
    groupModeKey?: string;
  };
}

export interface DropHookOptions {
  accept: string[];
  canDrop?: (item: DraggedItem) => boolean;
  drop?: () => DropResult;
  modifierKeys?: {
    copyModeKey?: string;
    groupModeKey?: string;
  };
}

export interface DndProviderProps {
  backend?: unknown;
  debugMode?: boolean;
  children: React.ReactNode;
}

export interface DndAdapter {
  useDrag: (options: DragHookOptions) => DragHookResult;
  useDrop: (options: DropHookOptions) => DropHookResult;
  DndProvider: React.ComponentType<DndProviderProps>;
  isTouchDevice?: () => boolean;
  getDefaultBackend?: () => unknown;
  initialize?: () => Promise<void>;
}

export interface DndConfig {
  adapter: DndAdapter;
  backend?: unknown;
  debugMode?: boolean;
  modifierKeys?: {
    copyModeKey?: string;
    groupModeKey?: string;
  };
}

export interface QueryBuilderDndCoreProps {
  dnd?: DndConfig;
  enableDragAndDrop?: boolean;
  canDrop?: (item: DraggedItem, target: DropResult) => boolean;
}
