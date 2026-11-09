---
title: Custom bind variables
description: Altering the SQL for certain RDBMS's
hide_table_of_contents: true
---

:::tip

The specific method described below is not necessary in version 7 or later. The [`numberedParams` option](../utils/export#numbered-parameters) will achieve the same result.

:::

Different SQL database systems have varying requirements for bind variable placeholders. Some use a simple `?` character (the default format from `formatQuery(query, 'parameterized')`), while others require placeholders starting with `$` followed by a unique identifier or number.

The ["parameterized_named" export format](../utils/export#named-parameters) with the [`paramPrefix` option](../utils/export#parameter-prefix) typically handles named placeholders. However, if the default parameter names (e.g., `:fieldName_1`) don't meet your requirements, you can use the "parameterized" format and replace the `?` placeholders with custom names.

This code generates a SQL string with numbered bind variable placeholders from "$1" to "$n", where n equals the number of bind variables (matching the number of elements in the `params` array):

```ts
let i = 0;
const fq = formatQuery(query, 'parameterized');
const fqWithNumberedParams = {
  ...fq,
  sql: fq.sql.replaceAll('?', () => `$${++i}`),
};
```

If `formatQuery(query, "parameterized")` returns this object:

```json
{
  "sql": "(firstName = ? and lastName = ?)",
  "params": ["Steve", "Vai"]
}
```

The code above transforms it into:

```json
{
  "sql": "(firstName = $1 and lastName = $2)",
  "params": ["Steve", "Vai"]
}
```
