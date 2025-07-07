import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import type { DefaultRuleGroupType, ExportFormat } from '../../../types';
import type { SuperUser, TestSQLParams } from '../dbqueryTestUtils';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const cleanProjection = {
  _id: 0,
  __v: 0,
  createdAt: 0,
  updatedAt: 0,
} as const;

const mongoServer = new MongoMemoryServer();

const superUsersMongoDB = superUsers('mongodb');
const augmentedSuperUsersMongoDB = augmentedSuperUsers('mongodb');

interface SuperUserMongoDB extends Omit<SuperUser, 'enhanced' | 'powerUpAge'> {
  enhanced?: boolean | null | undefined;
  powerUpAge?: number | null | undefined;
}
interface AugmentedSuperUserMongoDB extends SuperUserMongoDB {
  nicknames: string[];
  earlyPencilers: {
    firstName: unknown;
    lastName: unknown;
    generationalSuffix?: string | null | undefined;
  }[];
}

let SuperHero: mongoose.Model<SuperUserMongoDB>;
let AugmentedSuperHero: mongoose.Model<AugmentedSuperUserMongoDB>;

const superHeroSchema = {
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  enhanced: { type: Boolean },
  madeUpName: { type: String, required: true },
  nickname: { type: String, required: true },
  powerUpAge: { type: Number },
} as const;

beforeAll(async () => {
  await mongoServer.start();
  await mongoose.connect(mongoServer.getUri());
  SuperHero = mongoose.model('superhero', new mongoose.Schema(superHeroSchema));
  await SuperHero.insertMany(superUsersMongoDB);

  // const nestedSchema = new mongoose.Schema({
  const nestedSchema = {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    generationalSuffix: { type: String },
  } as const;
  const nestedSchemaMongoose = new mongoose.Schema(nestedSchema, { _id: false });
  // @ts-expect-error - I don't know what mongoose needs here
  AugmentedSuperHero = mongoose.model(
    'augmentedsuperhero',
    new mongoose.Schema({
      ...superHeroSchema,
      nicknames: { type: [String], required: true },
      earlyPencilers: {
        type: [nestedSchemaMongoose],
        required: true,
      },
      // earlyPencilers: [nestedSchema],
    })
  );
  await AugmentedSuperHero.insertMany(augmentedSuperUsersMongoDB);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('MongoDB', () => {
  // Common tests
  describe('common', () => {
    for (const [name, { query, expectedResult, fqOptions }] of Object.entries(
      dbTests(superUsersMongoDB)
    )) {
      for (const avoidFieldsAsKeys of [false, true]) {
        describe(`${avoidFieldsAsKeys ? 'aggrn' : 'query'}`, () => {
          for (const [format, processorFn] of [
            ['mongodb', (v: string, afak) => JSON.parse(afak ? `{"$expr":${v}}` : v)],
            ['mongodb_query', (v, afak) => (afak ? { $expr: v } : v)],
          ] as [
            ExportFormat,
            (v: unknown, afak?: boolean) => mongoose.RootFilterQuery<SuperUserMongoDB>,
          ][]) {
            describe(format, () => {
              test(name, async () => {
                const mongoDbQuery = formatQuery(query, {
                  ...fqOptions,
                  format,
                  context: { avoidFieldsAsKeys },
                });
                const queryResult = await SuperHero.find(
                  processorFn(mongoDbQuery, avoidFieldsAsKeys),
                  cleanProjection
                );
                expect(queryResult).toMatchObject(expectedResult);
              });
            });
          }
        });
      }
    }
  });

  describe('match modes', () => {
    const testMongoDBaugmented = (
      name: string,
      { query, expectedResult, fqOptions }: TestSQLParams
    ) => {
      test(name, async () => {
        const mongoDbQuery = formatQuery(query, { ...fqOptions, format: 'mongodb_query' });
        // The `cleanProjection` method below only cleans the top-level objects, so nested documents still have `_id`, etc.
        // const queryResult = await AugmentedSuperHero.find(mongoDbQuery, cleanProjection);
        // ...so we do this instead:
        const queryResult = JSON.parse(
          JSON.stringify(
            await AugmentedSuperHero.find(mongoDbQuery, cleanProjection),
            (key, value) => (key.startsWith('_') ? undefined : value)
          )
        );
        expect(queryResult).toMatchObject(expectedResult);
      });
    };

    const runTest = (
      name: string,
      query: DefaultRuleGroupType,
      filterFn: (u: (typeof augmentedSuperUsersMongoDB)[number]) => boolean
    ) => {
      testMongoDBaugmented(name, {
        query,
        expectedResult: augmentedSuperUsersMongoDB.filter(u => filterFn(u)),
      });
    };

    describe('strings', () => {
      for (const [name, mm, fn] of matchModeTests.strings) {
        runTest(name, genStringsMatchQuery(mm), fn);
      }
    });

    describe('objects', () => {
      for (const [name, mm, fn] of matchModeTests.objects) {
        runTest(name, genObjectsMatchQuery(mm), fn);
      }
    });
  });
});
