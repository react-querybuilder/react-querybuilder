import type { RuleGroupType, RuleGroupTypeIC, RuleProcessor } from '../../types/index.noReact';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { formatQuery } from './formatQuery';
import { query, queryWithValueSourceField } from './formatQueryTestUtils';

const elasticSearchQueryObject = {
  bool: {
    must: [
      { bool: { must_not: { exists: { field: 'firstName' } } } },
      { exists: { field: 'lastName' } },
      { bool: { should: [{ term: { firstName: 'Test' } }, { term: { firstName: 'This' } }] } },
      { bool: { must_not: [{ term: { lastName: 'Test' } }, { term: { lastName: 'This' } }] } },
      { range: { firstName: { gte: 'Test', lte: 'This' } } },
      { range: { firstName: { gte: 'Test', lte: 'This' } } },
      { bool: { must_not: { range: { lastName: { gte: 'Test', lte: 'This' } } } } },
      { range: { age: { gte: 12, lte: 14 } } },
      { term: { age: '26' } },
      { term: { isMusician: true } },
      { term: { isLucky: false } },
      {
        bool: {
          must_not: {
            bool: {
              should: [
                { term: { gender: 'M' } },
                { bool: { must_not: { term: { job: 'Programmer' } } } },
                { regexp: { email: { value: '@' } } },
              ],
            },
          },
        },
      },
      {
        bool: {
          should: [
            { bool: { must_not: { regexp: { lastName: { value: 'ab' } } } } },
            { regexp: { job: { value: '^Prog' } } },
            { regexp: { email: { value: 'com$' } } },
            { bool: { must_not: { regexp: { job: { value: '^Man' } } } } },
            { bool: { must_not: { regexp: { email: { value: 'fr$' } } } } },
          ],
        },
      },
    ],
  },
};
const elasticSearchQueryObjectForValueSourceField = {
  bool: {
    must: [
      { bool: { must_not: { exists: { field: 'firstName' } } } },
      { exists: { field: 'lastName' } },
      {
        bool: {
          should: [
            { bool: { filter: { script: { script: `doc['firstName'] == doc['middleName']` } } } },
            { bool: { filter: { script: { script: `doc['firstName'] == doc['lastName']` } } } },
          ],
        },
      },
      {
        bool: {
          must_not: [
            { bool: { filter: { script: { script: `doc['lastName'] == doc['middleName']` } } } },
            { bool: { filter: { script: { script: `doc['lastName'] == doc['lastName']` } } } },
          ],
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `doc['firstName'] >= doc['middleName'] && doc['firstName'] <= doc['lastName']`,
            },
          },
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `doc['firstName'] >= doc['middleName'] && doc['firstName'] <= doc['lastName']`,
            },
          },
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `!(doc['lastName'] >= doc['middleName'] && doc['lastName'] <= doc['lastName'])`,
            },
          },
        },
      },
      { bool: { filter: { script: { script: `doc['age'] == doc['iq']` } } } },
      { bool: { filter: { script: { script: `doc['isMusician'] == doc['isCreative']` } } } },
      {
        bool: {
          must_not: {
            bool: {
              should: [
                { bool: { filter: { script: { script: `doc['gender'] == doc['someLetter']` } } } },
                { bool: { filter: { script: { script: `doc['job'] != doc['isBetweenJobs']` } } } },
                {
                  bool: { filter: { script: { script: `doc['email'].contains(doc['atSign'])` } } },
                },
              ],
            },
          },
        },
      },
      {
        bool: {
          should: [
            {
              bool: {
                filter: { script: { script: `!doc['lastName'].contains(doc['firstName'])` } },
              },
            },
            { bool: { filter: { script: { script: `doc['job'].startsWith(doc['jobPrefix'])` } } } },
            { bool: { filter: { script: { script: `doc['email'].endsWith(doc['dotCom'])` } } } },
            { bool: { filter: { script: { script: `!doc['job'].startsWith(doc['hasNoJob'])` } } } },
            {
              bool: { filter: { script: { script: `!doc['email'].endsWith(doc['isInvalid'])` } } },
            },
          ],
        },
      },
    ],
  },
};

it('formats ElasticSearch correctly', () => {
  expect(formatQuery(query, 'elasticsearch')).toEqual(elasticSearchQueryObject);
  expect(formatQuery(queryWithValueSourceField, 'elasticsearch')).toEqual(
    elasticSearchQueryObjectForValueSourceField
  );
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          // combinator: 'and', not: true
          { combinator: 'and', not: true, rules: [{ field: 'f1', operator: '=', value: 'v1' }] },
          // Weird field names
          { field: "f\\'1", operator: 'contains', value: 'v1', valueSource: 'field' },
          // Ranges
          { field: 'f1', operator: '<', value: 0 },
          { field: 'f1', operator: '<=', value: 0 },
          { field: 'f1', operator: '>', value: 0 },
          { field: 'f1', operator: '>=', value: 0 },
          { field: 'f1', operator: 'between', value: [10, 1] },
          // Invalid operator
          { field: 'f1', operator: 'invalid', value: 'v1' },
          // Invalid value as field
          { field: 'f1', operator: 'invalid', value: ['v1', 0], valueSource: 'field' },
          { field: 'f1', operator: '=', value: '', valueSource: 'field' },
          { field: 'f1', operator: 'contains', value: '', valueSource: 'field' },
          // Empty group
          { combinator: 'or', rules: [] },
        ],
      },
      'elasticsearch'
    )
  ).toEqual({
    bool: {
      must: [
        { bool: { must_not: [{ term: { f1: 'v1' } }] } },
        { bool: { filter: { script: { script: `doc['f\\\\\\'1'].contains(doc['v1'])` } } } },
        { range: { f1: { lt: 0 } } },
        { range: { f1: { lte: 0 } } },
        { range: { f1: { gt: 0 } } },
        { range: { f1: { gte: 0 } } },
        { range: { f1: { gte: 1, lte: 10 } } },
      ],
    },
  });
});

