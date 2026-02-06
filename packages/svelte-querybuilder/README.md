# svelte-querybuilder

Svelte 5 port of React Query Builder [react-querybuilder](https://www.npmjs.com/package/react-querybuilder).

Full documentation: https://react-querybuilder.js.org/

## Installation

```bash
npm install svelte-querybuilder
# OR yarn add / pnpm add / bun add
```

## Quick Start

```svelte
<script lang="ts">
  import { QueryBuilder } from 'svelte-querybuilder';
  import 'svelte-querybuilder/styles';
  import type { RuleGroupType, Field } from '@react-querybuilder/core';

  const fields: Field[] = [
    { name: 'firstName', label: 'First Name' },
    { name: 'lastName', label: 'Last Name' },
    { name: 'age', label: 'Age', inputType: 'number' },
    { name: 'isActive', label: 'Active', inputType: 'checkbox' }
  ];

  let query = $state<RuleGroupType>({
    combinator: 'and',
    rules: []
  });

  function handleQueryChange(newQuery: RuleGroupType) {
    query = newQuery;
    console.log('Query changed:', newQuery);
  }
</script>

<QueryBuilder
  {fields}
  bind:query
  onQueryChange={handleQueryChange}
/>
```

## Features

- ✅ Built with Svelte 5 runes (`$state`, `$derived`, `$effect`)
- ✅ TypeScript support with full type safety
- ✅ Shares core utilities with `react-querybuilder`
- ✅ Custom component support
- ✅ Multiple export formats (SQL, MongoDB, JsonLogic, etc.)
- ✅ Validation support
- ✅ i18n/translations
- ✅ Accessible (ARIA attributes, keyboard navigation)

## API

### QueryBuilder Props

| Prop                          | Type                             | Default                                                        | Description                              |
| ----------------------------- | -------------------------------- | -------------------------------------------------------------- | ---------------------------------------- |
| `query`                       | `RuleGroupType`                  | `{ combinator: 'and', rules: [] }`                             | The query object (use with `bind:query`) |
| `fields`                      | `Field[]`                        | `[]`                                                           | Array of field definitions               |
| `operators`                   | `NameLabelPair[]`                | Default operators                                              | Custom operators                         |
| `combinators`                 | `NameLabelPair[]`                | `[{ name: 'and', label: 'AND' }, { name: 'or', label: 'OR' }]` | Custom combinators                       |
| `onQueryChange`               | `(query: RuleGroupType) => void` | -                                                              | Callback when query changes              |
| `controlClassnames`           | `Classnames`                     | -                                                              | Custom CSS classes                       |
| `translations`                | `Translations`                   | -                                                              | i18n translations                        |
| `showNotToggle`               | `boolean`                        | `false`                                                        | Show NOT toggle                          |
| `showCombinatorsBetweenRules` | `boolean`                        | `false`                                                        | Alternate combinator display             |
| `disabled`                    | `boolean`                        | `false`                                                        | Disable all controls                     |

See [react-querybuilder](https://react-querybuilder.js.org/) for more details on query structure and utilities.

## Custom Components

You can override default components:

```svelte
<script lang="ts">
  import { QueryBuilder } from 'svelte-querybuilder';
  import CustomValueEditor from './CustomValueEditor.svelte';

  const controlElements = {
    valueEditor: CustomValueEditor
  };
</script>

<QueryBuilder
  fields={myFields}
  controlElements={controlElements}
/>
```

## Formatting Queries

Use formatters from `@react-querybuilder/core`:

```typescript
import { formatQuery } from '@react-querybuilder/core';

const sql = formatQuery(query, 'sql');
const mongodb = formatQuery(query, 'mongodb');
const jsonLogic = formatQuery(query, 'jsonlogic');
```

## Parsing Queries

```typescript
import { parseSQL, parseCEL, parseJsonLogic } from '@react-querybuilder/core';

const query = parseSQL('SELECT * FROM users WHERE age > 18');
const query2 = parseCEL('user.age > 18 && user.isActive == true');
const query3 = parseJsonLogic({ and: [{ '>': [{ var: 'age' }, 18] }] });
```

## Related Packages

- [@react-querybuilder/core](https://www.npmjs.com/package/@react-querybuilder/core) - Framework-agnostic utilities
- [react-querybuilder](https://www.npmjs.com/package/react-querybuilder) - React implementation
