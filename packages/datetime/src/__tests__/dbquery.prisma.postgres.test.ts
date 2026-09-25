import { formatQuery } from '@react-querybuilder/core';
import { createSchema, dropSchema, getSharedPrismaAdapter, reserveSchema } from '@rqb-dbpool';
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

const schema = reserveSchema('dt_prisma_pg');
const prisma = new PrismaClient({ adapter: await getSharedPrismaAdapter(schema) });

const now = new Date();

beforeAll(async () => {
  const db = await createSchema(schema);
  await db.exec(CREATE_MUSICIANS_TABLE('postgresql', `"${schema}".musicians`));
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
  await dropSchema(schema);
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
