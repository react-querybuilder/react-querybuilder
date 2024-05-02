import type {
  RuleGroupType,
  RuleProcessor,
  ValueProcessorByRule,
  ValueProcessorLegacy,
} from '../../types/index.noReact';
import { prepareRuleGroup } from '../prepareQueryObjects';
import { defaultRuleProcessorMongoDB } from './defaultRuleProcessorMongoDB';
import { formatQuery } from './formatQuery';
import {
  getValidationTestData,
  queryForNumberParsing,
  queryForRuleProcessor,
  queryIC,
  testQueryDQ,
} from './formatQueryTestUtils';
import { defaultMongoDBValueProcessor, defaultValueProcessorByRule } from './index';

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
  expect(JSON.parse(formatQuery(mongoQuery, 'mongodb'))).toEqual(mongoQueryExpectation);
  expect(JSON.parse(formatQuery(mongoQueryWithValueSourceField, 'mongodb'))).toEqual(
    mongoQueryExpectationForValueSourceField
  );
  expect(
    JSON.parse(
      formatQuery(mongoQueryWithValueSourceField, {
        format: 'mongodb',
        valueProcessor: defaultMongoDBValueProcessor,
      })
    )
  ).toEqual(mongoQueryExpectationForValueSourceField);
});

it('handles custom valueProcessors correctly', () => {
  const queryWithArrayValue: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: ['Guitar', 'Vocals'], operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
    ],
    not: false,
  };

  const valueProcessorLegacy: ValueProcessorLegacy = (_field, operator, value) => {
    if (operator === 'in') {
      return `(${value.map((v: string) => `'${v.trim()}'`).join(', /* and */ ')})`;
    } else {
      return `'${value}'`;
    }
  };

  expect(
    formatQuery(queryWithArrayValue, {
      format: 'sql',
      valueProcessor: valueProcessorLegacy,
    })
  ).toBe(`(instrument in ('Guitar', /* and */ 'Vocals') and lastName = 'Vai')`);

  const queryForNewValueProcessor: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'f1', operator: '=', value: `v'1`, valueSource: 'value' }],
  };

  const valueProcessor: ValueProcessorByRule = (
    { field, operator, value, valueSource },
    opts = {}
  ) => `${field}-${operator}-${value}-${valueSource}-${!!opts.parseNumbers}-${!!opts.escapeQuotes}`;

  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      parseNumbers: true,
      valueProcessor,
    })
  ).toBe(`(f1 = f1-=-v'1-value-true-true)`);

  const valueProcessorAsPassThrough: ValueProcessorByRule = (r, opts) =>
    defaultValueProcessorByRule(r, opts);

  // handles escapeQuotes correctly
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(`(f1 = 'v''1')`);
  // handles escapeQuotes exactly the same as defaultValueProcessorByRule
  expect(
    formatQuery(queryForNewValueProcessor, {
      format: 'sql',
      valueProcessor: valueProcessorAsPassThrough,
    })
  ).toBe(formatQuery(queryForNewValueProcessor, 'sql'));
});

it('handles quoteFieldNamesWith correctly', () => {
  const queryToTest: RuleGroupType = {
    id: 'g-root',
    combinator: 'and',
    rules: [
      { field: 'instrument', value: 'Guitar, Vocals', operator: 'in' },
      { field: 'lastName', value: 'Vai', operator: '=' },
      { field: 'lastName', value: 'firstName', operator: '!=', valueSource: 'field' },
    ],
    not: false,
  };

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: '`' })).toBe(
    "(`instrument` in ('Guitar', 'Vocals') and `lastName` = 'Vai' and `lastName` != `firstName`)"
  );

  expect(formatQuery(queryToTest, { format: 'sql', quoteFieldNamesWith: ['[', ']'] })).toBe(
    "([instrument] in ('Guitar', 'Vocals') and [lastName] = 'Vai' and [lastName] != [firstName])"
  );
});

it('handles custom fallbackExpression correctly', () => {
  const fallbackExpression = 'fallbackExpression';
  const queryToTest: RuleGroupType = { id: 'g-root', combinator: 'and', rules: [] };

  expect(formatQuery(queryToTest, { format: 'sql', fallbackExpression })).toBe(fallbackExpression);
});

it('handles json_without_ids correctly', () => {
  const queryToTest: RuleGroupType & { extraProperty: string } = {
    id: 'root',
    combinator: 'and',
    rules: [{ field: 'firstName', value: '', operator: 'null', valueSource: 'value' }],
    not: false,
    extraProperty: 'extraProperty',
  };
  const expectedResult = JSON.parse(
    '{"rules":[{"field":"firstName","value":"","operator":"null","valueSource":"value"}],"combinator":"and","not":false,"extraProperty":"extraProperty"}'
  );
  expect(JSON.parse(formatQuery(prepareRuleGroup(queryToTest), 'json_without_ids'))).toEqual(
    expectedResult
  );
});

