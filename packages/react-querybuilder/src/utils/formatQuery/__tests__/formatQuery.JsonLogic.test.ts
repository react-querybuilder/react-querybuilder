import { describe, expect, it } from '@jest/globals';
import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../../defaults';
import type {
  FormatQueryOptions,
  RQBJsonLogic,
  RuleGroupType,
  RuleProcessor,
} from '../../../types/index.noReact';
import { add } from '../../queryTools';
import { defaultRuleProcessorJsonLogic } from '../defaultRuleProcessorJsonLogic';
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
} from '../formatQueryTestUtils';
import { jsonLogicAdditionalOperators } from '../utils';

const query: RuleGroupType = {
  id: 'g-root',
  rules: [
    { field: defaultFieldPlaceholder, operator: defaultOperatorPlaceholder, value: 'Placeholder' },
    { field: defaultFieldPlaceholder, operator: '=', value: 'Placeholder' },
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

const queryWithValueSourceField: RuleGroupType = {
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
const jsonLogicQueryObject = {
  and: [
    { '==': [{ var: 'firstName' }, null] },
    { '!=': [{ var: 'lastName' }, null] },
    { in: [{ var: 'firstName' }, ['Test', 'This']] },
    { '!': { in: [{ var: 'lastName' }, ['Test', 'This']] } },
    { in: [{ var: 'firstName' }, []] },
    { '<=': ['Test', { var: 'firstName' }, 'This'] },
    { '<=': ['Test', { var: 'firstName' }, 'This'] },
    { '!': { '<=': ['Test', { var: 'lastName' }, 'This'] } },
    { '<=': [12, { var: 'age' }, 14] },
    { '==': [{ var: 'age' }, '26'] },
    { '==': [{ var: 'isMusician' }, true] },
    { '==': [{ var: 'isLucky' }, false] },
    {
      '!': {
        or: [
          { '==': [{ var: 'gender' }, 'M'] },
          { '!=': [{ var: 'job' }, 'Programmer'] },
          { in: ['@', { var: 'email' }] },
        ],
      },
    },
    {
      or: [
        { '!': { in: ['ab', { var: 'lastName' }] } },
        { startsWith: [{ var: 'job' }, 'Prog'] },
        { endsWith: [{ var: 'email' }, 'com'] },
        { '!': { startsWith: [{ var: 'job' }, 'Man'] } },
        { '!': { endsWith: [{ var: 'email' }, 'fr'] } },
      ],
    },
  ],
};
const jsonLogicQueryObjectForValueSourceField = {
  and: [
    { '==': [{ var: 'firstName' }, null] },
    { '!=': [{ var: 'lastName' }, null] },
    { in: [{ var: 'firstName' }, [{ var: 'middleName' }, { var: 'lastName' }]] },
    { '!': { in: [{ var: 'lastName' }, [{ var: 'middleName' }, { var: 'lastName' }]] } },
    { in: [{ var: 'firstName' }, []] },
    { '<=': [{ var: 'middleName' }, { var: 'firstName' }, { var: 'lastName' }] },
    { '<=': [{ var: 'middleName' }, { var: 'firstName' }, { var: 'lastName' }] },
    { '!': { '<=': [{ var: 'middleName' }, { var: 'lastName' }, { var: 'lastName' }] } },
    { '==': [{ var: 'age' }, { var: 'iq' }] },
    { '==': [{ var: 'isMusician' }, { var: 'isCreative' }] },
    {
      '!': {
        or: [
          { '==': [{ var: 'gender' }, { var: 'someLetter' }] },
          { '!=': [{ var: 'job' }, { var: 'isBetweenJobs' }] },
          { in: [{ var: 'atSign' }, { var: 'email' }] },
        ],
      },
    },
    {
      or: [
        { '!': { in: [{ var: 'firstName' }, { var: 'lastName' }] } },
        { startsWith: [{ var: 'job' }, { var: 'jobPrefix' }] },
        { endsWith: [{ var: 'email' }, { var: 'dotCom' }] },
        { '!': { startsWith: [{ var: 'job' }, { var: 'hasNoJob' }] } },
        { '!': { endsWith: [{ var: 'email' }, { var: 'isInvalid' }] } },
      ],
    },
  ],
};

it('formats JSONLogic correctly', () => {
  // Add an empty group and a rule with a non-standard operator
  const jsonLogicQuery = add(
    add(query, { combinator: 'and', rules: [] }, []),
    { field: 'invalid', operator: 'invalid', value: '' },
    []
  );
  expect(formatQuery(jsonLogicQuery, 'jsonlogic')).toEqual(jsonLogicQueryObject);
  expect(formatQuery(queryWithValueSourceField, 'jsonlogic')).toEqual(
    jsonLogicQueryObjectForValueSourceField
  );
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [{ field: 'f', operator: 'between', value: [14, 12] }],
      },
      'jsonlogic'
    )
  ).toEqual({ and: [{ '<=': [12, { var: 'f' }, 14] }] });
  expect(
    formatQuery(
      {
        combinator: 'and',
        rules: [
          { field: 'f', operator: 'between', value: [14, 12] },
          {
            combinator: 'or',
            rules: [{ field: 'f', operator: '=', value: '26' }],
          },
        ],
      },
      'jsonlogic'
    )
  ).toEqual({ and: [{ '<=': [12, { var: 'f' }, 14] }, { or: [{ '==': [{ var: 'f' }, '26'] }] }] });
});

