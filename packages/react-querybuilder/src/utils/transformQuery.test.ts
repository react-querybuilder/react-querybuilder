import type { RuleGroupType, RuleGroupTypeIC } from '../types/index.noReact';
import { transformQuery } from './transformQuery';

const query: RuleGroupType = {
  combinator: 'and',
  rules: [{ field: 'f1', operator: '=', value: 'v1' }],
};
const queryIC: RuleGroupTypeIC = { rules: [{ rules: [] }, 'and', { rules: [] }] };

const combinatorMap = { and: '&&', or: '||' } as const;

it('does nothing by default', () => {
  expect(transformQuery(query)).toEqual(query);
  expect(transformQuery(queryIC)).toEqual(queryIC);
});

it('respects the ruleProcessor option', () => {
  expect(
    transformQuery(query, { ruleProcessor: r => `${r.field} ${r.operator} ${r.value}` })
  ).toEqual({ combinator: 'and', rules: ['f1 = v1'] });
});

it('respects the ruleGroupProcessor option', () => {
  expect(
    transformQuery(query, {
      ruleGroupProcessor: rg => ({ text: `rules.length == ${rg.rules.length}` }),
    })
  ).toEqual({ text: 'rules.length == 1', rules: query.rules });
});

it('respects the propertyMap option', () => {
  expect(transformQuery(query, { propertyMap: { combinator: 'AndOr', value: 'val' } })).toEqual({
    AndOr: 'and',
    rules: [{ field: 'f1', operator: '=', val: 'v1' }],
  });
});

it('respects the combinatorMap option', () => {
  expect(transformQuery(query, { combinatorMap })).toEqual({
    ...query,
    combinator: '&&',
  });
});

it('respects the operatorMap option', () => {
  expect(transformQuery(query, { operatorMap: { '=': '==' } })).toEqual({
    ...query,
    rules: [{ ...query.rules[0], operator: '==' }],
  });
});

it('respects the deleteRemappedProperties option', () => {
  expect(
    transformQuery(query, {
      deleteRemappedProperties: false,
      propertyMap: { combinator: 'AndOr', value: 'val' },
    })
  ).toEqual({
    combinator: 'and',
    AndOr: 'and',
    rules: [{ field: 'f1', operator: '=', val: 'v1', value: 'v1' }],
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
    rules: [{ rules: ['Rule!', '||', 'Rule!'] }],
  });
});
