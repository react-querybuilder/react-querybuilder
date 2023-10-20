import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types/index.noReact';
import { transformQuery } from './transformQuery';

const query: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'f1', operator: '=', value: 'v1' }],
};
const queryIC: RuleGroupTypeIC = {
  rules: [{ rules: [] }, 'and', { rules: [] }],
};

const combinatorMap = { and: '&&', or: '||' } as const;

it('only adds path by default', () => {
  expect(transformQuery(query)).toEqual({
    ...query,
    path: [],
    rules: [{ ...query.rules[0], path: [0] }],
  });
  expect(transformQuery(queryIC)).toEqual({
    path: [],
    rules: [
      { ...queryIC.rules[0], path: [0] },
      queryIC.rules[1],
      { ...queryIC.rules[2], path: [2] },
    ],
  });
});

it('respects the ruleProcessor option', () => {
  expect(
    transformQuery(query, {
      ruleProcessor: r => `${r.field} ${r.operator} ${r.value}`,
    })
  ).toEqual({ combinator: 'and', rules: ['f1 = v1'], path: [] });
});

it('respects the ruleGroupProcessor option', () => {
  expect(
    transformQuery(query, {
      ruleGroupProcessor: rg => ({
        text: `rules.length == ${rg.rules.length}`,
      }),
    })
  ).toEqual({
    text: 'rules.length == 1',
    rules: query.rules.map((r, idx) => ({ ...r, path: [idx] })),
  });
});

it('respects the propertyMap option', () => {
  expect(
    transformQuery(query, {
      propertyMap: { combinator: 'AndOr', rules: 'filters', value: 'val', operator: false },
    })
  ).toEqual({
    AndOr: 'and',
    path: [],
    filters: [{ field: 'f1', val: 'v1', path: [0] }],
  });
});

it('avoids recursion for { rules: false } propertyMap', () => {
  expect(
    transformQuery(query, {
      propertyMap: { rules: false },
      ruleProcessor: () => {
        throw 'should never see this';
      },
    })
  ).toEqual({ combinator: 'and', path: [] });
});

it('does not set operator property if it is missing', () => {
  expect(
    transformQuery({ combinator: 'and', rules: [{ field: 'f1', value: 'v1' } as RuleType] })
  ).toEqual({
    combinator: 'and',
    path: [],
    rules: [{ field: 'f1', value: 'v1', path: [0] }],
  });
});

it('respects the combinatorMap option', () => {
  expect(transformQuery(query, { combinatorMap })).toEqual({
    ...query,
    path: [],
    combinator: '&&',
    rules: query.rules.map((r, idx) => ({ ...r, path: [idx] })),
  });
});

it('respects the operatorMap option', () => {
  expect(transformQuery(query, { operatorMap: { '=': '==' } })).toEqual({
    ...query,
    path: [],
    rules: [{ ...query.rules[0], operator: '==', path: [0] }],
  });
});

it('respects the omitPath option', () => {
  expect(transformQuery(query, { omitPath: true })).toEqual({
    ...query,
    rules: [{ ...query.rules[0], operator: '=' }],
  });
});

it('respects the deleteRemappedProperties option', () => {
  expect(
    transformQuery(query, {
      deleteRemappedProperties: false,
      propertyMap: {
        combinator: 'AndOr',
        value: 'val',
        operator: 'operator',
        unknownProperty: 'unknown',
      },
    })
  ).toEqual({
    combinator: 'and',
    path: [],
    AndOr: 'and',
    rules: [{ field: 'f1', operator: '=', val: 'v1', value: 'v1', path: [0] }],
  });
});

it('handles independent combinators and nested groups', () => {
  expect(
    transformQuery(
      {
        rules: [
          {
            rules: [
              { field: 'f1', operator: '=', value: 'v1' },
              'or',
              { field: 'f2', operator: '=', value: 'v2' },
            ],
          },
        ],
      },
      { ruleProcessor: () => 'Rule!', combinatorMap }
    )
  ).toEqual({
    path: [],
    rules: [{ rules: ['Rule!', '||', 'Rule!'], path: [0] }],
  });
  // This next test is really just to check that ruleGroupProcessor inherits
  // the type RuleGroupTypeIC from the first parameter.
  expect(transformQuery(queryIC, { ruleGroupProcessor: rg => rg })).toEqual({
    path: [],
    rules: [{ rules: [], path: [0] }, queryIC.rules[1], { rules: [], path: [2] }],
  });
});
