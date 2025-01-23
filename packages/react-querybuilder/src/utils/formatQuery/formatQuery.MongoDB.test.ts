import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
} from '../../types/index.noReact';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { defaultRuleProcessorMongoDBQuery } from './defaultRuleProcessorMongoDBQuery';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  queryAllOperators,
  queryAllOperatorsRandomCase,
  queryForNumberParsing,
  queryForRuleProcessor,
  queryIC,
  testQueryDQ,
} from './formatQueryTestUtils';
import { defaultMongoDBValueProcessor } from './index';

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
const mongoQueryExpectationForValueSourceField = {
  $and: [
    { firstName: null },
    { lastName: { $ne: null } },
    { $where: '[this.middleName,this.lastName].includes(this.firstName)' },
    { $where: '![this.middleName,this.lastName].includes(this.lastName)' },
    { $where: '[].includes(this.firstName)' },
    {
      $and: [
        { $expr: { $gte: ['$firstName', '$middleName'] } },
        { $expr: { $lte: ['$firstName', '$lastName'] } },
      ],
    },
    {
      $and: [
        { $expr: { $gte: ['$firstName', '$middleName'] } },
        { $expr: { $lte: ['$firstName', '$lastName'] } },
      ],
    },
    {
      $or: [
        { $expr: { $lt: ['$lastName', '$middleName'] } },
        { $expr: { $gt: ['$lastName', '$lastName'] } },
      ],
    },
    { $expr: { $eq: ['$age', '$iq'] } },
    { $expr: { $eq: ['$isMusician', '$isCreative'] } },
    { $where: 'this.email.includes(this.atSign)' },
    { $where: 'this.email.startsWith(this.name)' },
    { $where: 'this.email.endsWith(this.dotCom)' },
    { $where: '!this.hello.includes(this.dotCom)' },
    { $where: '!this.job.startsWith(this.noJob)' },
    { $where: '!this.job.endsWith(this.noJob)' },
    { $expr: { $eq: ['$job', '$executiveJobName'] } },
  ],
};

it('formats to mongo query correctly', () => {
  testBoth(mongoQuery, mongoQueryExpectation);
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
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'mongodb_query')).toEqual(
    formatQuery(queryAllOperatorsRandomCase, 'mongodb_query')
  );
});

it.todo(
  'handles custom fallbackExpression correctly'
  // , () => {
  //   // eslint-disable-next-line @typescript-eslint/no-explicit-any
  //   const fallbackExpression: any = { fallback: true };
  //   const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };
  //   testBoth(queryToTest, fallbackExpression, { fallbackExpression });
  // }
);

it('escapes quotes when appropriate', () => {
  testBoth(testQueryDQ, { f1: `Te"st` });
});

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
