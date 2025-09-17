import type { SuperUser, TestSQLParams } from '@rqb-dbquerytestutils';
import { dbTests, fields } from '@rqb-dbquerytestutils';
import type { DefaultOperatorName } from '@react-querybuilder/core';

export * from '@rqb-dbquerytestutils';

export const dbTestsDrizzle = (superUsers: SuperUser[]): Record<string, TestSQLParams> => ({
  ...dbTests(superUsers),
  not: {
    query: {
      not: true,
      combinator: 'or',
      rules: [
        { field: 'powerUpAge', operator: 'notNull', value: null },
        { field: 'madeUpName', operator: 'null', value: null },
      ],
    },
    expectedResult: superUsers.filter(u => !(u.powerUpAge !== null || u.madeUpName === null)),
  },
  valueSourceFieldBetween: {
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'lastName',
          operator: 'between',
          value: ['firstName', 'madeUpName'],
          valueSource: 'field',
        },
      ],
    },
    expectedResult: superUsers.filter(u => u.lastName >= u.firstName && u.lastName <= u.madeUpName),
  },
  valueSourceFieldBeginsWith: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'beginsWith', value: 'nickname', valueSource: 'field' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName.startsWith(u.nickname)),
  },
  valueSourceFieldDoesNotBeginWith: {
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'madeUpName',
          operator: 'doesNotBeginWith',
          value: 'nickname',
          valueSource: 'field',
        },
      ],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.startsWith(u.nickname)),
  },
  valueSourceFieldContains: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'contains', value: 'nickname', valueSource: 'field' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName.includes(u.nickname)),
  },
  valueSourceFieldDoesNotContain: {
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'madeUpName',
          operator: 'doesNotContain',
          value: 'nickname',
          valueSource: 'field',
        },
      ],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.includes(u.nickname)),
  },
  valueSourceFieldEndsWith: {
    query: {
      combinator: 'and',
      rules: [
        { field: 'madeUpName', operator: 'endsWith', value: 'nickname', valueSource: 'field' },
      ],
    },
    expectedResult: superUsers.filter(u => u.madeUpName.endsWith(u.nickname)),
  },
  valueSourceFieldDoesNotEndWith: {
    query: {
      combinator: 'and',
      rules: [
        {
          field: 'madeUpName',
          operator: 'doesNotEndWith',
          value: 'nickname',
          valueSource: 'field',
        },
      ],
    },
    expectedResult: superUsers.filter(u => !u.madeUpName.endsWith(u.nickname)),
  },
  fallbacks: {
    query: {
      combinator: 'and',
      rules: [
        { id: 'invalid_id', combinator: 'or', rules: [] }, // invalidated by query validator
        { field: 'powerUpAge', operator: '=', value: 99 }, // invalidated by field validator
        { field: 'powerUpAge', operator: 'between', value: null },
        { field: 'powerUpAge', operator: 'between', value: [null] },
        { field: 'powerUpAge', operator: 'between', value: [0] },
        { field: 'powerUpAge', operator: 'between', value: '' },
        { field: 'powerUpAge', operator: 'between', value: '0' },
        { field: '~', operator: '=', value: '' },
        { field: 'firstName', operator: '~' as unknown as DefaultOperatorName, value: '' },
        { field: 'firstName', operator: 'invalid' as unknown as DefaultOperatorName, value: '' },
      ],
    },
    expectedResult: superUsers,
    fqOptions: { fields, validator: () => ({ invalid_id: { valid: false } }) },
  },
});
