import { formatQuery } from '../formatQuery';
import type { TestSQLParams } from '../dbqueryTestUtils';
import { superUsers, dbTests } from '../dbqueryTestUtils';
import { add_operation, apply } from 'json-logic-js';
import { jsonLogicAdditionalOperators } from '../utils';

const superUsersJsonLogic = superUsers('jsonlogic');

const nicknameMap: Record<string, string[]> = {
  Batman: ['The Caped Crusader'],
  Superman: ['The Man of Steel', 'The Last Son of Krypton'],
  'Spider-Man': ['Web-Slinger', 'Menace to Society'],
  'Captain America': ['The First Avenger'],
};

const augmentedSuperUsers = superUsersJsonLogic.map(u => ({
  ...u,
  nicknames: [u.nickname, ...nicknameMap[u.madeUpName]],
}));

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
    testJsonLogic(
      '"all"',
      {
        query: {
          combinator: 'and',
          rules: [{ field: 'nicknames', operator: 'contains', value: 'S', matchMode: 'all' }],
        },
        expectedResult: augmentedSuperUsers.filter(u => u.nicknames.every(n => n.includes('S'))),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"none"',
      {
        query: {
          combinator: 'and',
          rules: [{ field: 'nicknames', operator: 'contains', value: 'S', matchMode: 'none' }],
        },
        expectedResult: augmentedSuperUsers.filter(u => u.nicknames.every(n => !n.includes('S'))),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"some"',
      {
        query: {
          combinator: 'and',
          rules: [{ field: 'nicknames', operator: 'contains', value: 'S', matchMode: 'some' }],
        },
        expectedResult: augmentedSuperUsers.filter(u => u.nicknames.some(n => n.includes('S'))),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"none" as atMost 0',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atMost', 0] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(u => u.nicknames.every(n => !n.includes('S'))),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"some" as atLeast 1',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atLeast', 1] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(u => u.nicknames.some(n => n.includes('S'))),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"atLeast" integer',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atLeast', 2] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length >= 2
        ),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"atLeast" decimal',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atLeast', 0.5] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length >= u.nicknames.length / 2
        ),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"atMost" integer',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atMost', 2] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length <= 2
        ),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"atMost" decimal',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['atMost', 0.5] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length <= u.nicknames.length / 2
        ),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"exactly" integer',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['exactly', 2] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length === 2
        ),
      },
      augmentedSuperUsers
    );
    testJsonLogic(
      '"exactly" decimal',
      {
        query: {
          combinator: 'and',
          rules: [
            { field: 'nicknames', operator: 'contains', value: 'S', matchMode: ['exactly', 0.5] },
          ],
        },
        expectedResult: augmentedSuperUsers.filter(
          u => u.nicknames.filter(n => n.includes('S')).length === u.nicknames.length / 2
        ),
      },
      augmentedSuperUsers
    );
  });
});
