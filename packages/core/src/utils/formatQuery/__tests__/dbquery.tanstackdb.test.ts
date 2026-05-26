/* @vitest-environment node */

import {
  and,
  BasicIndex,
  createCollection,
  eq,
  gt,
  gte,
  inArray,
  isNull,
  like,
  localOnlyCollectionOptions,
  lt,
  lte,
  not,
  or,
  queryOnce,
} from '@tanstack/db';
import { describe, expect, test } from 'vitest';
import { convertToIC } from '../../convertQuery';
import { formatQuery } from '../../formatQuery';
import { dbTestsTanStackDb, nicknameData } from '../dbqueryTanStackDbTestUtils';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { superUsers } from '../dbqueryTestUtils';

const tanStackDbOperators = { and, eq, gt, gte, inArray, isNull, like, lt, lte, not, or };

// Use boolean-style superUsers since TanStack DB stores JS values directly
const superUserData = superUsers('jsonlogic');

const collection = createCollection(
  localOnlyCollectionOptions({ getKey: ({ firstName }) => firstName, initialData: superUserData })
);

const stripMeta = (arr: Record<string, unknown>[]) =>
  arr.map(obj => Object.fromEntries(Object.entries(obj).filter(([k]) => !k.startsWith('$'))));

const testTanStackDb = ({ query, expectedResult, fqOptions }: TestSQLParams) => {
  describe.each(['standard', 'independent combinators'])('%s', testType => {
    const queryToTest = testType === 'independent combinators' ? convertToIC(query) : query;
    const where = formatQuery(queryToTest, {
      ...fqOptions,
      format: 'tanstack_db',
      context: { tanStackDbOperators },
    });

    test('queryOnce', async () => {
      const results = await queryOnce(q =>
        q
          .from({ su: collection })
          .where(where)
          .orderBy(({ su }) => su.madeUpName)
      );

      expect(stripMeta(results)).toEqual(expectedResult);
    });
  });
};

describe('TanStack DB', () => {
  for (const [name, t] of Object.entries(dbTestsTanStackDb(superUserData))) {
    describe(name, () => {
      testTanStackDb(t);
    });
  }
});

