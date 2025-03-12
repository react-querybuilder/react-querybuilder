---
title: Limit rule groups
description: Methods to prevent new groups
hide_table_of_contents: true
---

import { BrowserWindow } from '@site/src/components/BrowserWindow';
import { QueryBuilderEmbed } from '@site/src/components/QueryBuilderEmbed';
import { ActionElement } from 'react-querybuilder';

Some query builder implementations are required to maintain a flat, rule-only hierarchy, or perhaps allow group creation only under certain conditions like one level deep. There are several ways to meet these requirements.

## Prevent creation of new groups

The simplest way to prevent creation of new groups is to unconditionally hide the "+Group" button. Returning `null` from a custom `addGroupAction` function component is one way to accomplish this.

```tsx
<QueryBuilder
  fields={fields}
  query={query}
  onQueryChange={q => setQuery(q)}
  controlElements={{
    // highlight-start
    addGroupAction: () => null,
    // highlight-end
  }}
/>
```

To hide the "+Group" button with CSS, use the `ruleGroup-addGroup` class which is assigned to the button by default:

```css
.ruleGroup-addGroup {
  display: none;
}
```

Either of those methods will generate a query builder like this:

<BrowserWindow>
  <QueryBuilderEmbed version={4} controlElements={{ addGroupAction: () => null }} />
</BrowserWindow>

## Conditionally allow new groups

To show the "+Group" button at the top level, but hide it in sub-groups, spread the `props` object into the standard `ActionElement` component and return that if the `level` prop is zero; otherwise return `null` as before:

```tsx
<QueryBuilder
  fields={fields}
  query={query}
  onQueryChange={q => setQuery(q)}
  controlElements={{
    // highlight-start
    addGroupAction: props => (props.level === 0 ? <ActionElement {...props} /> : null),
    // highlight-end
  }}
/>
```

And the CSS method for the same effect:

```css
.ruleGroup .ruleGroup .ruleGroup-addGroup {
  display: none;
}
```

Either of those methods will generate a query builder like this:

<BrowserWindow>
  <QueryBuilderEmbed
    version={4}
    defaultQuery={{
      combinator: 'and',
      rules: [
        { combinator: 'and', rules: [] },
        { combinator: 'and', rules: [] },
      ],
    }}
    controlElements={{
      addGroupAction: props => (props.level === 0 ? <ActionElement {...props} /> : null),
    }}
  />
</BrowserWindow>

## Other methods

Another option for preventing the addition of new groups is to return `false` from the `onAddGroup` callback.

:::caution

On its own, this configuration may be a little confusing to the user since they would be able to click a "+Group" button but nothing would happen. Probably best to combine this method with other information and behaviors that would help the user understand what's going on.

:::

```tsx
<QueryBuilder
  fields={fields}
  query={query}
  onQueryChange={q => setQuery(q)}
  // highlight-start
  onAddGroup={() => false}
  // highlight-end
/>
```
