import type {
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleProcessor,
} from '../../../types';
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
  testQueryDQ,
} from '../formatQueryTestUtils';

const expectPrisma = (
  query: RuleGroupTypeAny,
  expectation: unknown,
  fqOptions?: FormatQueryOptions
) => {
  expect(formatQuery(query, { ...fqOptions, format: 'prisma' })).toEqual(expectation);
};

const prismaQuery: RuleGroupType = {
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

const prismaQueryExpectation = {
  AND: [
    { firstName: null },
    { lastName: { not: null } },
    { firstName: { in: ['Test', 'This'] } },
    { lastName: { notIn: ['Test', 'This'] } },
    { firstName: { in: [] } },
    { firstName: { gte: 'Test', lte: 'This' } },
    { firstName: { gte: 'Test', lte: 'This' } },
    { OR: [{ lastName: { lt: 'Test' } }, { lastName: { gt: 'This' } }] },
    { age: { gte: '12', lte: '14' } },
    { age: '26' },
    { isMusician: true },
    { isLucky: false },
    { email: { contains: '@' } },
    { email: { startsWith: 'ab' } },
    { email: { endsWith: 'com' } },
    { NOT: { hello: { contains: 'com' } } },
    { NOT: { job: { startsWith: 'Man' } } },
    { NOT: { job: { endsWith: 'ger' } } },
    { OR: [{ job: 'Sales Executive' }, { job: { in: [] } }] },
  ],
};

it('formats to prisma query correctly', () => {
  expectPrisma(prismaQuery, prismaQueryExpectation);
  expectPrisma({ rules: [{ field: 'f', operator: '=', value: 'v', valueSource: 'field' }] }, {});
  expectPrisma(
    { rules: [{ field: 'f', operator: '=', value: { rules: [] }, match: { mode: 'all' } }] },
    {}
  );
  // Test for newline in value and `not` at top level
  expectPrisma(
    {
      not: true,
      combinator: 'and',
      rules: [{ field: 'f1', operator: '=', value: 'value\nwith newline' }],
    },
    { NOT: { f1: 'value\nwith newline' } }
  );
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'prisma')).toEqual(
    formatQuery(queryAllOperatorsRandomCase, 'prisma')
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

it('escapes quotes when appropriate', () => {
  expectPrisma(testQueryDQ, { f1: `Te"st` });
});

it('independent combinators', () => {
  expectPrisma(queryIC, {
    OR: [{ AND: [{ firstName: 'Test' }, { middleName: 'Test' }] }, { lastName: 'Test' }],
  });
});

describe('validation', () => {
  for (const fmt of ['mongodb', 'prisma'] as const) {
    const validationResults: Record<string, unknown> = {
      [`should invalidate ${fmt}`]: {},
      [`should invalidate ${fmt} even if fields are valid`]: {},
      [`should invalidate ${fmt} rule by validator function`]: { field2: '' },
      [`should invalidate ${fmt} rule specified by validationMap`]: { field2: '' },
      [`should invalidate ${fmt} outermost group`]: {},
      [`should invalidate ${fmt} inner group`]: {},
      [`should convert ${fmt} inner group with no rules to fallbackExpression`]: {
        AND: [{ field: '' }, {}],
      },
      [`should invalidate ${fmt} following combinator of first rule`]: {
        OR: [{ field2: '' }, { field3: '' }],
      },
      [`should invalidate ${fmt} preceding combinator of non-first rule`]: {
        OR: [{ field: '' }, { field3: '' }],
      },
    };

    for (const vtd of getValidationTestData(fmt)) {
      if (validationResults[vtd.title] !== undefined) {
        it(vtd.title, () => {
          expectPrisma(vtd.query, validationResults[vtd.title], vtd.options);
        });
      }
    }
  }
});

it('ruleProcessor', () => {
  const ruleProcessor: RuleProcessor = r =>
    r.operator === 'custom_operator' ? { [r.operator]: true } : defaultRuleProcessorMongoDBQuery(r);
  expectPrisma(
    queryForRuleProcessor,
    { AND: [{ custom_operator: true }, { f2: 'v2' }] },
    { ruleProcessor: ruleProcessor }
  );
  expectPrisma(
    queryForRuleProcessor,
    { AND: [{ custom_operator: true }, { f2: 'v2' }] },
    { valueProcessor: ruleProcessor }
  );
});

it('preserveValueOrder', () => {
  expectPrisma(
    queryForPreserveValueOrder,
    { AND: [{ f1: { gte: '12', lte: '14' } }, { f2: { gte: '12', lte: '14' } }] },
    {}
  );
  expectPrisma(
    queryForPreserveValueOrder,
    { AND: [{ f1: { gte: '12', lte: '14' } }, { f2: { gte: '14', lte: '12' } }] },
    { preserveValueOrder: true }
  );
  expectPrisma(
    queryForPreserveValueOrder,
    { AND: [{ f1: { gte: 12, lte: 14 } }, { f2: { gte: 12, lte: 14 } }] },
    { parseNumbers: true }
  );
  expectPrisma(
    queryForPreserveValueOrder,
    { AND: [{ f1: { gte: 12, lte: 14 } }, { f2: { gte: 14, lte: 12 } }] },
    { parseNumbers: true, preserveValueOrder: true }
  );
});

it('parseNumbers', () => {
  const allNumbersParsed = {
    AND: [
      { f: { gt: 'NaN' } },
      { f: 0 },
      { f: 0 },
      { f: 0 },
      { OR: [{ f: { lt: 1.5 } }, { f: { gt: 1.5 } }] },
      { f: { in: [0, 1, 2] } },
      { f: { in: [0, 1, 2] } },
      { f: { in: [0, 'abc', 2] } },
      { f: { gte: 0, lte: 1 } },
      { f: { gte: 0, lte: 1 } },
      { f: { gte: 0, lte: 'abc' } },
      { f: { gte: {}, lte: {} } },
    ],
  };
  for (const opts of [
    { parseNumbers: true },
    { parseNumbers: 'strict' },
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ] as FormatQueryOptions[]) {
    expectPrisma(queryForNumberParsing, allNumbersParsed, opts);
  }
  const noNumbersParsed = {
    AND: [
      { f: { gt: 'NaN' } },
      { f: '0' },
      { f: '    0    ' },
      { f: 0 },
      { OR: [{ f: { lt: '1.5' } }, { f: { gt: 1.5 } }] },
      { f: { in: ['0', '1', '2'] } },
      { f: { in: [0, 1, 2] } },
      { f: { in: ['0', 'abc', '2'] } },
      { f: { gte: '0', lte: '1' } },
      { f: { gte: 0, lte: 1 } },
      { f: { gte: '0', lte: 'abc' } },
      { f: { gte: {}, lte: {} } },
    ],
  };
  expectPrisma(queryForNumberParsing, noNumbersParsed, { parseNumbers: false });
});
