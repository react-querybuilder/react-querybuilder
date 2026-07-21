import { spel2jsEvaluator } from '../../../../../../utils/spel-evaluator/spel2jsEvaluator';
import type { DefaultRuleGroupType } from '../../../types';
import { transformQuery } from '../../transformQuery';
import {
  augmentedSuperUsers,
  dbTests,
  genObjectsMatchQuery,
  genStringsMatchQuery,
  matchModeTests,
  superUsers,
} from '../dbqueryTestUtils';
import { formatQuery } from '../formatQuery';

// Rewrites field (and field-source value) references to SpEL `#root['field']` map-indexer syntax.
// `#root['field']` resolves against the record root in both spel2js and real Spring SpEL; bare
// `['field']` does not resolve in spel2js. transformQuery does not recurse into match-mode value
// subqueries, so nested filter fields (relative to `#this`) are left untouched.
const toIndexerSyntax = (query: DefaultRuleGroupType) =>
  transformQuery(query, {
    ruleProcessor: r => ({
      ...r,
      field: `#root['${r.field}']`,
      ...(r.valueSource === 'field' ? { value: `#root['${r.value}']` } : {}),
    }),
  });

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
    for (const [name, { query: originalQuery, expectedResult, fqOptions }] of Object.entries(
      dbTests(data)
      // spel2js doesn't handle nulls the same as real SpEL yet
    ).filter(([testName]) => testName !== 'null/notNull')) {
      const query = toIndexerSyntax(originalQuery);
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
      const query = toIndexerSyntax(genStringsMatchQuery(mm));
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
      const query = toIndexerSyntax(genObjectsMatchQuery(mm));
      test(name, async () => {
        const spel = formatQuery(query, { format: 'spel', parseNumbers: true });
        const result = await spel2jsEvaluator({ data, spel, typemap: augmentedTypemap });
        const expectedResult = data.filter(fn);
        expect(result).toEqual(expectedResult);
      });
    }
  });
});
