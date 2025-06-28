---
title: Rule
description: Layout and config component for rules
---

The `Rule` component represents query conditions. `Rule` calls the [`useRule`](../utils/hooks#userule) hook to prepare the subcomponent props.

## Subcomponents

Subcomponents are rendered by `RuleComponents` by default. If the `matchModes` property of a rule's `field` evaluates to an array with one or more elements, then `RuleComponentsWithSubQuery` is used instead.

### `RuleComponents`

Renders a `React.Fragment` containing components in this order:

- Shift actions[^1]
- Drag handle[^2]
- Field selector
- Operator selector[^3]
- Value source selector[^4] [^5]
- Value editor[^5]
- Clone rule button[^6]
- Lock rule button[^7]
- Remove rule button

### `RuleComponentsWithSubQuery`

Renders a `React.Fragment` containing components in this order:

- Shift actions[^1]
- Drag handle[^2]
- Field selector
- Match mode editor
- Rule group header components[^8]
- Clone rule button[^6]
- Lock rule button[^7]
- Remove rule button
- Rule group body components[^8]

[^1]: Only rendered if [`showShiftActions`](./querybuilder#showshiftactions) is `true`.

[^2]: Only rendered if [`enableDragAndDrop`](./querybuilder#enabledraganddrop) is `true`.

[^3]: Only rendered if [`autoSelectField`](./querybuilder#autoselectfield) is `true` or the rule's `field` doesn't match `translations.fields.placeholderName`.

[^4]: Only rendered if the rule's `operator` is neither `"null"` nor `"notNull"` and the derived `valueSources` array has more than one element.

[^5]: Only rendered when all of these conditions are met:<ul><li>The `arity` property of the rule's `operator` is not `"unary"` and is not a number less than `2`</li><li>[`autoSelectOperator`](./querybuilder#autoselectoperator) is `true` _or_ the rule's `operator` doesn't match `translations.operators.placeholderName`</li></ul>

[^6]: Only rendered if [`showCloneButtons`](./querybuilder#showclonebuttons) is `true`.

[^7]: Only rendered if [`showLockButtons`](./querybuilder#showlockbuttons) is `true`.

[^8]: The wrapper element around these components is a `<div>` by default. Customize it with the `groupComponentsWrapper` prop.
