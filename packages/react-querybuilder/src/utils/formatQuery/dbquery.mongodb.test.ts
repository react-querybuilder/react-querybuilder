import { MongoMemoryServer } from 'mongodb-memory-server-core';
import mongoose from 'mongoose';
import type { SuperUser } from './dbqueryTestUtils';
import { dbTests, superUsers } from './dbqueryTestUtils';
import { formatQuery } from './formatQuery';

const mongoServer = new MongoMemoryServer();

const superUsersMongoDB = superUsers('mongodb');

interface SuperUserMongoDB extends Omit<SuperUser, 'enhanced' | 'powerUpAge'> {
  enhanced?: boolean | null | undefined;
  powerUpAge?: number | null | undefined;
}

let SuperHero: mongoose.Model<SuperUserMongoDB>;

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
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

// Common tests
describe('MongoDB', () => {
  for (const [name, { query, expectedResult, fqOptions }] of Object.entries(
    dbTests(superUsersMongoDB)
  )) {
    describe(name, () => {
      test('mongodb', async () => {
        const mongoDbQuery = formatQuery(query, { ...fqOptions, format: 'mongodb' });
        const queryResult = await SuperHero.find(JSON.parse(mongoDbQuery));
        expect(queryResult).toEqual(expectedResult.map(er => expect.objectContaining(er)));
      });
      test('mongodb_query', async () => {
        const mongoDbQuery = formatQuery(query, { ...fqOptions, format: 'mongodb_query' });
        const queryResult = await SuperHero.find(mongoDbQuery);
        expect(queryResult).toEqual(expectedResult.map(er => expect.objectContaining(er)));
      });
    });
  }
});
