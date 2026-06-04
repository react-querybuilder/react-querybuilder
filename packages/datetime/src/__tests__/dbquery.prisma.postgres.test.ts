import { PGlite } from '@electric-sql/pglite';
import { formatQuery } from '@react-querybuilder/core';
import { PrismaPGlite } from 'pglite-prisma-adapter';
import {
  CREATE_MUSICIANS_TABLE,
  dateLibraryFunctions,
  fields,
  musicians,
  testCases,
} from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorPrisma } from '../getDatetimeRuleProcessorPrisma';
// oxlint-disable-next-line ban-ts-comment
// @ts-ignore This only fails before generating the adapter, but we don't care
import { PrismaClient } from '../prisma/generated/prisma-client/client';

const db = new PGlite();
const adapter = new PrismaPGlite(db);
const prisma = new PrismaClient({ adapter });

const now = new Date();

beforeAll(async () => {
  await prisma.$executeRawUnsafe(CREATE_MUSICIANS_TABLE('postgresql'));
  await prisma.musicians.createMany({
    data: musicians.map(m => ({
      ...m,
      birthdate: new Date(m.birthdate),
      created_at: now,
      updated_at: now,
    })),
  });
});

afterAll(async () => {
  await prisma.$disconnect();
  await db.close();
});

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const where = formatQuery(query, {
          format: 'prisma',
          fields,
          ruleProcessor: getDatetimeRuleProcessorPrisma(apiFns),
        });
        const result = await prisma.musicians.findMany({ where, orderBy: { last_name: 'asc' } });
        // oxlint-disable no-conditional-expect
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result).toHaveLength(1);
          expect(result[0].last_name).toBe(expectation);
        }
        // oxlint-enable no-conditional-expect
      });
    }
  });
}
