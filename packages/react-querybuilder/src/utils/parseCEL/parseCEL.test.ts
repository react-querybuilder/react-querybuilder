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

it('works', () => {
  expect(parseCEL('f1 == "Test"')).toEqual(wrapRule({ field: 'f1', operator: '=', value: 'Test' }));
});
