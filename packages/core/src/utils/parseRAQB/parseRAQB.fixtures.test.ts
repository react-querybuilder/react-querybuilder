/**
 * Conversion tests using query trees copied verbatim from react-awesome-query-builder's own test
 * suite (`packages/tests/support/inits.js` @ commit 446689d, v6.7.0-alpha.0). These guard against
 * drift between {@link parseRAQB}'s assumptions and RAQB's real serialized output.
 */

import { parseRAQB } from './parseRAQB';
import type { RAQBJsonTree, RAQBUnsupportedInfo } from './types';

// RAQB: `tree_with_number`
const tree_with_number = {
  type: 'group',
  children1: [
    {
      type: 'rule',
      properties: {
        field: 'num',
        operator: 'equal',
        value: [2],
        valueSrc: ['value'],
        valueType: ['number'],
      },
    },
  ],
  properties: { conjunction: 'AND', not: false },
} as RAQBJsonTree;

// RAQB: `tree_with_empty_group`
const tree_with_empty_group = {
  type: 'group',
  children1: [{ type: 'group', properties: { conjunction: 'AND', not: false }, children1: [] }],
} as RAQBJsonTree;

// RAQB: `tree_with_empty_groups_and_incomplete_rules`
const tree_with_empty_groups_and_incomplete_rules = {
  type: 'group',
  children1: [
    {
      type: 'group',
      children1: [{ type: 'rule', properties: { field: 'num', operator: 'between' } }],
    },
    { type: 'rule', properties: { field: 'num', operator: 'is_null' } },
    { type: 'group', children1: [{ type: 'rule', properties: {} }] },
    { type: 'rule', properties: { field: 'num', operator: 'greater' } },
    { type: 'rule', properties: { field: 'num', operator: 'less', value: [100] } },
    { type: 'group' },
  ],
} as RAQBJsonTree;

// RAQB: `with_empty_group_some`
const with_empty_group_some = {
  type: 'group',
  children1: [
    { type: 'rule_group', properties: { mode: 'array', operator: 'some', field: 'cars' } },
  ],
} as RAQBJsonTree;

// RAQB: `tree_with_vfunc_in_lhs_with_invalid_args_and_rhs`
const tree_with_vfunc_in_lhs = {
  type: 'group',
  children1: [
    {
      type: 'rule',
      properties: {
        fieldSrc: 'func',
        field: {
          func: 'vld.tfunc1',
          args: {
            str1: { valueSrc: 'value', value: 'aaaaaa' },
            str2: { valueSrc: 'value', value: 'bbbbbb' },
            num1: { valueSrc: 'value', value: 20 },
            num2: { valueSrc: 'value', value: 4 },
          },
        },
        operator: 'equal',
        value: ['xxxxxx'],
        valueSrc: ['value'],
      },
    },
  ],
} as RAQBJsonTree;

/**
 * Shape of a populated collection sub-query, per RAQB's `!group`/`mode: "array"` serialization
 * (cf. `with_empty_group_some` and the `some` JsonLogic fixtures).
 */
const tree_with_subquery = {
  type: 'group',
  properties: { conjunction: 'AND' },
  children1: [
    {
      type: 'rule_group',
      properties: {
        mode: 'array',
        operator: 'some',
        field: 'cars',
        conjunction: 'AND',
        value: [],
        valueSrc: [],
      },
      children1: [
        {
          type: 'rule',
          properties: {
            field: 'cars.vendor',
            operator: 'select_any_in',
            value: [['Ford', 'Toyota']],
            valueSrc: ['value'],
            valueType: ['multiselect'],
          },
        },
      ],
    },
  ],
} as RAQBJsonTree;

describe('parseRAQB with real RAQB fixtures', () => {
  it('converts `tree_with_number`', () => {
    expect(parseRAQB(tree_with_number)).toEqual({
      combinator: 'and',
      rules: [{ field: 'num', operator: '=', value: 2 }],
    });
  });

  it("drops empty groups, matching RAQB's `removeEmptyGroupsOnLoad` default", () => {
    expect(parseRAQB(tree_with_empty_group)).toEqual({ combinator: 'and', rules: [] });
  });

  it('drops incomplete rules and empty groups', () => {
    expect(parseRAQB(tree_with_empty_groups_and_incomplete_rules)).toEqual({
      combinator: 'and',
      rules: [
        { field: 'num', operator: 'null', value: '' },
        { field: 'num', operator: '<', value: 100 },
      ],
    });
  });

  it('converts an empty `some` rule group to a match-mode rule', () => {
    expect(parseRAQB(with_empty_group_some)).toEqual({
      combinator: 'and',
      rules: [
        {
          field: 'cars',
          operator: '=',
          match: { mode: 'some' },
          value: { combinator: 'and', rules: [] },
        },
      ],
    });
  });

  it('converts a populated collection sub-query', () => {
    expect(parseRAQB(tree_with_subquery)).toEqual({
      combinator: 'and',
      rules: [
        {
          field: 'cars',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [{ field: 'cars.vendor', operator: 'in', value: 'Ford,Toyota' }],
          },
        },
      ],
    });
  });

  it('converts a custom LHS function to an expression', () => {
    const unsupported: RAQBUnsupportedInfo[] = [];
    const result = parseRAQB(tree_with_vfunc_in_lhs, {
      onUnsupported: info => unsupported.push(info),
    });

    expect(result).toEqual({
      combinator: 'and',
      rules: [
        {
          field: 'vld.tfunc1',
          operator: '=',
          value: 'xxxxxx',
          lhs: {
            kind: 'func',
            fn: 'vld.tfunc1',
            args: [
              { kind: 'value', value: 'aaaaaa' },
              { kind: 'value', value: 'bbbbbb' },
              { kind: 'value', value: 20 },
              { kind: 'value', value: 4 },
            ],
          },
        },
      ],
    });
    expect(unsupported).toEqual([
      { reason: 'func', key: 'vld.tfunc1', message: expect.stringContaining('vld.tfunc1') },
    ]);
  });
});
