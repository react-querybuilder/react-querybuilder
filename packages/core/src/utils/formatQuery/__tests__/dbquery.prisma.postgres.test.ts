import { PGlite } from '@electric-sql/pglite';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { CREATE_INDEX, CREATE_TABLE, dbTests, fields, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
// oxlint-disable-next-line ban-ts-comment
// @ts-ignore This only fails before generating the adapter, but we don't care
import { PrismaClient } from '../prisma/generated/prisma-client/client';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');

const adapter = new PrismaPGlite(db);
const prisma = new PrismaClient({ adapter });

beforeAll(async () => {
  await prisma.$executeRawUnsafe(CREATE_TABLE('postgres'));
  await prisma.$executeRawUnsafe(CREATE_INDEX());
  await prisma.superusers.createMany({ data: superUsersPostgres });
});

afterAll(async () => {
  await prisma.$disconnect();
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
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersPostgres))) {
    describe(name, () => {
      testPrisma(t);
    });
  }
});
