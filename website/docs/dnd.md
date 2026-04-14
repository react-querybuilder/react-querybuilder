---
title: Drag-and-drop
---

import { DemoLink } from '@site/src/components/DemoLink';

The [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd) package augments React Query Builder with drag-and-drop functionality. <DemoLink option="enableDragAndDrop" />.

## Usage

To enable drag-and-drop on a query builder, render the `QueryBuilderDnD` context provider higher in the component tree than `QueryBuilder`.

The `@react-querybuilder/dnd` package supports multiple drag-and-drop libraries through an **adapter** pattern. Each adapter is available as a separate subpath import (e.g., `@react-querybuilder/dnd/react-dnd`), so only the adapter you use—and its corresponding library—needs to be installed.

> _**Note:** The [`enableDragAndDrop`](./components/querybuilder#enabledraganddrop) prop doesn't need to be set directly on the [`QueryBuilder`](./components/querybuilder) component unless it's explicitly `false` to override the implicit `true` value set by `QueryBuilderDnD`._

When the `enableDragAndDrop` prop is `true`, a [drag handle](./components/draghandle) appears on the left side of each rule and group header. Clicking and dragging the handle element allows users to visually reorder rules and groups.

### Using the `react-dnd` adapter

Install [`react-dnd`](https://www.npmjs.com/package/react-dnd) and either [`react-dnd-html5-backend`](https://www.npmjs.com/package/react-dnd-html5-backend) or [`react-dnd-touch-backend`](https://www.npmjs.com/package/react-dnd-touch-backend) (or both), then create an adapter with `createReactDnDAdapter`:

```bash npm2yarn
npm i react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend react-dnd-touch-backend
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createReactDnDAdapter } from '@react-querybuilder/dnd/react-dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import * as ReactDndTouchBackend from 'react-dnd-touch-backend';
import { QueryBuilder } from 'react-querybuilder';

const reactDnDAdapter = createReactDnDAdapter({
  ...ReactDnD,
  ...ReactDndHtml5Backend,
  ...ReactDndTouchBackend,
});

const App = () => (
  <QueryBuilderDnD dnd={reactDnDAdapter}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

:::tip Legacy API

For backward compatibility, you can still pass the raw `react-dnd` exports directly. They will be automatically wrapped in an adapter:

```tsx
<QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend, ...ReactDndTouchBackend }}>
  <QueryBuilder />
</QueryBuilderDnD>
```

:::

### Using the `@dnd-kit` adapter

Install [`@dnd-kit/core`](https://www.npmjs.com/package/@dnd-kit/core), then create an adapter with `createDndKitAdapter`:

```bash npm2yarn
npm i react-querybuilder @react-querybuilder/dnd @dnd-kit/core
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createDndKitAdapter } from '@react-querybuilder/dnd/dnd-kit';
import * as DndKit from '@dnd-kit/core';
import { QueryBuilder } from 'react-querybuilder';

const dndKitAdapter = createDndKitAdapter(DndKit);

