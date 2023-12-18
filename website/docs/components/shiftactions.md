---
title: ShiftActions
description: Shift up/down buttons
---

Renders a `<div>` containing two `<button>` elements, stacked vertically when using the [default styles](../styling/overview). When the [`showShiftActions`](./querybuilder#showshiftactions) prop is `true`, these two buttons will appear at the front of each rule and subgroup. The first button will shift the rule/group above the preceding rule or into the preceding group as the last member, while the second button will shift the rule/group below the next rule or into the next group as the first member.

For example, if a subgroup is immediately below a rule, shifting the rule down will make it the first element of that subgroup instead of moving it below the subgroup.
