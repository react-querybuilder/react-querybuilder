import { col, DataTypes, fn, Model, Op, Sequelize } from '@sequelize/core';
import { SqliteDialect } from '@sequelize/sqlite3';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { dbTests, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Use 'postgres' (boolean) rather than 'sqlite' (0|1) because Sequelize reads
// BOOLEAN columns back as true/false, so expectedResult must match that type.
const superUsersSequelize = superUsers('postgres');

const sequelize = new Sequelize({
  dialect: SqliteDialect,
  storage: ':memory:',
  pool: { idle: Infinity, maxUses: Infinity, max: 1 },
});

class SequelizeSuperUser extends Model {}
SequelizeSuperUser.init(
  {
    firstName: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    lastName: { type: DataTypes.STRING, allowNull: false, primaryKey: true },
    enhanced: { type: DataTypes.BOOLEAN, allowNull: false },
    madeUpName: { type: DataTypes.STRING, allowNull: false },
    nickname: { type: DataTypes.STRING, allowNull: false },
    powerUpAge: { type: DataTypes.TINYINT, allowNull: true },
  },
  { sequelize, modelName: 'superusers', createdAt: false, updatedAt: false }
);

beforeAll(async () => {
  await SequelizeSuperUser.sync({ force: true, logging: false });
  // oxlint-disable-next-line typescript/no-explicit-any
  await SequelizeSuperUser.bulkCreate(superUsersSequelize as any, { logging: false });
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
  for (const [name, t] of Object.entries(dbTests(superUsersSequelize))) {
    describe(name, () => {
      testSQL(t);
    });
  }
});
