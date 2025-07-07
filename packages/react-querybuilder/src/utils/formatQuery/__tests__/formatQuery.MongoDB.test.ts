import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
} from '../../../types/index.noReact';
import { defaultRuleProcessorMongoDB } from '../defaultRuleProcessorMongoDB';
import { defaultRuleProcessorMongoDBQuery } from '../defaultRuleProcessorMongoDBQuery';
import { formatQuery } from '../formatQuery';
import {
  getValidationTestData,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForPreserveValueOrder,
  queryForRuleProcessor,
  queryIC,
  queryWithMatchModes,
  testQueryDQ,
} from '../formatQueryTestUtils';
import { defaultMongoDBValueProcessor } from '../index';

const testBoth = (
  query: RuleGroupTypeAny,
  expectation: unknown,
  fqOptions?: FormatQueryOptions
) => {
  testMongoDB(query, expectation, fqOptions);
  testMongoDBQuery(query, expectation, fqOptions);
};
const testMongoDB = (
  query: RuleGroupTypeAny,
  expectation: unknown,
  fqOptions?: FormatQueryOptions
) => {
  expect(JSON.parse(formatQuery(query, { ...fqOptions, format: 'mongodb' }))).toEqual(expectation);
};
const testMongoDBQuery = (
  query: RuleGroupTypeAny,
  expectation: unknown,
  fqOptions?: FormatQueryOptions
) => {
  expect(formatQuery(query, { ...fqOptions, format: 'mongodb_query' })).toEqual(expectation);
};

