import type { RuleProcessor } from '@react-querybuilder/core';
import type { RulesEngine } from '../../types';
import { formatRulesEngine } from './formatRulesEngine';

it('nested rule groups in antecedents', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'field1', operator: '=', value: 'value1' },
            {
              combinator: 'or',
              rules: [
                { field: 'field2', operator: '!=', value: 'value2' },
                { field: 'field3', operator: '>', value: 'value3' },
              ],
            },
          ],
        },
        consequent: { type: 'nestedEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: {
        all: [
          { fact: 'field1', operator: 'equal', value: 'value1' },
          {
            any: [
              { fact: 'field2', operator: 'notEqual', value: 'value2' },
              { fact: 'field3', operator: 'greaterThan', value: 'value3' },
            ],
          },
        ],
      },
      event: { type: 'nestedEvent', params: {} },
    },
  ]);
});

it('invalid rule groups by returning empty conditions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: { combinator: 'and', rules: [] },
        consequent: { type: 'emptyEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([{ conditions: { all: [] }, event: { type: 'emptyEvent', params: {} } }]);
});

it('filters out rules with placeholder values', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            { field: '~', operator: '=', value: 'value' },
            { field: 'field', operator: '~', value: 'value' },
          ],
        },
        consequent: { type: 'filteredEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'validField', operator: 'equal', value: 'validValue' }] },
      event: { type: 'filteredEvent', params: {} },
    },
  ]);
});

it('nested groups that become empty after filtering', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            {
              combinator: 'or',
              rules: [
                { field: '~', operator: '=', value: 'value' },
                { field: 'field', operator: '~', value: 'value' },
              ],
            },
          ],
        },
        consequent: { type: 'emptyNestedEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'validField', operator: 'equal', value: 'validValue' }] },
      event: { type: 'emptyNestedEvent', params: {} },
    },
  ]);
});

it('OR combinators and NOT conditions', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'or',
          not: true,
          rules: [
            { field: 'field1', operator: '=', value: 'value1' },
            { field: 'field2', operator: '!=', value: 'value2' },
          ],
        },
        consequent: { type: 'notOrEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: {
        not: {
          any: [
            { fact: 'field1', operator: 'equal', value: 'value1' },
            { fact: 'field2', operator: 'notEqual', value: 'value2' },
          ],
        },
      },
      event: { type: 'notOrEvent', params: {} },
    },
  ]);
});

it('conditions without consequent', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'field1', operator: 'equal', value: 'value1' }] },
      event: { type: '' },
    },
  ]);
});

it('validation that makes outermost group invalid', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          id: 'root-group',
          combinator: 'and',
          muted: true,
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'invalidRootEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    { conditions: { all: [] }, event: { type: 'invalidRootEvent', params: {} } },
  ]);
});

it('muted nested group', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            {
              combinator: 'and',
              muted: true,
              rules: [{ field: 'someField', operator: '=', value: 'someValue' }],
            },
          ],
        },
        consequent: { type: 'mutedNestedEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'validField', operator: 'equal', value: 'validValue' }] },
      event: { type: 'mutedNestedEvent', params: {} },
    },
  ]);
});

it('nested group with all invalid rules', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            {
              combinator: 'and',
              rules: [
                { field: '~', operator: '=', value: 'value' },
                { field: 'field2', operator: '~', value: 'value' },
              ],
            },
          ],
        },
        consequent: { type: 'nestedEmptyEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'validField', operator: 'equal', value: 'validValue' }] },
      event: { type: 'nestedEmptyEvent', params: {} },
    },
  ]);
});

it('invalid individual rules', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'validField', operator: '=', value: 'validValue' },
            { field: '~', operator: '=', value: 'value' },
            { field: 'field2', operator: '~', value: 'value' },
          ],
        },
        consequent: { type: 'invalidRuleEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'validField', operator: 'equal', value: 'validValue' }] },
      event: { type: 'invalidRuleEvent', params: {} },
    },
  ]);
});

it('deeply nested rule groups', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            {
              combinator: 'or',
              rules: [
                { field: 'level1', operator: '=', value: 'value1' },
                {
                  combinator: 'and',
                  rules: [
                    { field: 'level2a', operator: '!=', value: 'value2a' },
                    { field: 'level2b', operator: '>', value: 'value2b' },
                  ],
                },
              ],
            },
          ],
        },
        consequent: { type: 'deepEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: {
        all: [
          {
            any: [
              { fact: 'level1', operator: 'equal', value: 'value1' },
              {
                all: [
                  { fact: 'level2a', operator: 'notEqual', value: 'value2a' },
                  { fact: 'level2b', operator: 'greaterThan', value: 'value2b' },
                ],
              },
            ],
          },
        ],
      },
      event: { type: 'deepEvent', params: {} },
    },
  ]);
});

it('rules engine with validation options that invalidate root group', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          id: 'invalid-antecedent',
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'validationEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'field1', operator: 'equal', value: 'value1' }] },
      event: { type: 'validationEvent', params: {} },
    },
  ]);
});

it('validation options for nested groups', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          id: 'valid-root',
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'validationEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'field1', operator: 'equal', value: 'value1' }] },
      event: { type: 'validationEvent', params: {} },
    },
  ]);
});

it('uses default ruleProcessor when none provided', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'defaultProcessorEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, { format: 'json-rules-engine' });
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'field1', operator: 'equal', value: 'value1' }] },
      event: { type: 'defaultProcessorEvent', params: {} },
    },
  ]);
});

it('custom ruleProcessor', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'customProcessorEvent', params: {} },
      },
    ],
  };
  const customRuleProcessor: RuleProcessor = () => ({
    fact: 'customField',
    operator: 'equal',
    value: 'customValue',
  });
  const result = formatRulesEngine(re, {
    format: 'json-rules-engine',
    formatQueryOptions: { ruleProcessor: customRuleProcessor },
  });
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'customField', operator: 'equal', value: 'customValue' }] },
      event: { type: 'customProcessorEvent', params: {} },
    },
  ]);
});

it('custom format options with processors', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [{ field: 'field1', operator: '=', value: 'value1' }],
        },
        consequent: { type: 'customEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, { format: 'json-rules-engine' });
  expect(result).toEqual([
    {
      conditions: { all: [{ fact: 'field1', operator: 'equal', value: 'value1' }] },
      event: { type: 'customEvent', params: {} },
    },
  ]);
});

it('rules with various operators', () => {
  const re: RulesEngine = {
    conditions: [
      {
        antecedent: {
          combinator: 'and',
          rules: [
            { field: 'field1', operator: '=', value: 'value1' },
            { field: 'field2', operator: '!=', value: 'value2' },
            { field: 'field3', operator: '<', value: 'value3' },
            { field: 'field4', operator: '<=', value: 'value4' },
            { field: 'field5', operator: '>', value: 'value5' },
            { field: 'field6', operator: '>=', value: 'value6' },
          ],
        },
        consequent: { type: 'operatorEvent', params: {} },
      },
    ],
  };
  const result = formatRulesEngine(re, 'json-rules-engine');
  expect(result).toEqual([
    {
      conditions: {
        all: [
          { fact: 'field1', operator: 'equal', value: 'value1' },
          { fact: 'field2', operator: 'notEqual', value: 'value2' },
          { fact: 'field3', operator: 'lessThan', value: 'value3' },
          { fact: 'field4', operator: 'lessThanInclusive', value: 'value4' },
          { fact: 'field5', operator: 'greaterThan', value: 'value5' },
          { fact: 'field6', operator: 'greaterThanInclusive', value: 'value6' },
        ],
      },
      event: { type: 'operatorEvent', params: {} },
    },
  ]);
});
