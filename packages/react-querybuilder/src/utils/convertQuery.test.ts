import type { RuleType } from '../types/index.noReact';
import { convertQuery } from './convertQuery';

const [rule1, rule2, rule3, rule4]: RuleType[] = [
  {
    field: 'firstName',
    operator: '=',
    value: 'Steve',
  },
  {
    field: 'lastName',
    operator: '=',
    value: 'Vai',
  },
  {
    field: 'firstName',
    operator: 'beginsWith',
    value: 'Stev',
  },
  {
    field: 'lastName',
    operator: 'beginsWith',
    value: 'Va',
  },
];

describe('converts RuleGroupType to RuleGroupTypeIC', () => {
  it('no rules', () => {
    expect(convertQuery({ combinator: 'and', rules: [] })).toEqual({ rules: [] });
  });
  it('one rule', () => {
    expect(convertQuery({ combinator: 'and', rules: [rule1] })).toEqual({ rules: [rule1] });
  });
  it('two rules', () => {
    expect(convertQuery({ combinator: 'and', rules: [rule1, rule2] })).toEqual({
      rules: [rule1, 'and', rule2],
    });
  });
  it('nested groups', () => {
    expect(
      convertQuery({
        combinator: 'or',
        rules: [
          { combinator: 'and', rules: [rule1, rule2] },
          { combinator: 'and', rules: [rule3, rule4] },
        ],
      })
    ).toEqual({
      rules: [{ rules: [rule1, 'and', rule2] }, 'or', { rules: [rule3, 'and', rule4] }],
    });
  });
  it('extra properties', () => {
    expect(
      convertQuery({
        path: [0, 1, 2],
        id: 'test',
        combinator: 'and',
        rules: [rule1, rule2],
      })
    ).toEqual({
      path: [0, 1, 2],
      id: 'test',
      rules: [rule1, 'and', rule2],
    });
  });
});

describe('converts RuleGroupTypeIC to RuleGroupType', () => {
  it('no rules', () => {
    expect(convertQuery({ rules: [] })).toEqual({ combinator: 'and', rules: [] });
  });
  it('one rule', () => {
    expect(convertQuery({ rules: [rule1] })).toEqual({ combinator: 'and', rules: [rule1] });
  });
  it('two rules', () => {
    expect(
      convertQuery({
        rules: [rule1, 'and', rule2],
      })
    ).toEqual({ combinator: 'and', rules: [rule1, rule2] });
  });
  it('nested groups', () => {
    expect(
      convertQuery({
        rules: [{ rules: [rule1, 'and', rule2] }, 'or', { rules: [rule3, 'and', rule4] }],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { combinator: 'and', rules: [rule1, rule2] },
        { combinator: 'and', rules: [rule3, rule4] },
      ],
    });
  });
  it('different combinators in same group', () => {
    expect(
      convertQuery({
        rules: [rule1, 'and', rule2, 'or', rule3, 'and', rule4],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { combinator: 'and', rules: [rule1, rule2] },
        { combinator: 'and', rules: [rule3, rule4] },
      ],
    });
  });
  it('covers all code branches', () => {
    expect(
      convertQuery({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'and',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'or',
          { field: 'middleName', operator: 'null', value: null },
          'or',
          { field: 'isMusician', operator: '=', value: true },
          'or',
          { field: 'fieldName', operator: '=', value: 'Test' },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        {
          combinator: 'and',
          rules: [
            { field: 'firstName', operator: '=', value: 'Steve' },
            { field: 'lastName', operator: '=', value: 'Vai' },
          ],
        },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
        { field: 'fieldName', operator: '=', value: 'Test' },
      ],
    });
    expect(
      convertQuery({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'or',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'or',
          { field: 'middleName', operator: 'null', value: null },
          'or',
          { field: 'isMusician', operator: '=', value: true },
          'or',
          { field: 'fieldName', operator: '=', value: 'Test' },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
        { field: 'middleName', operator: 'null', value: null },
        { field: 'isMusician', operator: '=', value: true },
        { field: 'fieldName', operator: '=', value: 'Test' },
      ],
    });
    expect(
      convertQuery({
        rules: [
          { field: 'firstName', operator: '=', value: 'Steve' },
          'or',
          { field: 'lastName', operator: '=', value: 'Vai' },
          'or',
          { field: 'middleName', operator: 'null', value: null },
          'and',
          { field: 'isMusician', operator: '=', value: true },
          'or',
          { field: 'fieldName', operator: '=', value: 'Test' },
        ],
      })
    ).toEqual({
      combinator: 'or',
      rules: [
        { field: 'firstName', operator: '=', value: 'Steve' },
        { field: 'lastName', operator: '=', value: 'Vai' },
        {
          combinator: 'and',
          rules: [
            { field: 'middleName', operator: 'null', value: null },
            { field: 'isMusician', operator: '=', value: true },
          ],
        },
        { field: 'fieldName', operator: '=', value: 'Test' },
      ],
    });
  });
  it('extra properties', () => {
    expect(
      convertQuery({
        path: [0, 1, 2],
        id: 'test',
        rules: [rule1, 'and', rule2],
      })
    ).toEqual({
      path: [0, 1, 2],
      id: 'test',
      combinator: 'and',
      rules: [rule1, rule2],
    });
  });
});