describe('independent combinators', () => {
  const queryIC: RuleGroupTypeIC = {
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      'and',
      { field: 'middleName', operator: '=', value: 'Test' },
      'or',
      { field: 'lastName', operator: '=', value: 'Test' },
    ],
  };

  it('handles independent combinators for elasticsearch', () => {
    expect(formatQuery(queryIC, 'elasticsearch')).toEqual({
      bool: {
        should: [
          {
            bool: {
              must: [{ term: { firstName: 'Test' } }, { term: { middleName: 'Test' } }],
            },
          },
          { term: { lastName: 'Test' } },
        ],
      },
    });
  });
});

describe('validation', () => {
  describe('elasticsearch', () => {
    it('should invalidate a elasticsearch query', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'elasticsearch', validator: () => false }
        )
      ).toEqual({});
    });

    it('should invalidate a elasticsearch rule', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [
              { field: 'field', operator: '=', value: '' },
              { field: 'otherfield', operator: '=', value: '' },
            ],
          },
          {
            format: 'elasticsearch',
            fields: [{ name: 'field', label: 'field', validator: () => false }],
          }
        )
      ).toEqual({ bool: { must: [{ term: { otherfield: '' } }] } });
    });

    it('should invalidate elasticsearch even if fields are valid', () => {
      expect(
        formatQuery(
          {
            id: 'root',
            combinator: 'and',
            rules: [{ field: 'field', operator: '=', value: '' }],
          },
          {
            format: 'elasticsearch',
            validator: () => false,
            fields: [{ name: 'field', label: 'field', validator: () => true }],
          }
        )
      ).toEqual({});
    });

    it('should invalidate elasticsearch outermost group', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [] },
          { format: 'elasticsearch', validator: () => ({ root: false }) }
        )
      ).toEqual({});
    });

    it('should invalidate elasticsearch inner group', () => {
      expect(
        formatQuery(
          { id: 'root', combinator: 'and', rules: [{ id: 'inner', combinator: 'and', rules: [] }] },
          { format: 'elasticsearch', validator: () => ({ inner: false }) }
        )
      ).toEqual({});
    });
  });
});

describe('ruleProcessor', () => {
  const queryForRuleProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f1', operator: 'custom_operator', value: 'v1' },
      { field: 'f2', operator: '=', value: 'v2' },
    ],
  };

  it('handles custom ElasticSearch rule processor', () => {
    const customResult = { bool: { must: [{ term: { custom: 'custom' } }] } };
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? customResult : defaultRuleProcessorElasticSearch(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'elasticsearch', ruleProcessor })).toEqual({
      bool: { must: [customResult, { term: { f2: 'v2' } }] },
    });
    expect(
      formatQuery(queryForRuleProcessor, { format: 'elasticsearch', valueProcessor: ruleProcessor })
    ).toEqual({
      bool: { must: [customResult, { term: { f2: 'v2' } }] },
    });
  });
});

describe('parseNumbers', () => {
  const queryForNumberParsing: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'f', operator: '>', value: 'NaN' },
      { field: 'f', operator: '=', value: '0' },
      { field: 'f', operator: '=', value: '    0    ' },
      { field: 'f', operator: '=', value: 0 },
      {
        combinator: 'or',
        rules: [
          { field: 'f', operator: '<', value: '1.5' },
          { field: 'f', operator: '>', value: 1.5 },
        ],
      },
      { field: 'f', operator: 'in', value: '0, 1, 2' },
      { field: 'f', operator: 'in', value: [0, 1, 2] },
      { field: 'f', operator: 'in', value: '0, abc, 2' },
      { field: 'f', operator: 'between', value: '0, 1' },
      { field: 'f', operator: 'between', value: [0, 1] },
      { field: 'f', operator: 'between', value: '0, abc' },
      { field: 'f', operator: 'between', value: '1' },
      { field: 'f', operator: 'between', value: 1 },
      { field: 'f', operator: 'between', value: [1] },
      { field: 'f', operator: 'between', value: [{}, {}] },
    ],
  };

  it('parses numbers for elasticsearch', () => {
    expect(
      formatQuery(queryForNumberParsing, {
        format: 'elasticsearch',
        parseNumbers: true,
      })
    ).toEqual({
      bool: {
        must: [
          { range: { f: { gt: 'NaN' } } },
          { term: { f: 0 } },
          { term: { f: 0 } },
          { term: { f: 0 } },
          { bool: { should: [{ range: { f: { lt: 1.5 } } }, { range: { f: { gt: 1.5 } } }] } },
          { bool: { should: [{ term: { f: 0 } }, { term: { f: 1 } }, { term: { f: 2 } }] } },
          { bool: { should: [{ term: { f: 0 } }, { term: { f: 1 } }, { term: { f: 2 } }] } },
          { bool: { should: [{ term: { f: 0 } }, { term: { f: 'abc' } }, { term: { f: 2 } }] } },
          { range: { f: { gte: 0, lte: 1 } } },
          { range: { f: { gte: 0, lte: 1 } } },
          { range: { f: { gte: '0', lte: 'abc' } } },
          { range: { f: { gte: {}, lte: {} } } },
        ],
      },
    });
  });
});