it('handles operator case variations', () => {
  expect(formatQuery(queryAllOperators, 'jsonlogic')).toEqual(
    formatQuery(queryAllOperatorsRandomCase, 'jsonlogic')
  );
});

it('independent combinators', () => {
  expect(formatQuery(queryIC, 'jsonlogic')).toEqual({
    or: [
      {
        and: [{ '==': [{ var: 'firstName' }, 'Test'] }, { '==': [{ var: 'middleName' }, 'Test'] }],
      },
      { '==': [{ var: 'lastName' }, 'Test'] },
    ],
  });
});

describe('validation', () => {
  const validationResults: Record<string, RQBJsonLogic> = {
    'should invalidate jsonlogic': false,
    'should invalidate jsonlogic even if fields are valid': false,
    'should invalidate jsonlogic rule by validator function': {
      and: [{ '==': [{ var: 'field2' }, ''] }],
    },
    'should invalidate jsonlogic rule specified by validationMap': {
      and: [{ '==': [{ var: 'field2' }, ''] }],
    },
    'should invalidate jsonlogic outermost group': false,
    'should invalidate jsonlogic inner group': false,
    'should convert jsonlogic inner group with no rules to fallbackExpression': {
      and: [{ '==': [{ var: 'field' }, ''] }],
    },
  };

  for (const vtd of getValidationTestData('jsonlogic')) {
    if (validationResults[vtd.title] !== undefined) {
      it(vtd.title, () => {
        expect(formatQuery(vtd.query, vtd.options)).toEqual(validationResults[vtd.title]);
      });
    }
  }
});

it('ruleProcessor', () => {
  const ruleProcessor: RuleProcessor = r =>
    r.operator === 'custom_operator'
      ? { [r.operator]: [{ var: r.field }, r.value] }
      : defaultRuleProcessorJsonLogic(r);
  expect(formatQuery(queryForRuleProcessor, { format: 'jsonlogic', ruleProcessor })).toEqual({
    and: [{ custom_operator: [{ var: 'f1' }, 'v1'] }, { '==': [{ var: 'f2' }, 'v2'] }],
  });
  expect(
    formatQuery(queryForRuleProcessor, { format: 'jsonlogic', valueProcessor: ruleProcessor })
  ).toEqual({
    and: [{ custom_operator: [{ var: 'f1' }, 'v1'] }, { '==': [{ var: 'f2' }, 'v2'] }],
  });
});

it('parseNumbers', () => {
  const allNumbersParsed = {
    and: [
      { '>': [{ var: 'f' }, 'NaN'] },
      { '==': [{ var: 'f' }, 0] },
      { '==': [{ var: 'f' }, 0] },
      { '==': [{ var: 'f' }, 0] },
      { or: [{ '<': [{ var: 'f' }, 1.5] }, { '>': [{ var: 'f' }, 1.5] }] },
      { in: [{ var: 'f' }, [0, 1, 2]] },
      { in: [{ var: 'f' }, [0, 1, 2]] },
      { in: [{ var: 'f' }, [0, 'abc', 2]] },
      { '<=': [0, { var: 'f' }, 1] },
      { '<=': [0, { var: 'f' }, 1] },
      { '<=': ['0', { var: 'f' }, 'abc'] },
      { '<=': [{}, { var: 'f' }, {}] },
    ],
  };
  for (const opts of [
    { parseNumbers: true },
    { parseNumbers: 'strict' },
    { parseNumbers: 'strict-limited', fields: [{ name: 'f', label: 'f', inputType: 'number' }] },
  ] as FormatQueryOptions[]) {
    expect(formatQuery(queryForNumberParsing, { ...opts, format: 'jsonlogic' })).toEqual(
      allNumbersParsed
    );
  }
});

