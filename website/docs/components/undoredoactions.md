---
title: UndoRedoActions
description: Undo/redo buttons
---

Renders a `<div>` containing two buttons—"undo" and "redo"—in the header of the outermost group when [`showUndoRedo`](./querybuilder#showundoredo) is `true`.

The buttons themselves are rendered with the [`actionElement`](./querybuilder-controlelements#actionelement) control element, so they inherit the same styling and behavior as every other action button, including replacements provided by the [compatibility packages](../compat).

Available from the `react-querybuilder/history` entry point:

```ts
import { UndoRedoActions } from 'react-querybuilder/history';
```

:::info

You generally won't render or configure this component directly. `QueryBuilderHistory` supplies it automatically. See [Undo/redo](../tips/undo-redo) for the full guide.

:::

## Behavior

- The "undo" button is disabled when there is nothing to undo, and likewise for "redo".
- Both buttons are disabled when the query builder is [`disabled`](./querybuilder#disabled).
- Rendering this component is what opts its query builder in to history recording, since it calls [`useQueryBuilderHistory`](../tips/undo-redo#usequerybuilderhistory) with the query builder's `qbId`. A query builder that never renders undo/redo controls (and never uses the hook) retains no history.

## Labels and titles

Configure the button text and tooltips with the [`translations`](./querybuilder#translations) prop:

```tsx
<QueryBuilder
  showUndoRedo
  translations={{
    undo: { label: 'Undo', title: 'Undo the last change' },
    redo: { label: 'Redo', title: 'Redo the last undone change' },
  }}
/>
```

The default labels are `"↶"` (U+21B6) and `"↷"` (U+21B7). These glyphs do not mirror automatically in right-to-left layouts, so swap them in your translations if appropriate.

## Classnames

| Classname               | Applied to            |
| ----------------------- | --------------------- |
| `.undoRedoActions`      | The container `<div>` |
| `.undoRedoActions-undo` | The "undo" button     |
| `.undoRedoActions-redo` | The "redo" button     |

Each button also receives the `controlClassnames.actionElement` classname, like every other action button.
