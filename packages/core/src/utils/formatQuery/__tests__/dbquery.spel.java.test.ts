import { verifySpELEvaluator } from '../../../../../../utils/spel-evaluator/verifySpELEvaluator';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Real Spring/Java SpEL backend. Runs alongside the spel2js suite. Uses the default
// `formatQuery('spel')` output (bare field identifiers) - no `#root['field']` indexer rewrite -
// resolved against each record Map via the Java MapAccessor. Because the accessor treats a missing
// key as unreadable (row skipped) and a present-but-null value as null, real Spring matches the
// spel2js null semantics, so the `null/notNull` case is included here.

const spelEvaluator = await verifySpELEvaluator();

const typemap = {
  firstName: 'string',
  lastName: 'string',
  enhanced: 'boolean',
  madeUpName: 'string',
  nickname: 'string',
  powerUpAge: 'number',
};
const augmentedTypemap = { ...typemap, nicknames: 'list', earlyPencilers: 'list' };

if (spelEvaluator) {
  describe('SpEL (Java)', () => {
    describe('common', () => {
      const data = superUsers('spel');
      for (const [name, { query, expectedResult, fqOptions }] of Object.entries(dbTests(data))) {
        test(name, async () => {
          const spel = formatQuery(query, { format: 'spel', parseNumbers: true, ...fqOptions });
          const result = await spelEvaluator({ data, spel, typemap });
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
          const result = await spelEvaluator({ data, spel, typemap: augmentedTypemap });
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
          const result = await spelEvaluator({ data, spel, typemap: augmentedTypemap });
          const expectedResult = data.filter(fn);
          expect(result).toEqual(expectedResult);
        });
      }
    });
  });
}
