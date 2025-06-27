/**
 * DnD Library Abstraction Types
 * 
 * These types provide a common interface for different drag-and-drop libraries
 * while maintaining compatibility with the existing react-querybuilder API.
 */

export type DndLibrary = 'react-dnd' | '@hello-pangea/dnd' | '@dnd-kit/core' | '@atlaskit/pragmatic-drag-and-drop';

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
  path: number[];
  qbId: string;
  field?: string;
  operator?: string;
  value?: any;
  [key: string]: any;
}

export interface DropResult {
  type: 'rule' | 'ruleGroup' | 'inlineCombinator';
  path: number[];
  qbId: string;
  getQuery: () => any;
  dispatchQuery: (query: any) => void;
  groupItems?: boolean;
  dropEffect?: 'copy' | 'move';
}

export interface DragHookResult {
  isDragging: boolean;
  dragMonitorId: string | symbol;
  dragRef: (element: any) => void;
  previewRef: (element: any) => void;
}

export interface DropHookResult {
  isOver: boolean;
  dropMonitorId: string | symbol;
  dropEffect?: 'copy' | 'move';
  groupItems?: boolean;
  dropRef: (element: any) => void;
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
  backend?: any;
  debugMode?: boolean;
  children: React.ReactNode;
}

export interface DndAdapter {
  useDrag: (options: DragHookOptions) => DragHookResult;
  useDrop: (options: DropHookOptions) => DropHookResult;
  DndProvider: React.ComponentType<DndProviderProps>;
  isTouchDevice?: () => boolean;
  getDefaultBackend?: () => any;
}

export interface DndConfig {
  library: DndLibrary;
  adapter?: DndAdapter;
  backend?: any;
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