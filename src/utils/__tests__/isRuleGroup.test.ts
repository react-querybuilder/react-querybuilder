import { isRuleGroup } from '..';

describe('isRuleGroup', () => {
  const rule = {
    id: 'r-01234',
    field: 'test',
    operator: '=',
    value: 'test value'
  };

  const ruleGroup = {
    id: 'g-01234',
    combinator: 'and',
    rules: []
  };

  it('identifies a rule', () => {
    expect(isRuleGroup(rule)).to.be.false;
  });

  it('identifies a rule group', () => {
    expect(isRuleGroup(ruleGroup)).to.be.true;
  });
});
