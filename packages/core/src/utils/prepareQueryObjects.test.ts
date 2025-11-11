import type { RuleGroupType, RuleGroupTypeIC } from '../types';
import { uuidV4regex } from './generateIDTestUtils';
import { prepareRule, prepareRuleGroup, prepareRuleOrGroup } from './prepareQueryObjects';

describe('prepareRule', () => {
  it('should not generate new ID if rule provides it', () => {
    expect(
      prepareRule({ id: 'r-12345', field: 'firstName', operator: '=', value: 'Test with ID' }).id
    ).toBe('r-12345');
  });

  it('should generate new ID if missing in rule', () => {
    expect(prepareRule({ field: 'firstName', operator: '=', value: 'Test without ID' }).id).toMatch(
      uuidV4regex
    );
  });

  it('should generate new IDs for subqueries', () => {
    const preparedRule = prepareRule({
      field: 'firstName',
      operator: '=',
      match: { mode: 'all' },
      value: {
        combinator: 'and',
        rules: [{ field: 'firstName', operator: '=', value: 'Test without ID' }],
      },
    });
    expect(preparedRule.value.id).toMatch(uuidV4regex);
    expect(preparedRule.value.rules[0].id).toMatch(uuidV4regex);
  });
});

describe('when initial query, with ID, is provided', () => {
  const queryWithID: RuleGroupType = {
    id: 'g-12345',
    combinator: 'and',
    rules: [{ id: 'r-12345', field: 'firstName', operator: '=', value: 'Test' }],
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
    rules: [{ field: 'firstName', operator: '=', value: 'Test without ID' }],
  };
  const queryICWithoutID: RuleGroupTypeIC = {
    rules: [
      { field: 'firstName', operator: '=', value: 'Test without ID' },
      'and',
      { field: 'firstName', operator: '=', value: 'Test without ID' },
    ],
  };

  it('should generate IDs if missing in query', () => {
    expect(queryWithoutID).not.toHaveProperty('id');
    const validQuery = prepareRuleGroup(queryWithoutID);
    expect(validQuery.id).toMatch(uuidV4regex);
    expect(validQuery.rules[0].id).toMatch(uuidV4regex);
  });

  it('should generate IDs only for valid query objects', () => {
    expect(queryICWithoutID).not.toHaveProperty('id');
    const validQuery = prepareRuleGroup(queryICWithoutID);
    expect(validQuery.id).toMatch(uuidV4regex);
    expect(validQuery.rules[0].id).toMatch(uuidV4regex);
    expect(validQuery.rules[1]).toBe('and');
    expect(validQuery.rules[2]?.id).toMatch(uuidV4regex);
  });
});

describe('prepareRuleOrGroup', () => {
  it('should not generate new ID if rule provides it', () => {
    expect(
      prepareRuleOrGroup({
        id: 'r-12345',
        field: 'firstName',
        operator: '=',
        value: 'Test with ID',
      }).id
    ).toBe('r-12345');
  });

  it('should generate new ID if missing in rule', () => {
    expect(
      prepareRuleOrGroup({ field: 'firstName', operator: '=', value: 'Test without ID' }).id
    ).toMatch(uuidV4regex);
  });
});
