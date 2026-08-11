// Type-only assertions guarding the vendored structural stand-ins in `./vendored` against upstream
// drift. This file has no runtime code; it exists to be typechecked. The library → RQB direction is
// the one that matters: consumers pass the real exports to the adapters, so the real types must
// remain assignable to the stand-ins.
import type { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import type {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type * as DndKit from '@dnd-kit/core';
import type * as ReactDnD from 'react-dnd';
import type { HTML5Backend } from 'react-dnd-html5-backend';
import type { TouchBackend } from 'react-dnd-touch-backend';
import type { DndProp, UseReactDnD } from './types';
import type {
  DndKitExports,
  PragmaticDndExports,
  RdndBackendFactory,
  ReactDnDExports,
} from './vendored';

// react-dnd
const _reactDnDExports: ReactDnDExports = {} as typeof ReactDnD;
const _useReactDnD: UseReactDnD = {} as typeof ReactDnD & { ReactDndBackend: typeof HTML5Backend };
const _dndProp: DndProp = {} as typeof ReactDnD & {
  HTML5Backend: typeof HTML5Backend;
  TouchBackend: typeof TouchBackend;
};
const _html5Backend: RdndBackendFactory = {} as typeof HTML5Backend;
const _touchBackend: RdndBackendFactory = {} as typeof TouchBackend;

// @dnd-kit/core
const _dndKitExports: DndKitExports = {} as typeof DndKit;

// @atlaskit/pragmatic-drag-and-drop
const _pragmaticDndExports: PragmaticDndExports = {} as {
  draggable: typeof draggable;
  dropTargetForElements: typeof dropTargetForElements;
  monitorForElements: typeof monitorForElements;
  combine: typeof combine;
};

export type _Unused = [
  typeof _reactDnDExports,
  typeof _useReactDnD,
  typeof _dndProp,
  typeof _html5Backend,
  typeof _touchBackend,
  typeof _dndKitExports,
  typeof _pragmaticDndExports,
];
