---
title: Buildless
hide_table_of_contents: true
---

Use React Query Builder directly in the browser without a build step via ESM imports. For JSX parsing in `script` tags, include Babel.

## Basic example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Query Builder ESM</title>
    <link rel="stylesheet" href="https://esm.sh/react-querybuilder@latest/dist/query-builder.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@latest",
          "react-dom/": "https://esm.sh/react-dom@latest/",
          "react-querybuilder": "https://esm.sh/react-querybuilder@latest"
        }
      }
    </script>
    <script type="module">
      import * as React from 'react';
      import { createRoot } from 'react-dom/client';
      import { QueryBuilder } from 'react-querybuilder';

      const fields = [
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ];

      const defaultQuery = {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
          { field: 'lastName', operator: 'in', value: 'Vai,Vaughan' },
        ],
      };

      createRoot(document.getElementById('root')).render(
        React.createElement(QueryBuilder, { fields, defaultQuery })
      );
    </script>
  </body>
</html>
```

## Drag-and-drop example

For drag-and-drop functionality, import `react-dnd`, `react-dnd-html5-backend`, and `@react-querybuilder/dnd`. Wrap `<QueryBuilder />` with `<QueryBuilderDnD />` and pass the combined exports to the `dnd` prop.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Query Builder ESM (DnD)</title>
    <link rel="stylesheet" href="https://esm.sh/react-querybuilder@latest/dist/query-builder.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="importmap">
      {
        "imports": {
          "react": "https://esm.sh/react@latest",
          "react-dom/": "https://esm.sh/react-dom@latest/",
          "react-querybuilder": "https://esm.sh/react-querybuilder@latest",
          "@react-querybuilder/dnd": "https://esm.sh/@react-querybuilder/dnd@latest",
          "react-dnd": "https://esm.sh/react-dnd@latest",
          "react-dnd-html5-backend": "https://esm.sh/react-dnd-html5-backend@latest"
        }
      }
    </script>
    <script type="module">
      import * as React from 'react';
      import { createRoot } from 'react-dom/client';
      import { QueryBuilder } from 'react-querybuilder';
      // highlight-start
      import * as ReactDnD from 'react-dnd';
      import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
      import { QueryBuilderDnD } from '@react-querybuilder/dnd';
      // highlight-end

      const fields = [
        { name: 'firstName', label: 'First Name' },
        { name: 'lastName', label: 'Last Name' },
      ];

      const defaultQuery = {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
          { field: 'lastName', operator: 'in', value: 'Vai,Vaughan' },
        ],
      };

      createRoot(document.getElementById('root')).render(
        // highlight-start
        React.createElement(QueryBuilderDnD, {
          dnd: { ...ReactDnD, ...ReactDndHtml5Backend },
          children: [React.createElement(QueryBuilder, { fields, defaultQuery })],
        })
        // highlight-end
      );
    </script>
  </body>
</html>
```
