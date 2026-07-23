/* @vitest-environment node */

import { formatQuery } from '@react-querybuilder/core';
import { getSharedMongo } from '@rqb-dbmongo';
import mongoose from 'mongoose';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';
import { getDatetimeRuleProcessorMongoDBQuery } from '../getDatetimeRuleProcessorMongoDBQuery';

if (typeof vi !== 'undefined' && typeof vi.setConfig === 'function') {
  vi.setConfig({ testTimeout: 60_000 });
}

type Result = {
  first_name: string;
  middle_name?: string | null | undefined;
  last_name: string;
  birthdate: Date;
  created_at: Date;
  updated_at: Date;
};

let Musician: mongoose.Model<Result>;

const musicianSchema = {
  first_name: { type: String, required: true },
  middle_name: { type: String },
  last_name: { type: String, required: true },
  birthdate: { type: Date, required: true, index: true },
  created_at: { type: Date, required: true },
  updated_at: { type: Date, required: true },
} as const;

beforeAll(async () => {
  const conn = await getSharedMongo();
  Musician = conn.model('musician', new mongoose.Schema(musicianSchema));
  await Musician.syncIndexes();
  await Musician.insertMany(
    musicians.map(m => ({ ...m, created_at: new Date(), updated_at: new Date() }))
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
