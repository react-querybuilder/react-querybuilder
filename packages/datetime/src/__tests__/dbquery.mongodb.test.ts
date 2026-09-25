import { formatQuery } from '@react-querybuilder/core';
import { reserveModel } from '@rqb-dbmongo';
import type { Model } from 'mongoose';
import { Schema } from 'mongoose';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorMongoDBQuery } from '../getDatetimeRuleProcessorMongoDBQuery';

type Result = {
  id: string;
  first_name: string;
  middle_name?: string | null | undefined;
  last_name: string;
  birthdate: Date;
  created_at: Date;
  updated_at: Date;
};

let Musician: Model<Result>;
let drop: () => Promise<void>;

afterAll(async () => {
  await drop?.();
});

const musicianSchema = {
  id: { type: String, required: true },
  first_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String, required: true },
  birthdate: { type: Date, required: true, index: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
} as const;

beforeAll(async () => {
  ({ model: Musician, drop } = await reserveModel('musician', new Schema<Result>(musicianSchema)));
  await Musician.insertMany(
    musicians.map(m => ({
      ...m,
      id: `${m.last_name}, ${m.first_name}`,
      created_at: new Date(),
      updated_at: new Date(),
    }))
  );
}, 30_000);

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    for (const [testCaseName, [query, expectation]] of Object.entries(testCases)) {
      test(testCaseName, async () => {
        const mdbQuery = formatQuery(query, {
          format: 'mongodb_query',
          fields,
          ruleProcessor: getDatetimeRuleProcessorMongoDBQuery(apiFns),
        });
        const result = await Musician.find(mdbQuery);
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
