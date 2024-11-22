/* eslint-disable unicorn/prefer-structured-clone */
import type { RuleGroupType } from 'react-querybuilder';
import { formatQuery } from 'react-querybuilder';
import { getDatetimeRuleProcessorMongoDBQuery } from './datetimeRuleProcessorMongoDBQuery';
import { dateLibraryFunctions, fields } from './dbqueryTestUtils';

const now = new Date().toISOString();
const d = (s: string) => `${s}T00:00:00.000Z`;

const testCases: Record<string, [RuleGroupType, Record<string, unknown>]> = {
  valid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: '>', value: d('1957-01-01') },
        { field: 'birthdate', operator: 'between', value: [d('1957-01-01'), d('1969-01-01')] },
        { field: 'birthdate', operator: 'notBetween', value: [d('1969-01-01'), d('1957-01-01')] },
        { field: 'birthdate', operator: 'in', value: [d('1954-10-03'), d('1960-06-06')] },
        { field: 'created_at', operator: '<', value: now },
      ],
    },
    {
      $and: [
        { birthdate: { $gt: d('1957-01-01') } },
        { birthdate: { $gte: d('1957-01-01'), $lte: d('1969-01-01') } },
        { $or: [{ birthdate: { $lt: d('1957-01-01') } }, { birthdate: { $gt: d('1969-01-01') } }] },
        { birthdate: { $in: [d('1954-10-03'), d('1960-06-06')] } },
        { created_at: { $lt: now } },
      ],
    },
  ],
  fallback: [
    {
      combinator: 'and',
      rules: [
        { field: 'firstName', operator: '!=', value: 'lastName', valueSource: 'field' },
        { field: 'firstName', operator: 'beginsWith', value: 'Stev' },
      ],
    },
    {
      $and: [{ $expr: { $ne: ['$firstName', '$lastName'] } }, { firstName: { $regex: `^Stev` } }],
    },
  ],
  invalid: [
    {
      combinator: 'and',
      rules: [
        { field: 'birthdate', operator: 'between', value: d('1957-01-01') },
        { field: 'birthdate', operator: 'in', value: 'Stev' },
        { field: 'birthdate', operator: 'contains', value: 'Stev' },
      ],
    },
    { $and: [{ birthdate: { $in: [] } }, { birthdate: { $regex: 'Stev' } }] },
  ],
};

for (const [libName, apiFns] of dateLibraryFunctions) {
  describe(libName, () => {
    const ruleProcessor = getDatetimeRuleProcessorMongoDBQuery(apiFns);

    // Common tests
    for (const [testCase, [query, expected]] of Object.entries(testCases)) {
      test(testCase, () => {
        expect(
          // JSON.stringify converts Date objects to ISO 8601 UTC strings, which makes it
          // easy to convert all Date values to strings for simpler comparison. Then we can
          // parse it back to an object in order to use `.toEqual` instead of comparing
          // JSON.stringify results that may be differ even when the objects match.
          JSON.parse(
            JSON.stringify(
              formatQuery(query, {
                format: 'mongodb_query',
                fields,
                ruleProcessor,
              })
            )
          )
        ).toEqual(expected);
      });
    }

    // MongoDBQuery-specific tests
    it('produces real Date objects', () => {
      const query: RuleGroupType = {
        combinator: 'and',
        rules: [
          { field: 'birthdate', operator: '=', value: '2002-12-14' },
          { field: 'birthdate', operator: '>', value: '2002-12-14' },
          { field: 'birthdate', operator: 'between', value: ['1954-10-03', '1960-06-06'] },
          { field: 'birthdate', operator: 'in', value: ['1954-10-03', '1960-06-06'] },
        ],
      };
      const mdbQuery = formatQuery(query, {
        format: 'mongodb_query',
        fields,
        ruleProcessor,
      });
      expect(mdbQuery.$and[0].birthdate).toBeInstanceOf(Date);
      expect(mdbQuery.$and[1].birthdate.$gt).toBeInstanceOf(Date);
      expect(mdbQuery.$and[2].birthdate.$gte).toBeInstanceOf(Date);
      expect(mdbQuery.$and[2].birthdate.$lte).toBeInstanceOf(Date);
      for (const d of mdbQuery.$and[3].birthdate.$in) {
        expect(d).toBeInstanceOf(Date);
      }
    });
  });
}
