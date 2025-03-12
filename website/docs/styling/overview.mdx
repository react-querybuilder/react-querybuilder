---
title: Styling overview
description: How to tweak or overhaul the default styles
---

import { BrowserWindow } from '@site/src/components/BrowserWindow';
import { DemoLink } from '@site/src/components/DemoLink';
import { QueryBuilderEmbed } from '@site/src/components/QueryBuilderEmbed';
import TabItem from '@theme/TabItem';
import Tabs from '@theme/Tabs';

React Query Builder has a [flexible structure with specific classes assigned](./classnames) to each element in the component hierarchy, enabling a wide range of styling possibilities.

:::tip

Check out the [customization showcase](../tips/showcase) for a variety of styling tips.

:::

The default stylesheet comes in CSS and SCSS flavors. Either will allow you to override the default values and tweak styles without having to replicate the entire rule set.

To load only the default layout/structural values (`flex-direction`, `gap`, alignment, etc.—without `background-color`, `border-style`, or other decorative styles), import `query-builder-layout.css` (or `.scss`) instead.

<Tabs groupId="css-vs-scss">
  <TabItem value="css" label="CSS">

    ```css
    @import 'react-querybuilder/dist/query-builder.css';
    /* OR, for layout only: */
    @import 'react-querybuilder/dist/query-builder-layout.css';
    ```

  </TabItem>
  <TabItem value="scss" label="SCSS">

    ```scss
    @use 'react-querybuilder/dist/query-builder.scss';
    // OR, for layout only:
    @use 'react-querybuilder/dist/query-builder-layout.scss';
    ```

  </TabItem>
</Tabs>

## CSS variables

Customize the default stylesheet by overriding the CSS (or SCSS) variables.

:::info

