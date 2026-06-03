/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import { DataTypes, Model, Op, Sequelize } from 'sequelize';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorSequelize } from '../getDatetimeRuleProcessorSequelize';

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:', logging: false });

class SequelizeMusician extends Model {}
SequelizeMusician.init(
  {
    first_name: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    middle_name: { type: DataTypes.STRING, allowNull: true },
    last_name: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    birthdate: { type: DataTypes.DATEONLY, allowNull: false },
    created_at: { type: DataTypes.DATE, allowNull: false },
    updated_at: { type: DataTypes.DATE, allowNull: false },
  },
  { sequelize, modelName: 'musicians', createdAt: false, updatedAt: false }
);

const now = new Date();

beforeAll(async () => {
  await SequelizeMusician.sync({ force: true, logging: false });
  await SequelizeMusician.bulkCreate(
    musicians.map(m => ({ ...m, created_at: now, updated_at: now })),
    { logging: false }
  );
});

afterAll(async () => {
  await sequelize.close();
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const where = formatQuery(query, {
          format: 'sequelize',
          fields,
          ruleProcessor: getDatetimeRuleProcessorSequelize(apiFns),
          context: { sequelizeOperators: Op },
        });
        const results = await SequelizeMusician.findAll({
          where,
          order: [['last_name', 'ASC']],
          logging: false,
        });
        // oxlint-disable no-conditional-expect
        if (expectation === 'all') {
          expect(results).toHaveLength(musicians.length);
        } else {
          expect(results).toHaveLength(1);
          expect(results[0].get('last_name')).toBe(expectation);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