it('uses paramPrefix correctly', () => {
  const queryToTest: RuleGroupType = {
    combinator: 'and',
    rules: [
      { field: 'firstName', operator: '=', value: 'Test' },
      { field: 'lastName', operator: 'in', value: 'Test1,Test2' },
      { field: 'age', operator: 'between', value: [26, 52] },
    ],
  };
  const sql = `(firstName = $firstName_1 and lastName in ($lastName_1, $lastName_2) and age between $age_1 and $age_2)`;
  const paramPrefix = '$';

  // Control (default) - param prefixes removed
  expect(formatQuery(queryToTest, { format: 'parameterized_named', paramPrefix })).toEqual({
    sql,
    params: {
      firstName_1: 'Test',
      lastName_1: 'Test1',
      lastName_2: 'Test2',
      age_1: 26,
      age_2: 52,
    },
  });

  // Experimental - param prefixes retained
  expect(
    formatQuery(queryToTest, {
      format: 'parameterized_named',
      paramPrefix,
      paramsKeepPrefix: true,
    })
  ).toEqual({
    sql,
    params: {
      [`${paramPrefix}firstName_1`]: 'Test',
      [`${paramPrefix}lastName_1`]: 'Test1',
      [`${paramPrefix}lastName_2`]: 'Test2',
      [`${paramPrefix}age_1`]: 26,
      [`${paramPrefix}age_2`]: 52,
    },
  });
});

describe('escapes quotes when appropriate', () => {
  it('escapes double quotes (if appropriate) for mongodb', () => {
    expect(formatQuery(testQueryDQ, 'mongodb')).toEqual(`{"f1":"Te\\"st"}`);
  });
});

describe('independent combinators', () => {
  it('handles independent combinators for mongodb', () => {
    expect(formatQuery(queryIC, 'mongodb')).toBe(
      '{"$or":[{"$and":[{"firstName":"Test"},{"middleName":"Test"}]},{"lastName":"Test"}]}'
    );
  });
});

describe('validation', () => {
  describe('mongodb', () => {
    const validationResults: Record<string, string> = {
      'should invalidate mongodb': '{"$and":[{"$expr":true}]}',
      'should invalidate mongodb even if fields are valid': '{"$and":[{"$expr":true}]}',
      'should invalidate mongodb rule by validator function': '{"field2":""}',
      'should invalidate mongodb rule specified by validationMap': '{"field2":""}',
      'should invalidate mongodb outermost group': '{"$and":[{"$expr":true}]}',
      'should invalidate mongodb inner group': '{"$and":[{"$expr":true}]}',
      'should convert mongodb inner group with no rules to fallbackExpression':
        '{"$and":[{"field":""},{"$and":[{"$expr":true}]}]}',
    };

    for (const vtd of getValidationTestData('mongodb')) {
      if (typeof validationResults[vtd.title] !== 'undefined') {
        it(vtd.title, () => {
          expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
        });
      }
    }
  });
});

describe('ruleProcessor', () => {
  it('handles custom MongoDB rule processor', () => {
    const ruleProcessor: RuleProcessor = r =>
      r.operator === 'custom_operator' ? r.operator : defaultRuleProcessorMongoDB(r);
    expect(formatQuery(queryForRuleProcessor, { format: 'mongodb', ruleProcessor })).toBe(
      '{"$and":[custom_operator,{"f2":"v2"}]}'
    );
    expect(
      formatQuery(queryForRuleProcessor, { format: 'mongodb', valueProcessor: ruleProcessor })
    ).toBe('{"$and":[custom_operator,{"f2":"v2"}]}');
  });
});

describe('parseNumbers', () => {
  it('parses numbers for mongodb', () => {
    expect(formatQuery(queryForNumberParsing, { format: 'mongodb', parseNumbers: true })).toBe(
      '{"$and":[{"f":{"$gt":"NaN"}},{"f":0},{"f":0},{"f":0},{"$or":[{"f":{"$lt":1.5}},{"f":{"$gt":1.5}}]},{"f":{"$in":[0,1,2]}},{"f":{"$in":[0,1,2]}},{"f":{"$in":[0,"abc",2]}},{"f":{"$gte":0,"$lte":1}},{"f":{"$gte":0,"$lte":1}},{"f":{"$gte":0,"$lte":"abc"}},{"f":{"$gte":"[object Object]","$lte":"[object Object]"}}]}'
    );
  });
});
