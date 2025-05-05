## @react-querybuilder/drizzle

Augments [react-querybuilder](https://npmjs.com/package/react-querybuilder) with Drizzle ORM integration.

To see this in action, check out the [`react-querybuilder` demo](https://react-querybuilder.js.org/demo) and select Export > Drizzle.

**[Full documentation](https://react-querybuilder.js.org/docs/drizzle)**

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
import { getDrizzleRuleGroupProcessor } from '@react-querybuilder/drizzle';
import 'dotenv/config';
import { drizzle } from 'drizzle-orm/bun-sqlite';

const db = drizzle(process.env.DB_FILE_NAME!);

// Assume `table` was created with something like the following:
// const table = pgTable('table', { ... });
// const table = sqliteTable('table', { ... });
// const table = mysqlTable('table', { ... });

const ruleGroupProcessor = generateDrizzleRuleGroupProcessor(table);

const results = db.select().from(table).where(formatQuery(query, { fields, ruleGroupProcessor }));
```

<!-- ## Notes -->
