import type { RuleGroupType, RuleGroupTypeIC } from '../types/index.noReact';
import { prepareRule, prepareRuleGroup } from './prepareQueryObjects';

describe('prepareRule', () => {
  it('should not generate new ID if rule provides it', () => {
    expect(
      prepareRule({
        id: 'r-12345',
        field: 'firstName',
        value: 'Test with ID',
        operator: '=',
      }).id
    ).toBe('r-12345');
  });
  it('should generate new ID if missing in rule', () => {
    expect(
      prepareRule({
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      })
    ).toHaveProperty('id');
  });
});

describe('when initial query, with ID, is provided', () => {
  const queryWithID: RuleGroupType = {
    id: 'g-12345',
    combinator: 'and',
    rules: [
      {
        id: 'r-12345',
        field: 'firstName',
        value: 'Test',
        operator: '=',
      },
    ],
  };

  it('should not generate new ID if query provides ID', () => {
    const validQuery = prepareRuleGroup(queryWithID);
    expect(validQuery.id).toBe('g-12345');
    expect(validQuery.rules[0].id).toBe('r-12345');
  });
});

describe('when initial query, without ID, is provided', () => {
  const queryWithoutID: RuleGroupType = {
    combinator: 'and',
    rules: [
      {
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      },
    ],
  };
  const queryICWithoutID: RuleGroupTypeIC = {
    rules: [
      {
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      },
      'and',
      {
        field: 'firstName',
        value: 'Test without ID',
        operator: '=',
      },
    ],
  };

  it('should generate IDs if missing in query', () => {
    expect(queryWithoutID).not.toHaveProperty('id');
    const validQuery = prepareRuleGroup(queryWithoutID);
    expect(validQuery).toHaveProperty('id');
    expect(validQuery.rules[0]).toHaveProperty('id');
  });

  it('should generate IDs only for valid query objects', () => {
    expect(queryICWithoutID).not.toHaveProperty('id');
    const validQuery = prepareRuleGroup(queryICWithoutID);
    expect(validQuery).toHaveProperty('id');
    expect(validQuery.rules[0]).toHaveProperty('id');
    expect(validQuery.rules[1]).toBe('and');
    expect(validQuery.rules[2]).toHaveProperty('id');
  });
});