describe('TanStack DB joins', () => {
  const nicknamesCollection = createCollection(
    localOnlyCollectionOptions({
      getKey: ({ id }) => id,
      initialData: nicknameData,
      autoIndex: 'eager',
      defaultIndexType: BasicIndex,
    })
  );

  const stripJoinMeta = (arr: Record<string, unknown>[]) =>
    arr.map(row => {
      const clean: Record<string, Record<string, unknown>> = {};
      for (const [alias, obj] of Object.entries(row)) {
        if (alias.startsWith('$')) continue;
        const inner: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj as Record<string, unknown>)) {
          if (!k.startsWith('$')) inner[k] = v;
        }
        clean[alias] = inner;
      }
      return clean;
    });

  const fqJoin = (q: Parameters<typeof formatQuery>[0]) =>
    formatQuery(q, { format: 'tanstack_db', context: { tanStackDbOperators } });

  test('bare field filters on primary collection (1:N join)', async () => {
    const where = fqJoin({
      combinator: 'and',
      rules: [{ field: 'firstName', operator: '=', value: 'Clark' }],
    });

    const results = await queryOnce(q =>
      q
        .from({ su: collection })
        .leftJoin({ nn: nicknamesCollection }, refs => eq(refs.nn.madeUpName, refs.su.madeUpName))
        .where(where)
    );

    const cleaned = stripJoinMeta(results);
    // Superman has 2 nicknames → 2 joined rows
    expect(cleaned).toHaveLength(2);
    expect(cleaned.every(r => r.su.madeUpName === 'Superman')).toBe(true);
    // oxlint-disable-next-line unicorn/no-array-sort
    const nicks = cleaned.map(r => r.nn.nickname).sort();
    expect(nicks).toEqual(['The Last Son of Krypton', 'The Man of Steel']);
  });

  test('dotted field filters on joined collection', async () => {
    const where = fqJoin({
      combinator: 'and',
      rules: [{ field: 'nn.nickname', operator: 'contains', value: 'Crusader' }],
    });

    const results = await queryOnce(q =>
      q
        .from({ su: collection })
        .leftJoin({ nn: nicknamesCollection }, refs => eq(refs.nn.madeUpName, refs.su.madeUpName))
        .where(where)
    );

    const cleaned = stripJoinMeta(results);
    expect(cleaned).toHaveLength(1);
    expect(cleaned[0].nn.nickname).toBe('The Caped Crusader');
    expect(cleaned[0].su.madeUpName).toBe('Batman');
  });

  test('mixed bare and dotted fields', async () => {
    const where = fqJoin({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Clark' },
        { field: 'nn.nickname', operator: '=', value: 'The First Avenger' },
      ],
    });

    const results = await queryOnce(q =>
      q
        .from({ su: collection })
        .leftJoin({ nn: nicknamesCollection }, refs => eq(refs.nn.madeUpName, refs.su.madeUpName))
        .where(where)
        .orderBy(({ su }) => su.madeUpName)
    );

    const cleaned = stripJoinMeta(results);
    // Clark(Superman) → 2 nickname rows; Steve(Captain America) → 1 nickname row
    expect(cleaned).toHaveLength(3);
    const names = cleaned.map(r => r.su.madeUpName);
    expect(names).toContain('Superman');
    expect(names).toContain('Captain America');
  });

  test('dotted field with valueSource: field across collections', async () => {
    // Compare su.madeUpName to nn.madeUpName (they match by design)
    const where = fqJoin({
      combinator: 'and',
      rules: [
        { field: 'su.madeUpName', operator: '=', value: 'nn.madeUpName', valueSource: 'field' },
      ],
    });

    const results = await queryOnce(q =>
      q
        .from({ su: collection })
        .leftJoin({ nn: nicknamesCollection }, refs => eq(refs.nn.madeUpName, refs.su.madeUpName))
        .where(where)
    );

    // All joined rows match (6 total nickname rows)
    const cleaned = stripJoinMeta(results);
    expect(cleaned).toHaveLength(nicknameData.length);
  });

  test('IC format with joined collections', async () => {
    const where = fqJoin(
      convertToIC({
        combinator: 'and',
        rules: [
          { field: 'nn.nickname', operator: 'beginsWith', value: 'The' },
          { field: 'lastName', operator: 'endsWith', value: 'nt' },
        ],
      })
    );

    const results = await queryOnce(q =>
      q
        .from({ su: collection })
        .leftJoin({ nn: nicknamesCollection }, refs => eq(refs.nn.madeUpName, refs.su.madeUpName))
        .where(where)
    );

    const cleaned = stripJoinMeta(results);
    // lastName ends with 'nt': Kent (Clark/Superman)
    // nickname starts with 'The': The Man of Steel, The Last Son of Krypton (both Superman)
    // Both conditions → Superman's 2 nickname rows
    expect(cleaned).toHaveLength(2);
    expect(cleaned.every(r => r.su.madeUpName === 'Superman')).toBe(true);
  });
});

describe('TanStack DB fallback (empty rules)', () => {
  test('empty rules array returns all rows', async () => {
    const where = formatQuery(
      { combinator: 'and', rules: [] },
      { format: 'tanstack_db', context: { tanStackDbOperators } }
    );

    const results = await queryOnce(q => q.from({ su: collection }).where(where));
    expect(stripMeta(results)).toHaveLength(superUserData.length);
  });

  test('nested empty groups return all rows', async () => {
    const where = formatQuery(
      { combinator: 'and', rules: [{ combinator: 'or', rules: [] }] },
      { format: 'tanstack_db', context: { tanStackDbOperators } }
    );

    const results = await queryOnce(q => q.from({ su: collection }).where(where));
    expect(stripMeta(results)).toHaveLength(superUserData.length);
  });
});