const App = () => (
  <QueryBuilderDnD dnd={dndKitAdapter}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

The dnd-kit adapter uses `PointerSensor` and `KeyboardSensor` by default, with a 5px activation distance to prevent accidental drags. ARIA attributes are automatically applied to drag handles for accessibility.

### Using the `@atlaskit/pragmatic-drag-and-drop` adapter

Install [`@atlaskit/pragmatic-drag-and-drop`](https://www.npmjs.com/package/@atlaskit/pragmatic-drag-and-drop), then create an adapter with `createPragmaticDndAdapter`:

```bash npm2yarn
npm i react-querybuilder @react-querybuilder/dnd @atlaskit/pragmatic-drag-and-drop
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import { QueryBuilder } from 'react-querybuilder';

const pragmaticDndAdapter = createPragmaticDndAdapter({
  draggable,
  dropTargetForElements,
  monitorForElements,
  combine,
});

const App = () => (
  <QueryBuilderDnD dnd={pragmaticDndAdapter}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

Pragmatic drag and drop uses the native HTML5 drag-and-drop API under the hood, so it has zero runtime overhead when not dragging. Unlike `react-dnd`, it does not require a separate backend package.

### Zero-config (auto-loading)

If you omit the `dnd` prop, `QueryBuilderDnD` will asynchronously attempt to load `react-dnd`, `react-dnd-html5-backend`, and `react-dnd-touch-backend`. Drag-and-drop features are only enabled once those packages have loaded. This approach is convenient but provides less control over loading behavior.

## Styling

The default stylesheet applies special styles during drag-and-drop operations to help anticipate the result of the impending drop. For more information, see [Styling overview § Drag-and-drop](./styling/overview#drag-and-drop).

## Cloning and grouping

By default, a successful drag-and-drop action moves a rule or group to a new location within the query builder, but there are three alternative behaviors:

- **Clone**: Hold down the <kbd>Alt</kbd> key (<kbd>⌥ Option</kbd> on macOS) before and during the drag to clone the dragged rule/group instead of moving it. The original object remains in place and the clone is inserted at the drop location.
- **Group**: Hold down the <kbd>Ctrl</kbd> key before and during the drag to create a new group at the drop location. The new group's `rules` array contains the rule or group originally at the drop location and the dragged rule/group, in that order. (This operation is similar to how new folders are created on iOS by dragging one app icon on top of another.)
- **Clone into group**: Hold down the <kbd>Alt</kbd>/<kbd>⌥ Option</kbd> _and_ <kbd>Ctrl</kbd> keys before and during the drag to create a new group at the drop location and clone the dragged rule/group into the new group instead of moving it.

The keys that determine alternate behaviors are configurable. See [`copyModeModifierKey`](#copymodemodifierkey) and [`groupModeModifierKey`](#groupmodemodifierkey).

## Existing drag-and-drop contexts

If your application already uses [`react-dnd`](https://react-dnd.github.io/react-dnd/), use `QueryBuilderDndWithoutProvider` instead of `QueryBuilderDnD`. They are functionally equivalent, but the former assumes a `<DndProvider />` already exists higher in the component tree. The latter renders its own `DndProvider` which conflicts with any pre-existing ones. (If you use the wrong component, you'll probably see the error message "Cannot have two HTML5 backends at the same time" in the console.)

## Custom adapters

You can create a custom adapter for any drag-and-drop library by implementing the `DndAdapter` interface:

```tsx
import type { DndAdapter } from '@react-querybuilder/dnd';

const myAdapter: DndAdapter = {
  // Context provider wrapping the query builder tree
  DndProvider: ({ debugMode, children }) => <MyDndContext>{children}</MyDndContext>,

  // Hook providing drag-and-drop behavior for rule components
  useRuleDnD: params => {
    // Implement using your DnD library's primitives
    // Must return: isDragging, dragMonitorId, isOver, dropMonitorId, dragRef, dndRef, dropEffect?, groupItems?, dropNotAllowed?
  },

  // Hook providing drag-and-drop behavior for rule group components
  useRuleGroupDnD: params => {
    // Must return: isDragging, dragMonitorId, isOver, dropMonitorId, previewRef, dragRef, dropRef, dropEffect?, groupItems?, dropNotAllowed?
  },

  // Hook providing drop-target behavior for inline combinators
  useInlineCombinatorDnD: params => {
    // Must return: isOver, dropMonitorId, dropRef, dropEffect?, groupItems?, dropNotAllowed?
  },
};
```

The shared logic functions `canDropOnRule`, `canDropOnRuleGroup`, `canDropOnInlineCombinator`, `buildDropResult`, and `handleDrop` are exported from `@react-querybuilder/dnd` and can be used in custom adapter implementations to ensure consistent drop validation and behavior.

## Props

The following props are accepted on the `QueryBuilderDnD` and `QueryBuilderDndWithoutProvider` components.

### `dnd`

`DndAdapter | DndProp`

A `DndAdapter` (such as from `createReactDnDAdapter()`, `createDndKitAdapter()`, or `createPragmaticDndAdapter()`) or the raw `react-dnd` namespace exports (legacy API). When raw `react-dnd` exports are provided, they are automatically wrapped in a `react-dnd` adapter.

If omitted, the component asynchronously loads `react-dnd`, `react-dnd-html5-backend`, and `react-dnd-touch-backend`. Drag-and-drop features are only enabled once those packages have loaded.

When both backends are provided, the touch backend is preferred when a touch device is detected.

### `canDrop`

`(params: { dragging: RuleGroupTypeAny, hovering: RuleGroupTypeAny, groupItems?: boolean }) => boolean`

This function determines whether a "drop" at the current hover location is valid during a drag operation. The `dragging` and `hovering` properties represent the dragged rule/group and the currently hovered rule/group, respectively. Each property includes the object's original `path` and `qbId`. `groupItems` is `true` if the [`groupModeModifierKey`](#groupmodemodifierkey) is currently pressed.

### `copyModeModifierKey`

`string`

Key code for the modifier key that puts a drag-and-drop action in ["copy" mode](#cloning-and-grouping). Default is `"alt"` (<kbd>Alt</kbd> on Windows and Linux, <kbd>⌥ Option</kbd> on macOS).

### `groupModeModifierKey`

`string`

Key code for the modifier key that puts a drag-and-drop action in ["group" mode](#cloning-and-grouping). Default is `"ctrl"` (<kbd>Ctrl</kbd>).

### `hideDefaultDragPreview`

`boolean`

When `true`, disables the default browser drag preview during drag operations. This is useful when implementing custom drag layers or custom drag preview components ([see relevant React DnD documentation](https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer)). Default is `false`.

### `updateWhileDragging`

`boolean`

When `true`, the query tree visually rearranges in real-time as the user drags rules and groups, providing immediate spatial feedback instead of showing a drop indicator line. The actual `onQueryChange` callback only fires once when the item is dropped — intermediate positions are purely visual. If the drag is cancelled (e.g., by releasing outside a valid target), the query reverts to its original state.

Currently supported only by the `@atlaskit/pragmatic-drag-and-drop` adapter. Other adapters ignore this prop and fall back to the standard drop-indicator behavior.

When this feature is active:

- Rules and groups slide into their preview positions during drag
- The standard "drop indicator" line (`dndOver` class) is suppressed
- Inline combinator drop targets are disabled (quadrant detection on rules is used instead)
- Hovering in the upper half of a rule inserts the dragged item before it; the lower half inserts after

Default is `false`.

```tsx
<QueryBuilderDnD dnd={pragmaticDndAdapter} updateWhileDragging>
  <QueryBuilder />
</QueryBuilderDnD>
```

### `onDragMove`

`(params: { draggedItem, shadowQuery, originalQuery, previewPath }) => void`

Callback invoked on each drag position change when [`updateWhileDragging`](#updatewhiledragging) is `true`. Receives the current shadow query (the preview query with the dragged item at its prospective position), the original query, and the preview path.
