import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
  defaultOperators,
} from '../../defaults';
import type {
  DefaultRuleGroupType,
  DefaultRuleGroupTypeIC,
  ExportFormat,
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
} from '../../types/index.noReact';
import { transformQuery } from '../transformQuery';

export const query: DefaultRuleGroupType = {
  id: 'g-root',
  rules: [
    // @ts-expect-error Invalid operator
    { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'Placeholder' },
    { field: defaultFieldPlaceholder, operator: '=', value: 'Placeholder' },
    // @ts-expect-error Invalid operator
    { field: 'firstName', operator: defaultOperatorPlaceholder, value: 'Placeholder' },
    { field: 'firstName', operator: 'null', value: '' },
    { field: 'lastName', operator: 'notNull', value: '' },
    { field: 'firstName', operator: 'in', value: 'Test,This' },
    { field: 'lastName', operator: 'notIn', value: 'Test,This' },
    { field: 'firstName', operator: 'in', value: false },
    { field: 'firstName', operator: 'between', value: 'Test,This' },
    { field: 'firstName', operator: 'between', value: ['Test', 'This'] },
    { field: 'lastName', operator: 'notBetween', value: 'Test,This' },
    { field: 'firstName', operator: 'between', value: 'MissingComma' },
    { field: 'age', operator: 'between', value: '12,14' },
    { field: 'firstName', operator: 'between', value: 'OnlyFirstElement,' },
    { field: 'firstName', operator: 'between', value: ',OnlySecondElement' },
    { field: 'age', operator: '=', value: '26' },
    { field: 'isMusician', operator: '=', value: true },
    { field: 'isLucky', operator: '=', value: false },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        { field: 'gender', operator: '=', value: 'M' },
        { field: 'job', operator: '!=', value: 'Programmer' },
        { field: 'email', operator: 'contains', value: '@' },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        { field: 'lastName', operator: 'doesNotContain', value: 'ab' },
        { field: 'job', operator: 'beginsWith', value: 'Prog' },
        { field: 'email', operator: 'endsWith', value: 'com' },
        { field: 'job', operator: 'doesNotBeginWith', value: 'Man' },
        { field: 'email', operator: 'doesNotEndWith', value: 'fr' },
      ],
      not: false,
    },
  ],
  combinator: 'and',
  not: false,
};

export const queryWithValueSourceField: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [
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
    { field: 'firstName', operator: 'between', value: 'MissingComma', valueSource: 'field' },
    { field: 'age', operator: '=', value: 'iq', valueSource: 'field' },
    { field: 'isMusician', operator: '=', value: 'isCreative', valueSource: 'field' },
    {
      id: 'g-sub1',
      combinator: 'or',
      rules: [
        { field: 'gender', operator: '=', value: 'someLetter', valueSource: 'field' },
        { field: 'job', operator: '!=', value: 'isBetweenJobs', valueSource: 'field' },
        { field: 'email', operator: 'contains', value: 'atSign', valueSource: 'field' },
      ],
      not: true,
    },
    {
      id: 'g-sub2',
      combinator: 'or',
      rules: [
        { field: 'lastName', operator: 'doesNotContain', value: 'firstName', valueSource: 'field' },
        { field: 'job', operator: 'beginsWith', value: 'jobPrefix', valueSource: 'field' },
        { field: 'email', operator: 'endsWith', value: 'dotCom', valueSource: 'field' },
        { field: 'job', operator: 'doesNotBeginWith', value: 'hasNoJob', valueSource: 'field' },
        { field: 'email', operator: 'doesNotEndWith', value: 'isInvalid', valueSource: 'field' },
      ],
      not: false,
    },
  ],
};

export const testQueryDQ: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'f1', operator: '=', value: `Te"st` }],
};

export const testQuerySQ: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'f1', operator: '=', value: `Te'st` }],
};

export const queryIC: DefaultRuleGroupTypeIC = {
  rules: [
    { field: 'firstName', operator: '=', value: 'Test' },
    'and',
    { field: 'middleName', operator: '=', value: 'Test' },
    'or',
    { field: 'lastName', operator: '=', value: 'Test' },
  ],
};