const mongoQuery: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    { field: '~', operator: '~', value: 'Placeholder' },
    { field: '~', operator: '=', value: 'Placeholder' },
    { field: 'firstName', operator: '~', value: 'Placeholder' },
    { field: 'invalid', value: '', operator: 'invalid' },
    { field: 'firstName', value: '', operator: 'null' },
    { field: 'lastName', value: '', operator: 'notNull' },
    { field: 'firstName', value: 'Test,This', operator: 'in' },
    { field: 'lastName', value: 'Test,This', operator: 'notIn' },
    { field: 'firstName', value: false, operator: 'in' },
    { field: 'firstName', value: 'Test,This', operator: 'between' },
    { field: 'firstName', value: ['Test', 'This'], operator: 'between' },
    { field: 'lastName', value: 'Test,This', operator: 'notBetween' },
    { field: 'firstName', value: '', operator: 'between' },
    { field: 'firstName', value: false, operator: 'between' },
    { field: 'age', value: '12,14', operator: 'between' },
    { field: 'age', value: '26', operator: '=' },
    { field: 'isMusician', value: true, operator: '=' },
    { field: 'isLucky', value: false, operator: '=' },
    { field: 'email', value: '@', operator: 'contains' },
    { field: 'email', value: 'ab', operator: 'beginsWith' },
    { field: 'email', value: 'com', operator: 'endsWith' },
    { field: 'hello', value: 'com', operator: 'doesNotContain' },
    { field: 'job', value: 'Man', operator: 'doesNotBeginWith' },
    { field: 'job', value: 'ger', operator: 'doesNotEndWith' },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        { field: 'job', value: 'Sales Executive', operator: '=' },
        { field: 'job', value: [], operator: 'in' },
        { field: 'job', value: ['just one value'], operator: 'between' },
      ],
      not: false,
    },
  ],
  not: false,
};
const mongoQueryWithValueSourceField: RuleGroupType = {
  id: 'g-root',
  combinator: 'and',
  rules: [
    { field: 'invalid', operator: 'invalid', value: '', valueSource: 'field' },
    { field: 'firstName', operator: 'null', value: '', valueSource: 'field' },
    { field: 'lastName', operator: 'notNull', value: '', valueSource: 'field' },
    { field: 'firstName', operator: 'in', value: 'middleName,lastName', valueSource: 'field' },
    { field: 'lastName', operator: 'notIn', value: 'middleName,lastName', valueSource: 'field' },
    { field: 'firstName', operator: 'in', value: false, valueSource: 'field' },
    { field: 'firstName', operator: 'between', value: 'middleName,lastName', valueSource: 'field' },
    {
      field: 'firstName',
      operator: 'between',
      value: ['middleName', 'lastName'],
      valueSource: 'field',
    },
    {
      field: 'lastName',
      operator: 'notBetween',
      value: 'middleName,lastName',
      valueSource: 'field',
    },
    { field: 'firstName', operator: 'between', value: '', valueSource: 'field' },
    { field: 'firstName', operator: 'between', value: false, valueSource: 'field' },
    { field: 'age', operator: '=', value: 'iq', valueSource: 'field' },
    { field: 'isMusician', operator: '=', value: 'isCreative', valueSource: 'field' },
    { field: 'email', operator: 'contains', value: 'atSign', valueSource: 'field' },
    { field: 'email', operator: 'beginsWith', value: 'name', valueSource: 'field' },
    { field: 'email', operator: 'endsWith', value: 'dotCom', valueSource: 'field' },
    { field: 'hello', operator: 'doesNotContain', value: 'dotCom', valueSource: 'field' },
    { field: 'job', operator: 'doesNotBeginWith', value: 'noJob', valueSource: 'field' },
    { field: 'job', operator: 'doesNotEndWith', value: 'noJob', valueSource: 'field' },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [{ field: 'job', operator: '=', value: 'executiveJobName', valueSource: 'field' }],
      not: false,
    },
  ],
  not: false,
};
const mongoQueryExpectation = {
  $and: [
    { firstName: null },
    { lastName: { $ne: null } },
    { firstName: { $in: ['Test', 'This'] } },
    { lastName: { $nin: ['Test', 'This'] } },
    { firstName: { $in: [] } },
    { firstName: { $gte: 'Test', $lte: 'This' } },
    { firstName: { $gte: 'Test', $lte: 'This' } },
    { $or: [{ lastName: { $lt: 'Test' } }, { lastName: { $gt: 'This' } }] },
    { age: { $gte: 12, $lte: 14 } },
    { age: '26' },
    { isMusician: true },
    { isLucky: false },
    { email: { $regex: '@' } },
    { email: { $regex: '^ab' } },
    { email: { $regex: 'com$' } },
    { hello: { $not: { $regex: 'com' } } },
    { job: { $not: { $regex: '^Man' } } },
    { job: { $not: { $regex: 'ger$' } } },
    {
      $or: [{ job: 'Sales Executive' }, { job: { $in: [] } }],
    },
  ],
};
const mongoQueryExpectationForAvoidFieldsAsKeys = {
  $and: [
    { $eq: ['$firstName', null] },
    { $ne: ['$lastName', null] },
    { $in: ['$firstName', ['Test', 'This']] },
    { $not: { $in: ['$lastName', ['Test', 'This']] } },
    { $in: ['$firstName', []] },
    { $and: [{ $gte: ['$firstName', 'Test'] }, { $lte: ['$firstName', 'This'] }] },
    { $and: [{ $gte: ['$firstName', 'Test'] }, { $lte: ['$firstName', 'This'] }] },
    { $or: [{ $lt: ['$lastName', 'Test'] }, { $gt: ['$lastName', 'This'] }] },
    { $and: [{ $gte: ['$age', 12] }, { $lte: ['$age', 14] }] },
    { $eq: ['$age', '26'] },
    { $eq: ['$isMusician', true] },
    { $eq: ['$isLucky', false] },
    { $regexMatch: { input: '$email', regex: '@' } },
    { $regexMatch: { input: '$email', regex: '^ab' } },
    { $regexMatch: { input: '$email', regex: 'com$' } },
    { $not: { $regexMatch: { input: '$hello', regex: 'com' } } },
    { $not: { $regexMatch: { input: '$job', regex: '^Man' } } },
    { $not: { $regexMatch: { input: '$job', regex: 'ger$' } } },
    {
      $or: [{ $eq: ['$job', 'Sales Executive'] }, { $in: ['$job', []] }],
    },
  ],
};
const mongoQueryExpectationForValueSourceField = {
  $and: [
    { firstName: null },
    { lastName: { $ne: null } },
    { $where: '[this.middleName,this.lastName].includes(this.firstName)' },
    { $where: '![this.middleName,this.lastName].includes(this.lastName)' },
    { $where: '[].includes(this.firstName)' },
    { $gte: ['$firstName', '$middleName'], $lte: ['$firstName', '$lastName'] },
    { $gte: ['$firstName', '$middleName'], $lte: ['$firstName', '$lastName'] },
    {
      $or: [{ $lt: ['$lastName', '$middleName'] }, { $gt: ['$lastName', '$lastName'] }],
    },
    { $eq: ['$age', '$iq'] },
    { $eq: ['$isMusician', '$isCreative'] },
    { $where: 'this.email.includes(this.atSign)' },
    { $where: 'this.email.startsWith(this.name)' },
    { $where: 'this.email.endsWith(this.dotCom)' },
    { $where: '!this.hello.includes(this.dotCom)' },
    { $where: '!this.job.startsWith(this.noJob)' },
    { $where: '!this.job.endsWith(this.noJob)' },
    { $eq: ['$job', '$executiveJobName'] },
  ],
};

