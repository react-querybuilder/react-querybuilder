import { defaultControlClassnames } from '../defaults';
import { mergeClassnames } from './mergeClassnames';

it('handles strings', () => {
  expect(mergeClassnames({ rule: 'r' })).toEqual({ ...defaultControlClassnames, rule: 'r' });
  expect(mergeClassnames({ rule: 'r', ruleGroup: 'rg' })).toEqual({
    ...defaultControlClassnames,
    rule: 'r',
    ruleGroup: 'rg',
  });
});

it('handles arrays and objects', () => {
  expect(mergeClassnames({ rule: ['r', 'r2'], ruleGroup: { rg: true } })).toEqual({
    ...defaultControlClassnames,
    rule: 'r r2',
    ruleGroup: 'rg',
  });
});

it('handles multiple objects and declaration types', () => {
  expect(
    mergeClassnames(
      { rule: ['r', 'r2'], ruleGroup: { rg: true } },
      { rule: { r3: 1, r4: 'yes' }, ruleGroup: 'rg2' }
    )
  ).toEqual({
    ...defaultControlClassnames,
    rule: 'r r2 r3 r4',
    ruleGroup: 'rg rg2',
  });
});
