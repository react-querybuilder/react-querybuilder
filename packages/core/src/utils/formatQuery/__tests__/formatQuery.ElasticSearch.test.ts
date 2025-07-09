import type { FormatQueryOptions, RuleGroupType, RuleProcessor } from '../../../types';
import { defaultRuleProcessorElasticSearch } from '../defaultRuleProcessorElasticSearch';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  query,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryForRuleProcessor,
  queryIC,
  queryWithValueSourceField,
} from '../formatQueryTestUtils';

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
                { regexp: { email: { value: '.*@.*' } } },
              ],
            },
          },
        },
      },
      {
        bool: {
          should: [
            { bool: { must_not: { regexp: { lastName: { value: '.*ab.*' } } } } },
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
            {
              bool: {
                filter: { script: { script: `doc['firstName'].value == doc['middleName'].value` } },
              },
            },
            {
              bool: {
                filter: { script: { script: `doc['firstName'].value == doc['lastName'].value` } },
              },
            },
          ],
        },
      },
      {
        bool: {
          must_not: [
            {
              bool: {
                filter: { script: { script: `doc['lastName'].value == doc['middleName'].value` } },
              },
            },
            {
              bool: {
                filter: { script: { script: `doc['lastName'].value == doc['lastName'].value` } },
              },
            },
          ],
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `doc['firstName'].value >= doc['middleName'].value && doc['firstName'].value <= doc['lastName'].value`,
            },
          },
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `doc['firstName'].value >= doc['middleName'].value && doc['firstName'].value <= doc['lastName'].value`,
            },
          },
        },
      },
      {
        bool: {
          filter: {
            script: {
              script: `!(doc['lastName'].value >= doc['middleName'].value && doc['lastName'].value <= doc['lastName'].value)`,
            },
          },
        },
      },
      { bool: { filter: { script: { script: `doc['age'].value == doc['iq'].value` } } } },
      {
        bool: {
          filter: { script: { script: `doc['isMusician'].value == doc['isCreative'].value` } },
        },
      },
      {
        bool: {
          must_not: {
            bool: {
              should: [
                {
                  bool: {
                    filter: {
                      script: { script: `doc['gender'].value == doc['someLetter'].value` },
                    },
                  },
                },
                {
                  bool: {
                    filter: {
                      script: { script: `doc['job'].value != doc['isBetweenJobs'].value` },
                    },
                  },
                },
                {
                  bool: {
                    filter: {
                      script: { script: `doc['email'].value.contains(doc['atSign'].value)` },
                    },
                  },
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
                filter: {
                  script: { script: `!doc['lastName'].value.contains(doc['firstName'].value)` },
                },
              },
            },
            {
              bool: {
                filter: {
                  script: { script: `doc['job'].value.startsWith(doc['jobPrefix'].value)` },
                },
              },
            },
            {
              bool: {
                filter: { script: { script: `doc['email'].value.endsWith(doc['dotCom'].value)` } },
              },
            },
            {
              bool: {
                filter: {
                  script: { script: `!doc['job'].value.startsWith(doc['hasNoJob'].value)` },
                },
              },
            },
            {
              bool: {
                filter: {
                  script: { script: `!doc['email'].value.endsWith(doc['isInvalid'].value)` },
                },
              },
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
          { field: String.raw`f\'1`, operator: 'contains', value: 'v1', valueSource: 'field' },
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
          // Match mode
          {
            field: 'f1',
            operator: 'contains',
            value: { combinator: 'and', rules: [] },
            match: { mode: 'all' },
          },
        ],
      },
      'elasticsearch'
    )
  ).toEqual({
    bool: {
      must: [
        { bool: { must_not: [{ term: { f1: 'v1' } }] } },
        {
          bool: {
            filter: { script: { script: `doc['f\\\\\\'1'].value.contains(doc['v1'].value)` } },
          },
        },
        { range: { f1: { lt: 0 } } },
        { range: { f1: { lte: 0 } } },
        { range: { f1: { gt: 0 } } },
        { range: { f1: { gte: 0 } } },
        { range: { f1: { gte: 1, lte: 10 } } },
      ],
    },
  });
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'elasticsearch')).toEqual(
    formatQuery(queryAllOperatorsRandomCase, 'elasticsearch')
  );
});

it('independent combinators', () => {
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

describe('validation', () => {
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
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
      });
    }
  }
});

it('ruleProcessor', () => {
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

it.each([
  ['true', { parseNumbers: true }],
  ['strict', { parseNumbers: 'strict' }],
  [
    'strict-limited',
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ],
] satisfies [string, FormatQueryOptions][])('parses numbers (%s)', (_, opts) => {
  const allNumbersParsed = {
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
  };
  expect(formatQuery(queryForNumberParsing, { ...opts, format: 'elasticsearch' })).toEqual(
    allNumbersParsed
  );
});
it('preserveValueOrder', () => {
  expect(
    formatQuery(queryForPreserveValueOrder, { format: 'elasticsearch', parseNumbers: true })
  ).toEqual({
    bool: {
      must: [{ range: { f1: { gte: 12, lte: 14 } } }, { range: { f2: { gte: 12, lte: 14 } } }],
    },
  });
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'elasticsearch',
      parseNumbers: true,
      preserveValueOrder: true,
    })
  ).toEqual({
    bool: {
      must: [{ range: { f1: { gte: 12, lte: 14 } } }, { range: { f2: { gte: 14, lte: 12 } } }],
    },
  });
});

it('parseNumbers with between operators', () => {
  const betweenQuery: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'age', operator: 'between', value: '22,34' },
      { field: 'score', operator: 'notBetween', value: ['10', '20'] },
    ],
  };

  // Default behavior (backwards compatibility) - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'elasticsearch' })).toEqual({
    bool: {
      must: [
        { range: { age: { gte: 22, lte: 34 } } },
        { bool: { must_not: { range: { score: { gte: 10, lte: 20 } } } } },
      ],
    },
  });

  // Explicit parseNumbers: true - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'elasticsearch', parseNumbers: true })).toEqual({
    bool: {
      must: [
        { range: { age: { gte: 22, lte: 34 } } },
        { bool: { must_not: { range: { score: { gte: 10, lte: 20 } } } } },
      ],
    },
  });

  // parseNumbers: false - should NOT parse numbers (keep as strings)
  expect(formatQuery(betweenQuery, { format: 'elasticsearch', parseNumbers: false })).toEqual({
    bool: {
      must: [
        { range: { age: { gte: '22', lte: '34' } } },
        { bool: { must_not: { range: { score: { gte: '10', lte: '20' } } } } },
      ],
    },
  });
});
