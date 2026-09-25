import { formatQuery } from '@react-querybuilder/core';
import { reserveModel } from '@rqb-dbmongo';
import type { Model } from 'mongoose';
import { Schema } from 'mongoose';
import { fields, products, testCases } from '../dbqueryTestUtils';
import { expressionRuleProcessorMongoDBQuery } from '../index';

interface ProductDoc {
  id: number;
  name: string;
  price: number;
  qty: number;
  discount: number;
  rating: number | null;
}

let Product: Model<ProductDoc>;
let drop: () => Promise<void>;

afterAll(async () => {
  await drop?.();
});

beforeAll(async () => {
  ({ model: Product, drop } = await reserveModel(
    'product',
    new Schema<ProductDoc>({
      id: { type: Number, required: true },
      name: { type: String, required: true },
      price: { type: Number, required: true },
      qty: { type: Number, required: true },
      discount: { type: Number, required: true },
      rating: { type: Number, default: null },
    })
  ));
  await Product.insertMany(products);
}, 30_000);

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