const mongoQueryExpectationForMatchModes = {
  $and: [
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $size: { $ifNull: ['$fs', []] } },
        ],
      },
    },
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item.fv', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $size: { $ifNull: ['$fs', []] } },
        ],
      },
    },
    { $nor: [{ fs: { $regex: 'S' } }] },
    { fs: { $regex: 'S' } },
    { fs: { $regex: 'S' } },
    { $nor: [{ fs: { $regex: 'S' } }] },
    {
      $expr: {
        $gte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          2,
        ],
      },
    },
    {
      $expr: {
        $gte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item.fv', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          2,
        ],
      },
    },
    {
      $expr: {
        $gte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $multiply: [{ $size: { $ifNull: ['$fs', []] } }, 0.5] },
        ],
      },
    },
    {
      $expr: {
        $lte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          2,
        ],
      },
    },
    {
      $expr: {
        $lte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $multiply: [{ $size: { $ifNull: ['$fs', []] } }, 0.5] },
        ],
      },
    },
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          2,
        ],
      },
    },
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: { $and: [{ $regexMatch: { input: '$$item', regex: 'S' } }] },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $multiply: [{ $size: { $ifNull: ['$fs', []] } }, 0.5] },
        ],
      },
    },
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: {
                      $and: [
                        {
                          $and: [
                            { $regexMatch: { input: '$$item', regex: 'S' } },
                            { $regexMatch: { input: '$$item', regex: 'S' } },
                          ],
                        },
                      ],
                    },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $size: { $ifNull: ['$fs', []] } },
        ],
      },
    },
    {
      $expr: {
        $gte: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: {
                      $and: [
                        {
                          $and: [
                            { $regexMatch: { input: '$$item', regex: 'S' } },
                            { $regexMatch: { input: '$$item', regex: 'S' } },
                          ],
                        },
                      ],
                    },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          2,
        ],
      },
    },
  ],
};

// oxlint-disable-next-line expect-expect
it('formats to mongo query correctly', () => {
  testBoth(mongoQuery, mongoQueryExpectation);
  testBoth(mongoQuery, mongoQueryExpectationForAvoidFieldsAsKeys, {
    context: { avoidFieldsAsKeys: true },
  });
  testBoth(mongoQueryWithValueSourceField, mongoQueryExpectationForValueSourceField);
  // Test for newline in value
  testBoth(
    { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'value\nwith newline' }] },
    { f1: 'value\nwith newline' }
  );
  testMongoDB(mongoQueryWithValueSourceField, mongoQueryExpectationForValueSourceField, {
    format: 'mongodb',
    valueProcessor: defaultMongoDBValueProcessor,
  });
  testBoth(queryWithMatchModes, mongoQueryExpectationForMatchModes);
  // Just a coverage thing here:
  testBoth(
    {
      combinator: 'and',
      rules: [
        {
          field: 'fs',
          operator: '=',
          value: { combinator: 'and', rules: [{ field: '', operator: '>=', value: 12 }] },
          match: { mode: 'all' },
        },
      ],
    },
    {
      $expr: {
        $eq: [
          {
            $size: {
              $ifNull: [
                {
                  $filter: {
                    as: 'item',
                    cond: {
                      $and: [{ $and: [{ $ne: ['$$item', null] }, { $gte: ['$$item', 12] }] }],
                    },
                    input: '$fs',
                  },
                },
                [],
              ],
            },
          },
          { $size: { $ifNull: ['$fs', []] } },
        ],
      },
    }
  );
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'mongodb_query')).toEqual(
    formatQuery(queryAllOperatorsRandomCase, 'mongodb_query')
  );
});

it.todo(
  'handles custom fallbackExpression correctly'
  // , () => {
  //   // oxlint-disable-next-line typescript/no-explicit-any
  //   const fallbackExpression: any = { fallback: true };
  //   const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };
  //   testBoth(queryToTest, fallbackExpression, { fallbackExpression });
  // }
);

