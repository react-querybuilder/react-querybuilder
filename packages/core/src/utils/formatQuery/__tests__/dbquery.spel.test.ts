import { spel2jsEvaluator } from '../../../../../../utils/spel-evaluator/spel2jsEvaluator';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// spel2js resolves the bare field identifiers that `formatQuery('spel')` emits by default against
// the record root, so no `#root['field']` rewrite is needed (matching the Java backend).

const typemap = {
  firstName: 'string',
  lastName: 'string',
  enhanced: 'boolean',
  madeUpName: 'string',
  nickname: 'string',
  powerUpAge: 'number',
};
const augmentedTypemap = { ...typemap, nicknames: 'list', earlyPencilers: 'list' };

describe('SpEL (spel2js)', () => {
  describe('common', () => {
    const data = superUsers('spel');
    for (const [name, { query, expectedResult, fqOptions }] of Object.entries(
      dbTests(data)
      // spel2js doesn't handle nulls the same as real SpEL yet
    ).filter(([testName]) => testName !== 'null/notNull')) {
      test(name, async () => {
        const spel = formatQuery(query, { format: 'spel', parseNumbers: true, ...fqOptions });
        const result = await spel2jsEvaluator({ data, spel, typemap });
        expect(result).toEqual(expectedResult);
      });
    }
  });

  describe('match modes (strings)', () => {
    const data = augmentedSuperUsers('spel').map(u =>
      Object.fromEntries(Object.entries(u).filter(([k]) => !k.startsWith('early')))
    );
    for (const [name, mm, fn] of matchModeTests.strings) {
      const query = genStringsMatchQuery(mm);
      test(name, async () => {
        const spel = formatQuery(query, { format: 'spel', parseNumbers: true });
        const result = await spel2jsEvaluator({ data, spel, typemap: augmentedTypemap });
        // oxlint-disable-next-line typescript/no-explicit-any
        const expectedResult = data.filter((d: any) => fn(d));
        expect(result).toEqual(expectedResult);
      });
    }
  });

  describe('match modes (objects)', () => {
    const data = augmentedSuperUsers('spel');
    for (const [name, mm, fn] of matchModeTests.objects) {
      const query = genObjectsMatchQuery(mm);
      test(name, async () => {
        const spel = formatQuery(query, { format: 'spel', parseNumbers: true });
        const result = await spel2jsEvaluator({ data, spel, typemap: augmentedTypemap });
        const expectedResult = data.filter(fn);
        expect(result).toEqual(expectedResult);
      });
    }
  });
});
