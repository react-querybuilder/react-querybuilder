import { add_operation, apply } from 'json-logic-js';
import type { DefaultRuleGroupType, MatchConfig } from '../../../types';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { augmentedSuperUsers, dbTests, superUsers } from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';
import { jsonLogicAdditionalOperators } from '../utils';

const superUsersJsonLogic = superUsers('jsonlogic');

const augmentedSuperUsersJsonLogic = augmentedSuperUsers('jsonlogic');

for (const [op, func] of Object.entries(jsonLogicAdditionalOperators)) {
  add_operation(op, func);
}

const testJsonLogic = (
  name: string,
  { query, expectedResult, expectedResultCoercedNull, fqOptions }: TestSQLParams,
  data = superUsersJsonLogic
) => {
  test(name, async () => {
    const jsonlogic = formatQuery(query, { ...fqOptions, format: 'jsonlogic' });
    expect(data.filter(u => apply(jsonlogic, u))).toEqual(
      expectedResultCoercedNull ?? expectedResult
    );
  });
};

describe('JsonLogic', () => {
  // Common tests
  for (const [name, t] of Object.entries(dbTests(superUsersJsonLogic))) {
    testJsonLogic(name, t);
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
        filterFn: (u: (typeof augmentedSuperUsersJsonLogic)[number]) => boolean
      ) => {
        testJsonLogic(
          name,
          {
            query: genQuery(matchConfig),
            expectedResult: augmentedSuperUsersJsonLogic.filter(u => filterFn(u)),
          },
          augmentedSuperUsersJsonLogic
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
        filterFn: (u: (typeof augmentedSuperUsersJsonLogic)[number]) => boolean
      ) => {
        testJsonLogic(
          name,
          {
            query: genQuery(matchConfig),
            expectedResult: augmentedSuperUsersJsonLogic.filter(u => filterFn(u)),
          },
          augmentedSuperUsersJsonLogic
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