// oxlint-disable-next-line expect-expect
it('escapes quotes when appropriate', () => {
  testBoth(testQueryDQ, { f1: `Te"st` });
});

// oxlint-disable-next-line expect-expect
it('independent combinators', () => {
  testBoth(queryIC, {
    $or: [{ $and: [{ firstName: 'Test' }, { middleName: 'Test' }] }, { lastName: 'Test' }],
  });
});

describe('validation', () => {
  for (const fmt of ['mongodb', 'mongodb_query'] as const) {
    const validationResults: Record<string, unknown> = {
      [`should invalidate ${fmt}`]: { $and: [{ $expr: true }] },
      [`should invalidate ${fmt} even if fields are valid`]: { $and: [{ $expr: true }] },
      [`should invalidate ${fmt} rule by validator function`]: { field2: '' },
      [`should invalidate ${fmt} rule specified by validationMap`]: { field2: '' },
      [`should invalidate ${fmt} outermost group`]: { $and: [{ $expr: true }] },
      [`should invalidate ${fmt} inner group`]: { $and: [{ $expr: true }] },
      [`should convert ${fmt} inner group with no rules to fallbackExpression`]: {
        $and: [{ field: '' }, { $and: [{ $expr: true }] }],
      },
    };

    for (const vtd of getValidationTestData(fmt)) {
      if (validationResults[vtd.title] !== undefined) {
        // oxlint-disable-next-line expect-expect
        it(vtd.title, () => {
          (fmt === 'mongodb' ? testMongoDB : testMongoDBQuery)(
            vtd.query,
            validationResults[vtd.title],
            vtd.options
          );
        });
      }
    }
  }
});

// oxlint-disable-next-line expect-expect
it('ruleProcessor', () => {
  const ruleProcessor: RuleProcessor = r =>
    r.operator === 'custom_operator' ? `{"${r.operator}":true}` : defaultRuleProcessorMongoDB(r);
  testMongoDB(
    queryForRuleProcessor,
    { $and: [{ custom_operator: true }, { f2: 'v2' }] },
    { ruleProcessor }
  );
  testMongoDB(
    queryForRuleProcessor,
    { $and: [{ custom_operator: true }, { f2: 'v2' }] },
    { valueProcessor: ruleProcessor }
  );

  const ruleProcessorMDBQuery: RuleProcessor = r =>
    r.operator === 'custom_operator' ? { [r.operator]: true } : defaultRuleProcessorMongoDBQuery(r);
  testMongoDBQuery(
    queryForRuleProcessor,
    { $and: [{ custom_operator: true }, { f2: 'v2' }] },
    { ruleProcessor: ruleProcessorMDBQuery }
  );
  testMongoDBQuery(
    queryForRuleProcessor,
    { $and: [{ custom_operator: true }, { f2: 'v2' }] },
    { valueProcessor: ruleProcessorMDBQuery }
  );
});

// oxlint-disable-next-line expect-expect
it('preserveValueOrder', () => {
  testMongoDB(
    queryForPreserveValueOrder,
    { $and: [{ f1: { $gte: 12, $lte: 14 } }, { f2: { $gte: 12, $lte: 14 } }] },
    {}
  );
  testMongoDB(
    queryForPreserveValueOrder,
    { $and: [{ f1: { $gte: 12, $lte: 14 } }, { f2: { $gte: 14, $lte: 12 } }] },
    { preserveValueOrder: true }
  );
});

// oxlint-disable-next-line expect-expect
it('parseNumbers', () => {
  const allNumbersParsed = {
    $and: [
      { f: { $gt: 'NaN' } },
      { f: 0 },
      { f: 0 },
      { f: 0 },
      { $or: [{ f: { $lt: 1.5 } }, { f: { $gt: 1.5 } }] },
      { f: { $in: [0, 1, 2] } },
      { f: { $in: [0, 1, 2] } },
      { f: { $in: [0, 'abc', 2] } },
      { f: { $gte: 0, $lte: 1 } },
      { f: { $gte: 0, $lte: 1 } },
      { f: { $gte: 0, $lte: 'abc' } },
      { f: { $gte: {}, $lte: {} } },
    ],
  };
  for (const opts of [
    { parseNumbers: true },
    { parseNumbers: 'strict' },
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ] as FormatQueryOptions[]) {
    testBoth(queryForNumberParsing, allNumbersParsed, opts);
  }
});
