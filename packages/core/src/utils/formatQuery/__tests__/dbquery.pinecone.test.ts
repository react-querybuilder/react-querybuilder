import { afterAll, beforeAll, describe } from 'bun:test';
import {
  createPineconeNamespace,
  dropPineconeNamespace,
  pineconeEnabled,
  pineconeFilter,
  pineconeInsert,
  pineconeNamespace,
  reserveSchema,
} from '@rqb-dbpool';
import type { AugmentedSuperUser, SuperUser } from '../dbqueryTestUtils';
import { augmentedSuperUsers } from '../dbqueryTestUtils';
import { vectorDbCommonTests } from '../vectorDbqueryTestUtils';

// Opt-in only (real Pinecone account; not in CI — Pinecone Local is EOL). `null` metadata →
// key omitted.
const ns = pineconeNamespace(reserveSchema('pinecone'));
const users: AugmentedSuperUser<boolean>[] = augmentedSuperUsers('postgres');

// Per-DB expected-result overrides (missing-field semantics). Source for docs caveats.
const expectedOverrides: Record<string, (u: SuperUser) => boolean> = {};

describe.skipIf(!pineconeEnabled)('Pinecone', () => {
  beforeAll(async () => {
    await createPineconeNamespace(ns);
    await pineconeInsert(ns, users as unknown as Record<string, unknown>[]);
  }, 90_000);

  afterAll(async () => {
    await dropPineconeNamespace(ns);
  });

  vectorDbCommonTests<Record<string, unknown>>(
    'pinecone',
    users,
    filter => pineconeFilter<SuperUser>(ns, filter),
    expectedOverrides
  );
});
