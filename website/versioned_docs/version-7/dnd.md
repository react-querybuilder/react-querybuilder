---
title: Drag-and-drop
---

import { DemoLink } from '@site/src/components/DemoLink';

The [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd) package augments React Query Builder with drag-and-drop functionality. <DemoLink option="enableDragAndDrop" />.

## Usage

To enable drag-and-drop on a query builder, install [`react-dnd`](https://www.npmjs.com/package/react-dnd) and either [`react-dnd-html5-backend`](https://www.npmjs.com/package/react-dnd-html5-backend) or [`react-dnd-touch-backend`](https://www.npmjs.com/package/react-dnd-touch-backend) (or both), then render the `QueryBuilderDnD` context provider higher in the component tree than `QueryBuilder`.

> _**Note:** The [`enableDragAndDrop`](./components/querybuilder#enabledraganddrop) prop doesn't need to be set directly on the [`QueryBuilder`](./components/querybuilder) component unless it's explicitly `false` to override the implicit `true` value set by `QueryBuilderDnD`._

When the `enableDragAndDrop` prop is `true`, a [drag handle](./components/draghandle) appears on the left side of each rule and group header. Clicking and dragging the handle element allows users to visually reorder rules and groups.

```bash npm2yarn
npm i react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend react-dnd-touch-backend
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import * as ReactDndTouchBackend from 'react-dnd-touch-backend';
import { QueryBuilder } from 'react-querybuilder';

const App = () => (
  <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend, ...ReactDndTouchBackend }}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

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

## Props

The following props are accepted on the `QueryBuilderDnD` and `QueryBuilderDndWithoutProvider` components.

### `dnd`

`typeof import('react-dnd') & { ReactDndBackend?: BackendFactory; HTML5Backend?: BackendFactory; TouchBackend?: BackendFactory; }`

Provide this prop if you want the query builder to render immediately with drag-and-drop enabled. Otherwise, the component asynchronously loads `react-dnd`, `react-dnd-html5-backend`, and `react-dnd-touch-backend`. Drag-and-drop features are only enabled once those packages have loaded.

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

### `noDragPreview`

`boolean`

When `true`, disables the default browser drag preview during drag operations. This is useful when implementing custom drag layers or custom drag preview components ([see relevant React DnD documentation](https://react-dnd.github.io/react-dnd/examples/drag-around/custom-drag-layer)). Default is `false`.
