---
title: Drag-and-drop
---

import { DemoLink } from '@site/src/components/DemoLink';

The [`@react-querybuilder/dnd`](https://www.npmjs.com/package/@react-querybuilder/dnd) package augments React Query Builder with drag-and-drop functionality. <DemoLink option="enableDragAndDrop" />.

## Usage

To enable drag-and-drop on a query builder, install [`react-dnd`](https://www.npmjs.com/package/react-dnd) and [`react-dnd-html5-backend`](https://www.npmjs.com/package/react-dnd-html5-backend) and render the `QueryBuilderDnD` context provider somewhere higher in the component tree than `QueryBuilder`.

> _**Note:** The [`enableDragAndDrop`](./components/querybuilder#enabledraganddrop) prop does not need to be set directly on the [`QueryBuilder`](./components/querybuilder) component unless it is explicitly `false` to override the implicit `true` value set by `QueryBuilderDnD`._

When the `enableDragAndDrop` prop is `true`, a [drag handle](./components/draghandle) is displayed on the left-hand side of each rule and each group header. Clicking and dragging the handle element allows users to visually reorder the rules and groups.

```bash npm2yarn
npm i react-querybuilder @react-querybuilder/dnd react-dnd react-dnd-html5-backend
```

```tsx
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import { QueryBuilder } from 'react-querybuilder';

const App = () => (
  <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
    <QueryBuilder />
  </QueryBuilderDnD>
);
```

## Styling

Special styles are applied by the default stylesheet during drag-and-drop operations to help anticipate the result of the impending drop. For more information, see [Styling overview § Drag-and-drop](./styling/overview#drag-and-drop).

## Cloning and grouping

By default, as successful drag-and-drop action will move a rule or group to a new location within the query builder, but there are also three alternative behaviors:

- **Clone**: Hold down the <kbd>Alt</kbd> key (<kbd>Option</kbd>/<kbd>⌥</kbd> on macOS) before and during the drag to clone the dragged rule/group instead of moving it. The original object will be left in place and the clone will be inserted at the drop location.
- **Group**: Hold down the <kbd>Ctrl</kbd> key before and during the drag to create a new group at the drop location. The `rules` array of the new group will contain the rule or group originally at the drop location and the dragged rule/group, in that order. (This operation is similar to how new folders are created on iOS by dragging one app icon on top of another.)
- **Clone into group**: Hold down the <kbd>Alt</kbd>/<kbd>⌥</kbd> _and_ <kbd>Ctrl</kbd> keys before and during the drag to create a new group at the drop location, but clone the dragged rule/group into the new group instead of moving it.

The keys that determine alternate behaviors are configurable. See [`copyModeModifierKey`](#copymodemodifierkey) and [`groupModeModifierKey`](#groupmodemodifierkey).

## Existing drag-and-drop contexts

If your application already uses [`react-dnd`](https://react-dnd.github.io/react-dnd/), use `QueryBuilderDndWithoutProvider` instead of `QueryBuilderDnD`. They are functionally equivalent, but the former assumes a `<DndProvider />` already exists higher up in the component tree. The latter renders its own `DndProvider` which will conflict with any pre-existing ones. (If you use the wrong component, you will probably see the error message "Cannot have two HTML5 backends at the same time" in the console.)

## Props

The following props are accepted on the `QueryBuilderDnD` and `QueryBuilderDndWithoutProvider` components.

### `dnd`

`typeof import('react-dnd') & typeof import('react-dnd-html5-backend')`

Provide this prop if you want the query builder to render immediately with drag-and-drop enabled. Otherwise, the component will asynchronously load `react-dnd` and `react-dnd-html5-backend`. Drag-and-drop features will only be enabled once those packages have loaded.

### `canDrop`

`(params: { dragging: RuleGroupTypeAny, hovering: RuleGroupTypeAny, groupItems?: boolean }) => boolean`

This function determines whether a "drop" at the current hover location is valid during a drag operation. The `dragging` and `hovering` properties represent the dragged rule/group and the rule/group that is currently hovered over, respectively. Each of those properties includes the object's original `path` and `qbId`. `groupItems` is `true` if the [`groupModeModifierKey`](#groupmodemodifierkey) is currently pressed.

### `copyModeModifierKey`

`string`

Key code for the modifier key that puts a drag-and-drop action in ["copy" mode](#cloning-and-grouping). Default is `"alt"` (<kbd>Alt</kbd> on Windows and Linux, <kbd>Option</kbd>/<kbd>⌥</kbd> on macOS).

### `groupModeModifierKey`

`string`

Key code for the modifier key that puts a drag-and-drop action in ["group" mode](#cloning-and-grouping). Default is `"ctrl"` (<kbd>Ctrl</kbd>).
