## @react-querybuilder/drizzle

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with Drizzle ORM integration.

**[Full documentation](https://react-querybuilder.js.org/docs/utils/export#drizzle-orm)**

> [!TIP]
>
> This package is unnecessary, and only supports Drizzle's [query builder API](https://orm.drizzle.team/docs/select) (like `db.select().from(table).where(...)`).
>
> For use with Drizzle's [relational queries API](https://orm.drizzle.team/docs/rqb), use `formatQuery` directly from `react-querybuilder` with the "drizzle" format:
>
> ```ts
> import { formatQuery } from 'react-querybuilder/formatQuery';
> const where = formatQuery(query, 'drizzle');
> const results = db.query.myTable.findMany({ where });
> ```
>
> For use with Drizzle's [query builder API](https://orm.drizzle.team/docs/rqb), use `formatQuery` in the same way as above and then pass a table definition and Drizzle operators into the generated function. Pass the result to the `.where()` call:
>
> ```ts
> import { getOperators } from 'drizzle-orm';
> import { drizzle } from 'drizzle-orm/bun-sqlite';
> import { sqliteTable, text } from 'drizzle-orm/sqlite-core';
> import { formatQuery } from 'react-querybuilder/formatQuery';
>
> const db = drizzle(process.env.DB_FILE_NAME!);
> const table = sqliteTable('musicians', {
>   firstName: text(),
>   lastName: text(),
> });
>
> const whereFn = formatQuery(query, 'drizzle');
> const whereObj = whereFn(table, getOperators());
> const results = db.select().from(table).where(whereObj);
> ```

<!-- ![Screenshot](../../_assets/screenshot.png) -->

## Installation

```bash
npm i react-querybuilder @react-querybuilder/drizzle
# OR yarn add / pnpm add / bun add
```

## Usage

To produce a Drizzle query based on a React Query Builder query object, first generate a rule group processor with `generateDrizzleRuleGroupProcessor` using your table config (or a plain object mapping `field` names to Drizzle `Column`s). Then run `formatQuery`, assigning your rule group processor as `ruleGroupProcessor`.

```ts
import { formatQuery } from 'react-querybuilder';
import { generateDrizzleRuleGroupProcessor } from '@react-querybuilder/drizzle';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { fields } from './fields';

const db = drizzle(process.env.DB_FILE_NAME!);

const table = sqliteTable('table', {
  firstName: text(),
  lastName: text(),
});

const ruleGroupProcessor = generateDrizzleRuleGroupProcessor(table);

const sqlWhere = formatQuery(query, { fields, ruleGroupProcessor });

const results = db.select().from(table).where(sqlWhere);
```

<!-- ## Notes -->
