import jsonata from 'jsonata';
import type { DefaultRuleGroupType, MatchConfig } from '../../../types/index.noReact';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { augmentedSuperUsers, dbTests, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

const superUsersJSONata = superUsers('jsonata');
const augmentedSuperUsersJSONata = augmentedSuperUsers('jsonata');

const testJSONata = (
  name: string,
  { query, expectedResult, fqOptions, guardAgainstNull }: TestSQLParams,
  data = superUsersJSONata
) => {
  test(name, async () => {
    const guardedQuery =
      guardAgainstNull && guardAgainstNull.length > 0
        ? ({
            combinator: 'and',
            rules: [
              ...guardAgainstNull.map(f => ({ field: f, operator: 'notNull', value: null })),
              query,
            ],
          } as DefaultRuleGroupType)
        : query;
    const queryAsJSONata = `*[${formatQuery(guardedQuery, { ...fqOptions, format: 'jsonata', parseNumbers: true })}]`;
    const expression = jsonata(queryAsJSONata);
    const result = await expression.evaluate(data);

    expect(Array.isArray(result) ? result : [result]).toEqual(expectedResult);
  });
};

// Common tests
describe('JSONata', () => {
  for (const [name, t] of Object.entries(dbTests(superUsersJSONata))) {
    testJSONata(name, t);
  }

  // JsonLogic-specific tests
  describe('match modes', () => {
    describe('strings', () => {
      const genQuery = (match: MatchConfig): DefaultRuleGroupType => ({
        combinator: 'and',
        rules: [
          {
            field: 'nicknames',
            operator: '=',
            value: { combinator: 'and', rules: [{ field: '', operator: 'contains', value: 'S' }] },
            match,
          },
        ],
      });

      const runTest = (
        name: string,
        matchConfig: MatchConfig,
        filterFn: (u: (typeof augmentedSuperUsersJSONata)[number]) => boolean
      ) => {
        testJSONata(
          name,
          {
            query: genQuery(matchConfig),
            expectedResult: augmentedSuperUsersJSONata.filter(u => filterFn(u)),
          },
          augmentedSuperUsersJSONata
        );
      };

      runTest('"all"', { mode: 'all' }, u => u.nicknames.every(n => n.includes('S')));
      runTest('"none"', { mode: 'none' }, u => u.nicknames.every(n => !n.includes('S')));
      runTest('"some"', { mode: 'some' }, u => u.nicknames.some(n => n.includes('S')));
      runTest('"none" as atMost 0', { mode: 'atMost', threshold: 0 }, u =>
        u.nicknames.every(n => !n.includes('S'))
      );
      runTest('"some" as atLeast 1', { mode: 'atLeast', threshold: 1 }, u =>
        u.nicknames.some(n => n.includes('S'))
      );
      runTest(
        '"atLeast" integer',
        { mode: 'atLeast', threshold: 2 },
        u => u.nicknames.filter(n => n.includes('S')).length >= 2
      );
      runTest(
        '"atLeast" decimal',
        { mode: 'atLeast', threshold: 0.5 },
        u => u.nicknames.filter(n => n.includes('S')).length >= u.nicknames.length / 2
      );
      runTest(
        '"atMost" integer',
        { mode: 'atMost', threshold: 2 },
        u => u.nicknames.filter(n => n.includes('S')).length <= 2
      );
      runTest(
        '"atMost" decimal',
        { mode: 'atMost', threshold: 0.5 },
        u => u.nicknames.filter(n => n.includes('S')).length <= u.nicknames.length / 2
      );
      runTest(
        '"exactly" integer',
        { mode: 'exactly', threshold: 2 },
        u => u.nicknames.filter(n => n.includes('S')).length === 2
      );
      runTest(
        '"exactly" decimal',
        { mode: 'exactly', threshold: 0.5 },
        u => u.nicknames.filter(n => n.includes('S')).length === u.nicknames.length / 2
      );
    });

    describe('objects', () => {
      const genQuery = (match: MatchConfig): DefaultRuleGroupType => ({
        combinator: 'and',
        rules: [
          {
            field: 'earlyPencilers',
            operator: '=',
            value: {
              combinator: 'and',
              rules: [{ field: 'lastName', operator: 'contains', value: 'S' }],
            },
            match,
          },
        ],
      });

      const runTest = (
        name: string,
        matchConfig: MatchConfig,
        filterFn: (u: (typeof augmentedSuperUsersJSONata)[number]) => boolean
      ) => {
        testJSONata(
          name,
          {
            query: genQuery(matchConfig),
            expectedResult: augmentedSuperUsersJSONata.filter(u => filterFn(u)),
          },
          augmentedSuperUsersJSONata
        );
      };

      runTest('"all"', { mode: 'all' }, u => u.earlyPencilers.every(n => n.lastName.includes('S')));
      runTest('"none"', { mode: 'none' }, u =>
        u.earlyPencilers.every(n => !n.lastName.includes('S'))
      );
      runTest('"some"', { mode: 'some' }, u =>
        u.earlyPencilers.some(n => n.lastName.includes('S'))
      );
      runTest('"none" as atMost 0', { mode: 'atMost', threshold: 0 }, u =>
        u.earlyPencilers.every(n => !n.lastName.includes('S'))
      );
      runTest('"some" as atLeast 1', { mode: 'atLeast', threshold: 1 }, u =>
        u.earlyPencilers.some(n => n.lastName.includes('S'))
      );
      runTest(
        '"atLeast" integer',
        { mode: 'atLeast', threshold: 2 },
        u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length >= 2
      );
      runTest(
        '"atLeast" decimal',
        { mode: 'atLeast', threshold: 0.5 },
        u =>
          u.earlyPencilers.filter(n => n.lastName.includes('S')).length >=
          u.earlyPencilers.length / 2
      );
      runTest(
        '"atMost" integer',
        { mode: 'atMost', threshold: 2 },
        u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length <= 2
      );
      runTest(
        '"atMost" decimal',
        { mode: 'atMost', threshold: 0.5 },
        u =>
          u.earlyPencilers.filter(n => n.lastName.includes('S')).length <=
          u.earlyPencilers.length / 2
      );
      runTest(
        '"exactly" integer',
        { mode: 'exactly', threshold: 2 },
        u => u.earlyPencilers.filter(n => n.lastName.includes('S')).length === 2
      );
      runTest(
        '"exactly" decimal',
        { mode: 'exactly', threshold: 0.5 },
        u =>
          u.earlyPencilers.filter(n => n.lastName.includes('S')).length ===
          u.earlyPencilers.length / 2
      );
    });
  });
});
