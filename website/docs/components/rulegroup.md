---
title: RuleGroup
description: Recursive layout and config component for groups
---

The `RuleGroup` component renders the recursive, hierarchical query structure of React Query Builder. It calls the [`useRuleGroup`](../utils/hooks#userulegroup) hook to prepare props for its subcomponents.

## Subcomponents

`RuleGroup` renders an outer `<div>` containing two inner `<div>`s: the first with [header elements](#rulegroupheadercomponents) (based on group properties) and the second with [body elements](#rulegroupbodycomponents) (derived primarily from the group's `rules` array).

:::tip

The header and body layout components are HTML-agnostic. This allows `@react-querybuilder/native` to render the same layout components within React Native `<View>` elements, and you can adapt them similarly for other frameworks.

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

This component iterates through a group's `rules` array, rendering a child `RuleGroup` element for each subgroup and a [`Rule`](./rule) element for each rule.

When [`showCombinatorsBetweenRules`](./querybuilder#showcombinatorsbetweenrules) is `true`, an inline combinator[^8] (using the group's `combinator` value) appears before each rule or group except the first.

With [independent combinators](./querybuilder#independent-combinators), each odd-numbered index in the `rules` array contains a string representing a combinator value. These elements render as independent inline combinators.

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
