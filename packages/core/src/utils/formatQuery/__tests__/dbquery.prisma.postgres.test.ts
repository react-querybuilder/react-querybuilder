import { PGlite } from '@electric-sql/pglite';
import { PrismaClient } from '@prisma/client';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { CREATE_INDEX, CREATE_TABLE, dbTests, fields, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const db = new PGlite();

const superUsersPostgres = superUsers('postgres');

const adapter = new PrismaPGlite(db);
// oxlint-disable-next-line ban-ts-comment
// @ts-ignore This only fails after generating the adapter
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
    const queryResult = await prisma.superusers.findMany({
      where,
      orderBy: { madeUpName: 'asc' },
    });
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
