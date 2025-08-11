---
title: RuleGroup
description: Recursive layout and config component for groups
---

The `RuleGroup` component allows React Query Builder to visually represent its recursive, hierarchical query structure. `RuleGroup` calls the [`useRuleGroup`](../utils/hooks#userulegroup) hook to prepare the subcomponent props.

## Subcomponents

`RuleGroup` renders an outer `<div>` and two inner `<div>`s, the first containing [header elements](#rulegroupheadercomponents) (derived from the group properties) and the second containing [body elements](#rulegroupbodycomponents) (derived primarily from a map of the group's `rules` array).

:::tip

The header and body layout components themselves don't rely on HTML elements like `<div>`. This allows `@react-querybuilder/native`, for example, to render the same layout components within React Native `<View>` elements. Feel free to use them in the same way.

:::

### `RuleGroupHeaderComponents`

This component renders the following elements in this order:

- Shift actions[^1]
- Drag handle[^2]
- Combinator selector[^3]
- "Not" toggle[^4]
- Add rule button
- Add group button
- Clone group button[^5]
- Lock group button[^6]
- Remove group button[^7]

### `RuleGroupBodyComponents`

This component loops through a group's `rules` array and renders a child `RuleGroup` element for each group and a [`Rule`](./rule) element for each rule.

If [`showCombinatorsBetweenRules`](./querybuilder#showcombinatorsbetweenrules) is `true`, an inline combinator[^8] (whose `value` is the group's `combinator`) is rendered ahead of each rule or group except the first.

When the query is using [independent combinators](./querybuilder#independent-combinators), each odd-numbered index in the `rules` array is a `string` representing a combinator value. For those elements, an independent, inline combinator is rendered.

:::note

The `showCombinatorsBetweenRules` prop is ignored if the query is using independent combinators.

:::

[^1]: Only rendered if [`showShiftActions`](./querybuilder#showshiftactions) is `true`.

[^2]: Only rendered if [`enableDragAndDrop`](./querybuilder#enabledraganddrop) is `true`.

[^3]: Only rendered if [`showCombinatorsBetweenRules`](./querybuilder#showcombinatorsbetweenrules) is disabled and the query is not using [independent combinators](./querybuilder#independent-combinators).

[^4]: Only rendered if [`showNotToggle`](./querybuilder#shownottoggle) is `true`.

[^5]: Only rendered if [`showCloneButtons`](./querybuilder#showclonebuttons) is `true`.

[^6]: Only rendered if [`showLockButtons`](./querybuilder#showlockbuttons) is `true`.

[^7]: Only rendered if the group is not the query root.

[^8]: The [`inlineCombinator`](./querybuilder-controlelements#inlinecombinator) component in turn renders the configured [`combinatorSelector`](./querybuilder-controlelements#combinatorselector).
