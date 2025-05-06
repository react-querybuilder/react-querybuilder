## @react-querybuilder/drizzle

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with Drizzle ORM integration.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo) and select Export > Drizzle.

**[Full documentation](https://react-querybuilder.js.org/docs/utils/export#drizzle-orm)**

<!-- ![Screenshot](../../_assets/screenshot.png) -->

## Installation

```bash
npm i react-querybuilder @react-querybuilder/drizzle
# OR yarn add / pnpm add / bun add
```

## Usage

To produce a Drizzle query based on a React Query Builder query object, first generate a rule group processor with `generateDrizzleRuleGroupProcessor` from `@react-querybuilder/drizzle` using your table config (or a simple object mapping `field` names to table columns). Then run `formatQuery`, assigning your rule group processor as `ruleGroupProcessor`.

```ts
import { formatQuery } from 'react-querybuilder';
import { generateDrizzleRuleGroupProcessor } from '@react-querybuilder/drizzle';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { sqliteTable } from 'drizzle-orm/sqlite-core';
import { fields } from './fields';

const db = drizzle(process.env.DB_FILE_NAME!);

const table = sqliteTable('table', {
  // Column definitions...
});

const ruleGroupProcessor = generateDrizzleRuleGroupProcessor(table);

const sqlWhere = formatQuery(query, { fields, ruleGroupProcessor });

const results = db.select().from(table).where(sqlWhere);
```

<!-- ## Notes -->
