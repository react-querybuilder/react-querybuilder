---
title: UMD build
hide_table_of_contents: true
---

To use the UMD build of `react-querybuilder`, link `<script>` tags to the `/dist/index.umd.js` file, plus the same version of `@react-querybuilder/ctx` and the UMD builds of the following dependencies:

- `react@17` (or `@18`)
- `react-dom@17` (or `@18`)
- `immer@6` (or `@7`/`@8`/`@9`)

## Basic example

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Query Builder UMD</title>
    <link rel="stylesheet" href="https://unpkg.com/react-querybuilder@5/dist/query-builder.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      var process = { env: { NODE_ENV: 'development' } };
    </script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/immer@9/dist/immer.umd.development.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/@react-querybuilder/ctx@5/dist/index.umd.js"></script>
    <script crossorigin src="https://unpkg.com/react-querybuilder@5/dist/index.umd.js"></script>
    <script crossorigin src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script type="text/babel">
      const fields = [
        { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
        { name: 'lastName', label: 'Last Name' },
      ];
      const defaultQuery = {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      };
      ReactDOM.createRoot(document.getElementById('root')).render(
        <ReactQueryBuilder.QueryBuilder fields={fields} defaultQuery={defaultQuery} />
      );
    </script>
  </body>
</html>
```

## Drag-and-drop example

To add drag-and-drop capability, include `react-dnd@14` (no higher), `react-dnd-html5-backend@14` (no higher), and `@react-querybuilder/dnd`.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Query Builder UMD (DnD)</title>
    <link rel="stylesheet" href="https://unpkg.com/react-querybuilder@5/dist/query-builder.css" />
  </head>
  <body>
    <div id="root"></div>
    <script>
      var process = { env: { NODE_ENV: 'development' } };
    </script>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.development.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.development.js"></script>
    <script crossorigin src="https://unpkg.com/immer@9/dist/immer.umd.development.js"></script>
    <!-- highlight-start -->
    <script crossorigin src="https://unpkg.com/react-dnd@14/dist/umd/ReactDnD.min.js"></script>
    <script
      crossorigin
      src="https://unpkg.com/react-dnd-html5-backend@14/dist/umd/ReactDnDHTML5Backend.min.js"></script>
    <!-- highlight-end -->
    <script
      crossorigin
      src="https://unpkg.com/@react-querybuilder/ctx@5/dist/index.umd.js"></script>
    <script crossorigin src="https://unpkg.com/react-querybuilder@5/dist/index.umd.js"></script>
    <!-- highlight-start -->
    <script
      crossorigin
      src="https://unpkg.com/@react-querybuilder/dnd@5/dist/index.umd.js"></script>
    <!-- highlight-end -->
    <script crossorigin src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script type="text/babel">
      const fields = [
        { name: 'firstName', label: 'First Name', placeholder: 'Enter first name' },
        { name: 'lastName', label: 'Last Name' },
      ];
      const defaultQuery = {
        combinator: 'and',
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          { field: 'lastName', operator: '=', value: 'Vai' },
        ],
      };
      ReactDOM.createRoot(document.getElementById('root')).render(
        // highlight-start
        <ReactQueryBuilderDnD.QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDnDHTML5Backend }}>
          <ReactQueryBuilder.QueryBuilder fields={fields} defaultQuery={defaultQuery} />
        </ReactQueryBuilderDnD.QueryBuilderDnD>
        // highlight-end
      );
    </script>
  </body>
</html>
```