it('preserveValueOrder', () => {
  expect(
    formatQuery(queryForPreserveValueOrder, { format: 'jsonlogic', parseNumbers: true })
  ).toEqual({ and: [{ '<=': [12, { var: 'f1' }, 14] }, { '<=': [12, { var: 'f2' }, 14] }] });
  expect(
    formatQuery(queryForPreserveValueOrder, {
      format: 'jsonlogic',
      parseNumbers: true,
      preserveValueOrder: true,
    })
  ).toEqual({ and: [{ '<=': [12, { var: 'f1' }, 14] }, { '<=': [14, { var: 'f2' }, 12] }] });
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
  expect(formatQuery(betweenQuery, { format: 'jsonlogic' })).toEqual({
    and: [{ '<=': [22, { var: 'age' }, 34] }, { '!': { '<=': [10, { var: 'score' }, 20] } }],
  });

  // Explicit parseNumbers: true - should parse numbers
  expect(formatQuery(betweenQuery, { format: 'jsonlogic', parseNumbers: true })).toEqual({
    and: [{ '<=': [22, { var: 'age' }, 34] }, { '!': { '<=': [10, { var: 'score' }, 20] } }],
  });

  // parseNumbers: false - should NOT parse numbers (keep as strings)
  expect(formatQuery(betweenQuery, { format: 'jsonlogic', parseNumbers: false })).toEqual({
    and: [
      { '<=': ['22', { var: 'age' }, '34'] },
      { '!': { '<=': ['10', { var: 'score' }, '20'] } },
    ],
  });
});

it('runs the JsonLogic additional operators', () => {
  const { startsWith, endsWith } = jsonLogicAdditionalOperators;
  expect(startsWith('TestString', 'Test')).toBe(true);
  // @ts-expect-error null is not valid
  expect(startsWith(null, 'Test')).toBe(false);
  // @ts-expect-error [] is not valid
  expect(startsWith([], 'Test')).toBe(false);
  // @ts-expect-error {} is not valid
  expect(startsWith({}, 'Test')).toBe(false);
  expect(endsWith('TestString', 'String')).toBe(true);
  // @ts-expect-error null is not valid
  expect(endsWith(null, 'String')).toBe(false);
  // @ts-expect-error [] is not valid
  expect(endsWith([], 'String')).toBe(false);
  // @ts-expect-error {} is not valid
  expect(endsWith({}, 'String')).toBe(false);
});

it('handles match modes', () => {
  expect(formatQuery(queryWithMatchModes, 'jsonlogic')).toEqual({
    and: [
      { all: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
      { all: [{ var: 'fs' }, { in: ['S', { var: 'fv' }] }] },
      { none: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
      { some: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
      { some: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
      { none: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
      {
        '>=': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          2,
        ],
      },
      {
        '>=': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: 'fv' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          2,
        ],
      },
      {
        '>=': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          {
            '*': [{ reduce: [{ var: 'fs' }, { '+': [1, { var: 'accumulator' }] }, 0] }, 0.5],
          },
        ],
      },
      {
        '<=': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          2,
        ],
      },
      {
        '<=': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          {
            '*': [{ reduce: [{ var: 'fs' }, { '+': [1, { var: 'accumulator' }] }, 0] }, 0.5],
          },
        ],
      },
      {
        '==': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          2,
        ],
      },
      {
        '==': [
          {
            reduce: [
              { filter: [{ var: 'fs' }, { in: ['S', { var: '' }] }] },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          {
            '*': [{ reduce: [{ var: 'fs' }, { '+': [1, { var: 'accumulator' }] }, 0] }, 0.5],
          },
        ],
      },
      { all: [{ var: 'fs' }, { and: [{ in: ['S', { var: '' }] }, { in: ['S', { var: '' }] }] }] },
      {
        '>=': [
          {
            reduce: [
              {
                filter: [
                  { var: 'fs' },
                  { and: [{ in: ['S', { var: '' }] }, { in: ['S', { var: '' }] }] },
                ],
              },
              { '+': [1, { var: 'accumulator' }] },
              0,
            ],
          },
          2,
        ],
      },
    ],
  });
});
