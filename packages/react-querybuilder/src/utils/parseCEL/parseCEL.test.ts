import type { DefaultRuleGroupType, DefaultRuleType } from '../../types';
import { parseCEL } from './parseCEL';

const wrapRule = (rule?: DefaultRuleType): DefaultRuleGroupType => ({
  combinator: 'and',
  rules: rule ? [rule] : [],
});
// const wrapRuleIC = (rule?: DefaultRuleType): DefaultRuleGroupTypeIC => ({
//   rules: rule ? [rule] : [],
// });
// const icOpts = { independentCombinators: true } as const;

it('works for basic relations', () => {
  expect(parseCEL('f1 == "Test"')).toEqual(wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
  expect(parseCEL('f1 != "Test"')).toEqual(
    wrapRule({ field: 'f1', operator: '!=', value: 'Test' })
  );
  expect(parseCEL('f1 > 1')).toEqual(wrapRule({ field: 'f1', operator: '>', value: 1 }));
  expect(parseCEL('f1 >= 1')).toEqual(wrapRule({ field: 'f1', operator: '>=', value: 1 }));
  expect(parseCEL('f1 < 1')).toEqual(wrapRule({ field: 'f1', operator: '<', value: 1 }));
  expect(parseCEL('f1 <= 1')).toEqual(wrapRule({ field: 'f1', operator: '<=', value: 1 }));
});

it('works for conditional and/or', () => {
  expect(parseCEL('f1 == "Test" && f2 == "Test2"')).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
  expect(parseCEL('f1 == "Test" || f2 == "Test2"')).toEqual({
    combinator: 'and',
    rules: [
      { field: 'f1', operator: '=', value: 'Test' },
      { field: 'f2', operator: '=', value: 'Test2' },
    ],
  });
});
