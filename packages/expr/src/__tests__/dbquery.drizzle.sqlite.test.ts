/* @vitest-environment node */

import { Database } from 'bun:sqlite';
import { formatQuery } from '@react-querybuilder/core';
import { getOperators } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/bun-sqlite';
import { integer, real, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { fields, testCases, products } from '../dbqueryTestUtils';
import { expressionRuleProcessorDrizzle } from '../index';

// SQLite lacks LEAST/GREATEST; passing `preset: 'sqlite'` resolves `min`/`max` to scalar
// MIN/MAX. String-match cases render natively via SQL `like` + wildcard concatenation.

const bunSQLiteDB = new Database();

const productsTable = sqliteTable('products', {
  id: integer().primaryKey(),
  name: text().notNull(),
  price: real().notNull(),
  qty: integer().notNull(),
  discount: real().notNull(),
  rating: real(),
});

const drizzleDB = drizzle({ schema: { products: productsTable }, client: bunSQLiteDB });

beforeAll(async () => {
  bunSQLiteDB.run(`CREATE TABLE products (
    id integer PRIMARY KEY,
    name text NOT NULL,
    price real NOT NULL,
    qty integer NOT NULL,
    discount real NOT NULL,
    rating real)`);
  await drizzleDB.insert(productsTable).values(products);
});

afterAll(() => {
  bunSQLiteDB.close();
});

const columns = {
  id: productsTable.id,
  name: productsTable.name,
  price: productsTable.price,
  qty: productsTable.qty,
  discount: productsTable.discount,
  rating: productsTable.rating,
};

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  test(testCaseName, async () => {
    const where = formatQuery(query, {
      format: 'drizzle',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorDrizzle,
      context: { columns, drizzleOperators: getOperators() },
    });
    const rows = await drizzleDB
      .select({ id: productsTable.id })
      .from(productsTable)
      .where(where(productsTable, getOperators()))
      .orderBy(productsTable.id);
    expect(rows.map(r => r.id)).toEqual(expectedIds);
  });
}
