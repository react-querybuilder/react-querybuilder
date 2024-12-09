/* @jest-environment node */

import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import { formatQuery } from 'react-querybuilder';
import { getDatetimeRuleProcessorMongoDBQuery } from '../datetimeRuleProcessorMongoDBQuery';
import { dateLibraryFunctions, fields, musicians, testCases } from '../dbqueryTestUtils';

if (process.env.JEST_WORKER_ID) {
  // Give MongoDB time to download
  jest.setTimeout(60_000);
}

const mongoServer = new MongoMemoryServer();

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
  await mongoServer.start();
  await mongoose.connect(mongoServer.getUri());
  Musician = mongoose.model('musician', new mongoose.Schema(musicianSchema));
  mongoose.syncIndexes();
  await Musician.insertMany(
    musicians.map(m => ({ ...m, created_at: new Date(), updated_at: new Date() }))
  );
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

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
        if (expectation === 'all') {
          expect(result).toHaveLength(musicians.length);
        } else {
          expect(result[0].last_name).toBe(expectation);
        }
      });
    }
  });
}
