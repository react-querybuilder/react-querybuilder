import { afterAll, beforeAll, describe } from 'bun:test';
import {
  chromaEnabled,
  chromaFilter,
  chromaInsert,
  createChromaCollection,
  dropChromaCollection,
  reserveSchema,
} from '@rqb-dbpool';
import type { AugmentedSuperUser, SuperUser } from '../dbqueryTestUtils';
import { augmentedSuperUsers } from '../dbqueryTestUtils';
import { vectorDbCommonTests } from '../vectorDbqueryTestUtils';

// CI-only (`DBIntegrationVector` job). `null` metadata → key omitted.
const collection = reserveSchema('chroma');
const users: AugmentedSuperUser<boolean>[] = augmentedSuperUsers('postgres');

// Per-DB expected-result overrides (missing-field semantics). Source for docs caveats.
const expectedOverrides: Record<string, (u: SuperUser) => boolean> = {};

describe.skipIf(!chromaEnabled)('Chroma', () => {
  beforeAll(async () => {
    await createChromaCollection(collection);
    await chromaInsert(collection, users as unknown as Record<string, unknown>[]);
  }, 30_000);

  afterAll(async () => {
    await dropChromaCollection(collection);
  });

  vectorDbCommonTests<Record<string, unknown>>(
    'chroma',
    users,
    where => chromaFilter<SuperUser>(collection, where),
    expectedOverrides
  );
});