export const queryForRuleProcessor: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [
    // @ts-expect-error Invalid operator
    { field: 'f1', operator: 'custom_operator', value: 'v1' },
    { field: 'f2', operator: '=', value: 'v2' },
  ],
};

export const queryForNumberParsing: DefaultRuleGroupType = {
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

export const queryForXor: DefaultRuleGroupType = {
  combinator: 'xor',
  rules: [
    { field: 'f1', operator: '=', value: 'v1' },
    { field: 'f2', operator: '=', value: 'v2' },
  ],
};

export const queryForPreserveValueOrder: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'f1', operator: 'between', value: '12,14' },
    { field: 'f2', operator: 'between', value: '14,12' },
  ],
};

export const getValidationTestData = (
  format: ExportFormat
): { title: string; query: RuleGroupTypeAny; options: FormatQueryOptions }[] => {
  return [
    {
      title: `should invalidate ${format}`,
      query: { id: 'root', combinator: 'and', rules: [] },
      options: { format, validator: () => false },
    },
    {
      title: `should invalidate ${format} even if fields are valid`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [{ field: 'field', operator: '=', value: '' }],
      },
      options: {
        format,
        validator: () => false,
        fields: [{ name: 'field', label: 'field', validator: () => true }],
      },
    },
    {
      title: `should invalidate ${format} rule by validator function`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [
          { field: 'field', operator: '=', value: '' },
          { field: 'field2', operator: '=', value: '' },
        ],
      },
      options: {
        format,
        fields: [
          { name: 'field', label: 'field', validator: () => false },
          { name: 'field3', label: 'field3', validator: () => false },
        ],
      },
    },
    {
      title: `should invalidate ${format} rule specified by validationMap`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [
          { id: 'f1', field: 'field', operator: '=', value: '' },
          { id: 'f2', field: 'field2', operator: '=', value: '' },
        ],
      },
      options: { format, validator: () => ({ f1: false }) },
    },
    {
      title: `should invalidate ${format} outermost group`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [],
      },
      options: { format, validator: () => ({ root: false }) },
    },
    {
      title: `should invalidate ${format} inner group`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [{ id: 'inner', combinator: 'and', rules: [] }],
      },
      options: { format, validator: () => ({ inner: false }) },
    },
    {
      title: `should convert ${format} inner group with no rules to fallbackExpression`,
      query: {
        id: 'root',
        combinator: 'and',
        rules: [
          { field: 'field', operator: '=', value: '' },
          { id: 'inner', combinator: 'and', rules: [] },
        ],
      },
      options: { format },
    },
  ];
};

export const queryAllOperators: DefaultRuleGroupType = {
  combinator: 'and',
  rules: [
    { field: 'f', operator: '!=', value: 'v' },
    { field: 'f', operator: '<', value: 123 },
    { field: 'f', operator: '<=', value: 123 },
    { field: 'f', operator: '=', value: 'v' },
    { field: 'f', operator: '>', value: 123 },
    { field: 'f', operator: '>=', value: 123 },
    { field: 'f', operator: 'beginsWith', value: 'v' },
    { field: 'f', operator: 'between', value: '123,456' },
    { field: 'f', operator: 'contains', value: 'v' },
    { field: 'f', operator: 'doesNotBeginWith', value: 'v' },
    { field: 'f', operator: 'doesNotContain', value: 'v' },
    { field: 'f', operator: 'doesNotEndWith', value: 'v' },
    { field: 'f', operator: 'endsWith', value: 'v' },
    { field: 'f', operator: 'in', value: 'v,x' },
    { field: 'f', operator: 'notBetween', value: '123,456' },
    { field: 'f', operator: 'notIn', value: 'v,x' },
    { field: 'f', operator: 'notNull', value: null },
    { field: 'f', operator: 'null', value: null },
  ],
};

export const queryAllOperatorsRandomCase: RuleGroupType = transformQuery(queryAllOperators, {
  operatorMap: Object.fromEntries(
    defaultOperators.map(o => [
      o.name,
      // Randomize case
      [...o.name].map(c => (Math.random() < 0.5 ? c.toUpperCase() : c.toLowerCase())).join(''),
    ])
  ),
});
