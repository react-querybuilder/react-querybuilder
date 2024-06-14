import type { RuleProcessor } from '../../types/index.noReact';
import { defaultRuleProcessorElasticSearch } from './defaultRuleProcessorElasticSearch';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  query,
  queryForNumberParsing,
  queryForRuleProcessor,
  queryIC,
  queryWithValueSourceField,
} from './formatQueryTestUtils';

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
            { regexp: { job: { value: 'Prog.*' } } },
            { regexp: { email: { value: '.*com' } } },
            { bool: { must_not: { regexp: { job: { value: 'Man.*' } } } } },
            { bool: { must_not: { regexp: { email: { value: '.*fr' } } } } },
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
    const validationResults: Record<string, object> = {
      'should invalidate elasticsearch': {},
      'should invalidate elasticsearch even if fields are valid': {},
      'should invalidate elasticsearch rule by validator function': {
        bool: { must: [{ term: { field2: '' } }] },
      },
      'should invalidate elasticsearch rule specified by validationMap': {
        bool: { must: [{ term: { field2: '' } }] },
      },
      'should invalidate elasticsearch outermost group': {},
      'should invalidate elasticsearch inner group': {},
      'should convert elasticsearch inner group with no rules to fallbackExpression': {
        bool: { must: [{ term: { field: '' } }] },
      },
    };

    for (const vtd of getValidationTestData('elasticsearch')) {
      if (typeof validationResults[vtd.title] !== 'undefined') {
        it(vtd.title, () => {
          expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
        });
      }
    }
  });
});

describe('ruleProcessor', () => {
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
