import { createSchema, dropSchema, getSharedPrismaAdapter, reserveSchema } from '@rqb-dbpool';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { CREATE_INDEX, CREATE_TABLE, dbTests, fields, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
// oxlint-disable-next-line ban-ts-comment
// @ts-ignore This only fails before generating the adapter, but we don't care
import { PrismaClient } from '../prisma/generated/prisma-client/client';

const schema = reserveSchema('prisma_pg');
const superUsersPostgres = superUsers('postgres');

const prisma = new PrismaClient({ adapter: await getSharedPrismaAdapter(schema) });

beforeAll(async () => {
  const db = await createSchema(schema);
  await db.exec(`${CREATE_TABLE('postgres', { schema })}; ${CREATE_INDEX({ schema })}`);
  await prisma.superusers.createMany({ data: superUsersPostgres });
});

afterAll(async () => {
  await prisma.$disconnect();
  await dropSchema(schema);
});

const testPrisma = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  test('sql', async () => {
    const where = formatQuery(query, {
      ...fqOptions,
      format: 'prisma',
      fields,
      parseNumbers: 'strict-limited',
    });
    const queryResult = await prisma.superusers.findMany({ where, orderBy: { madeUpName: 'asc' } });
    expect(queryResult).toEqual(expectedResult);
  });
};

describe('Prisma', () => {
  // Prisma does not support field-to-field comparisons (returns undefined)
  for (const [name, t] of Object.entries(dbTests(superUsersPostgres)).filter(
    ([k]) => !k.startsWith('f2f ')
  )) {
    describe(name, () => {
      testPrisma(t);
    });
  }
});
