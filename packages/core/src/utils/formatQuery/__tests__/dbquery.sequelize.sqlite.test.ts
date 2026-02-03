import { col, DataTypes, fn, Model, Op, Sequelize } from 'sequelize';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { dbTests, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const superUsersSQLite = superUsers('sqlite');

const sequelize = new Sequelize({ dialect: 'sqlite', storage: ':memory:' });

class SequelizeSuperUser extends Model {}
SequelizeSuperUser.init(
  {
    firstName: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    lastName: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    // We could use `DataTypes.BOOLEAN` for `enhanced`, but then we'd have to run
    // `superUsers("postgres")` above since Sequelize would convert values to boolean
    enhanced: { type: DataTypes.TINYINT, allowNull: false },
    madeUpName: { type: DataTypes.STRING, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: false },
    powerUpAge: { type: DataTypes.TINYINT, allowNull: true },
  },
  { sequelize, modelName: 'superusers', createdAt: false, updatedAt: false }
);

beforeAll(async () => {
  await SequelizeSuperUser.sync({ force: true, logging: false });
  // oxlint-disable-next-line typescript/no-explicit-any
  await SequelizeSuperUser.bulkCreate(superUsersSQLite as any, { logging: false });
});

afterAll(async () => {
  await sequelize.close();
});

const testSQL = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', async () => {
    const where = formatQuery(query, {
      ...fqOptions,
      format: 'sequelize',
      context: { sequelizeOperators: Op, sequelizeCol: col, sequelizeFn: fn },
    });
    const results = await SequelizeSuperUser.findAll({
      where,
      order: [['madeUpName', 'ASC']],
      logging: false,
    });
    expect(results.map(r => r.toJSON())).toEqual(expectedResult);
  });
};

describe('Sequelize (SQLite)', () => {
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersSQLite))) {
    describe(name, () => {
      testSQL(t);
    });
  }
});
