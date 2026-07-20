/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import { col, DataTypes, literal, Model, Op, Sequelize, where } from 'sequelize';
import { fields, testCases, products } from '../dbqueryTestUtils';
import { expressionRuleProcessorSequelize } from '../index';

// SQLite lacks LEAST/GREATEST; `preset: 'sqlite'` resolves `min`/`max` to scalar MIN/MAX.
// String-match cases render natively via `Op.like`/`Op.notLike` + literal patterns.

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

class Product extends Model {}
Product.init(
  {
    id: { type: DataTypes.INTEGER, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    price: { type: DataTypes.DOUBLE, allowNull: false },
    qty: { type: DataTypes.INTEGER, allowNull: false },
    discount: { type: DataTypes.DOUBLE, allowNull: false },
    rating: { type: DataTypes.DOUBLE, allowNull: true },
  },
  { sequelize, modelName: 'products', timestamps: false }
);

beforeAll(async () => {
  await Product.sync({ force: true, logging: false });
  await Product.bulkCreate(products as unknown as Record<string, unknown>[], { logging: false });
});

afterAll(async () => {
  await sequelize.close();
});

const context = {
  sequelizeOperators: Op,
  sequelizeWhere: where,
  sequelizeLiteral: literal,
  sequelizeCol: col,
};

for (const [testCaseName, [query, expectedIds]] of Object.entries(testCases)) {
  test(testCaseName, async () => {
    const whereClause = formatQuery(query, {
      format: 'sequelize',
      preset: 'sqlite',
      fields,
      ruleProcessor: expressionRuleProcessorSequelize,
      context,
    });
    const rows = await Product.findAll({
      where: whereClause,
      order: [['id', 'ASC']],
      logging: false,
    });
    expect(rows.map(r => r.get('id'))).toEqual(expectedIds);
  });
}