CSS variables were introduced to React Query Builder in **v8.3.0** and [SCSS variables](#scss-variables) have been available since **v4.0.0**. Both methods will be supported going forward.

:::

The default variables include:

<Tabs groupId="css-vs-scss">
  <TabItem value="css" label="CSS">

    ```css
    :root {
      --rqb-spacing: 0.5rem;
      --rqb-border-width: 1px;
      --rqb-background-color: #004bb733;
      --rqb-border-color: #8081a2;
      --rqb-border-style: solid;
      --rqb-border-radius: 0.25rem;
    }
    ```

  </TabItem>
  <TabItem value="scss" label="SCSS">

    ```scss
    $rqb-spacing: 0.5rem;
    $rqb-border-width: 1px;
    $rqb-background-color: #004bb733;
    $rqb-border-color: #8081a2;
    $rqb-border-style: solid;
    $rqb-border-radius: 0.25rem;
    ```

  </TabItem>
</Tabs>

Example:

<Tabs groupId="css-vs-scss">
  <TabItem value="css" label="CSS">

    ```css
    @import 'react-querybuilder/dist/query-builder.css';

    :root {
      --rqb-spacing: 0.8rem; /* a little roomier than the default 0.5rem */
      --rqb-background-color: #ccc3; /* gray, semi-transparent background */
    }
    ```

  </TabItem>
  <TabItem value="scss" label="SCSS">

    ```scss
    @use 'react-querybuilder/dist/query-builder' with (
      $rqb-spacing: 0.8rem, /* a little roomier than the default 0.5rem */
      $rqb-background-color: #ccc3 /* gray, semi-transparent background */
    );
    ```

  </TabItem>
</Tabs>

### SCSS variables

SCSS variables begin with `$` instead of `--`, but otherwise have the same name as their CSS counterpart (e.g., `$rqb-spacing` corresponds to `--rqb-spacing`).

Using SCSS has the advantage of allowing you to customize the CSS variable prefix (`rqb-` by default) by setting `$rqb-var-prefix`.

```scss
@use 'react-querybuilder/dist/query-builder' with (
  $rqb-var-prefix: myprefix-,
  $rqb-spacing: 0.8rem
);

:root {
  --myprefix-background-color: #ccc3;
}
```

## Branch lines

To add branch lines to the left side of rule groups, add the `queryBuilder-branches` class to the query builder using the [`controlClassnames` prop](../components/querybuilder#controlclassnames), or to any ancestor element.

```tsx
<QueryBuilder
  // highlight-start
  controlClassnames={{ queryBuilder: 'queryBuilder-branches' }}
  // highlight-end
/>
```

export const fields = [
  { name: 'firstName', label: 'First name' },
  { name: 'lastName', label: 'Last name' },
];

<BrowserWindow>
  <QueryBuilderEmbed
    fields={fields}
    controlClassnames={{ queryBuilder: ['queryBuilder-branches', 'red-branch-lines'] }}
    defaultQuery={{
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
        {
          combinator: 'or',
          rules: [
            { field: 'lastName', operator: '=', value: 'Vai' },
            { field: 'lastName', operator: '=', value: 'Vaughan' },
          ],
        },
      ],
    }}
  />
</BrowserWindow>

The branch lines are colored <span style={{ color: 'red' }}>red</span> in the example above to stand out, but by default, branch lines use the same color, width, and style as the group borders. The following variables can be overridden to customize the branch lines.

<Tabs groupId="css-vs-scss">
  <TabItem value="css" label="CSS">

    ```css
    :root {
      --rqb-branch-indent: var(--rqb-spacing);
      --rqb-branch-width: var(--rqb-border-width);
      --rqb-branch-color: var(--rqb-border-color);
      --rqb-branch-radius: var(--rqb-border-radius);
      --rqb-branch-style: var(--rqb-border-style);
    }
    ```

  </TabItem>
  <TabItem value="scss" label="SCSS">

    ```scss
    $rqb-branch-indent: $rqb-spacing;
    $rqb-branch-width: $rqb-border-width;
    $rqb-branch-color: $rqb-border-color;
    $rqb-branch-radius: $rqb-border-radius;
    $rqb-branch-style: $rqb-border-style;
    ```

  </TabItem>
</Tabs>

## Drag-and-drop

When [drag-and-drop is enabled](../dnd), the following variables control styles for the dragged and hovered elements.

<Tabs groupId="css-vs-scss">
  <TabItem value="css" label="CSS">

    ```css
    :root {
      --rqb-dnd-drop-indicator-color: rebeccapurple;
      --rqb-dnd-drop-indicator-copy-color: #669933;
      --rqb-dnd-drop-indicator-style: dashed;
      --rqb-dnd-drop-indicator-width: 2px;
    }
    ```

  </TabItem>
  <TabItem value="scss" label="SCSS">

    ```scss
    $rqb-dnd-drop-indicator-color: rebeccapurple;
    $rqb-dnd-drop-indicator-copy-color: #669933;
    $rqb-dnd-drop-indicator-style: dashed;
    $rqb-dnd-drop-indicator-width: 2px;

    // Deprecated variable names (still work)
    // $rqb-dnd-hover-border-bottom-color: rebeccapurple;
    // $rqb-dnd-hover-copy-border-bottom-color: #669933;
    // $rqb-dnd-hover-border-bottom-style: dashed;
    // $rqb-dnd-hover-border-bottom-width: 2px;
    ```

  </TabItem>
</Tabs>

You can also assign styles to the following classes.

- `dndDragging`: Assigned to the clone of the dragged element (the "ghost" that follows the mouse cursor)
- `dndOver`: Assigned to a drop target when the cursor hovers over it
- `dndCopy`: Assigned to a drop target when the cursor hovers over it while the "copy" modifier key is pressed (<kbd>Alt</kbd> on Windows/Linux, <kbd>Option</kbd>/<kbd>⌥</kbd> on macOS; see [Drag-and-drop § Cloning and grouping](../dnd#cloning-and-grouping) for more information)
- `dndGroup`: Assigned to a drop target when the cursor hovers over it while the "group" modifier key is pressed (<kbd>Ctrl</kbd>; see [Drag-and-drop § Cloning and grouping](../dnd#cloning-and-grouping) for more information)
