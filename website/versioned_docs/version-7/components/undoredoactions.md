---
title: UndoRedoActions
description: Undo/redo buttons
---

Renders a `<div>` containing two buttons—"undo" and "redo"—in the header of the outermost group when [`showUndoRedo`](./querybuilder#showundoredo) is `true`.

The buttons themselves are rendered with the [`actionElement`](./querybuilder-controlelements#actionelement) control element, so they inherit the same styling and behavior as every other action button, including replacements provided by the [compatibility packages](../compat).

:::info

You generally won't import or configure this component directly—rendering `QueryBuilderHistory` supplies it automatically:

```tsx
import { QueryBuilder } from 'react-querybuilder';
import { QueryBuilderHistory } from 'react-querybuilder/history';

<QueryBuilderHistory>
  <QueryBuilder fields={fields} showUndoRedo />
</QueryBuilderHistory>;
```

See [Undo/redo](../tips/undo-redo) for the full guide.

:::

To use it without `QueryBuilderHistory`, assign it to the [`undoRedoActions`](./querybuilder-controlelements#undoredoactions) control element yourself. It registers its own history recording, so no provider is required. The buttons still occupy the same slot in the outermost group's header:

```tsx
import { UndoRedoActions } from 'react-querybuilder/history';

<QueryBuilder
  fields={fields}
  showUndoRedo
  controlElements={{ undoRedoActions: UndoRedoActions }}
/>;
```

To place undo/redo controls anywhere else—a toolbar above the query builder, for example—build your own with the [`useQueryBuilderHistory`](../tips/undo-redo#usequerybuilderhistory) hook instead.

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
