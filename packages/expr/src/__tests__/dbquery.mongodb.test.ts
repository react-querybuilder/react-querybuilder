/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import { fields, testCases, products } from '../dbqueryTestUtils';
import { expressionRuleProcessorMongoDBQuery } from '../index';

if (typeof vi !== 'undefined' && typeof vi.setConfig === 'function') {
  vi.setConfig({ testTimeout: 60_000 });
}

const mongoServer = new MongoMemoryServer();

interface ProductDoc {
  id: number;
  name: string;
  price: number;
  qty: number;
  discount: number;
  rating: number | null;
}

let Product: mongoose.Model<ProductDoc>;

beforeAll(async () => {
  await mongoServer.start();
  await mongoose.connect(mongoServer.getUri());
  Product = mongoose.model(
    'product',
    new mongoose.Schema<ProductDoc>({
      id: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      discount: { type: Number, required: true },
      rating: { type: Number, default: null },
    })
  );
  await Product.insertMany(products);
}, 30_000);

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  test(testCaseName, async () => {
    const mdbQuery = formatQuery(query, {
      format: 'mongodb_query',
      parseNumbers: true,
      fields,
      ruleProcessor: expressionRuleProcessorMongoDBQuery,
    });
    const result = await Product.find(mdbQuery).sort({ id: 1 });
    expect(result.map(r => r.id)).toEqual(expectedIds);
  });
}
