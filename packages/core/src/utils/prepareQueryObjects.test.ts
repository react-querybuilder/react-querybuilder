import type { RuleGroupType, RuleGroupTypeIC, RuleType } from '../types';
import { uuidV4regex } from './generateID';
import {
  prepareRule,
  prepareRuleGroup,
  prepareRuleOrGroup,
  resolveCandidateQuery,
} from './prepareQueryObjects';

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

  it('should preserve meta property', () => {
    const meta = { subject: '?person', tripleRole: 'pattern' as const };
    const preparedRule = prepareRule({ field: 'foaf:name', operator: '=', value: 'Test', meta });
    expect(preparedRule.meta).toEqual(meta);
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

  it('should preserve meta on rules within a group', () => {
    const meta = { nodeAlias: 'a', graphRole: 'pattern' as const };
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [{ field: 'a.name', operator: '=', value: 'Test', meta }],
    };
    const validQuery = prepareRuleGroup(query);
    expect((validQuery.rules[0] as RuleType).meta).toEqual(meta);
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

describe('resolveCandidateQuery', () => {
  const fallbackQuery: RuleGroupType = { id: 'fallback', combinator: 'and', rules: [] };
  const controlled: RuleGroupType = { id: 'controlled', combinator: 'and', rules: [] };
  const stored: RuleGroupType = { id: 'stored', combinator: 'and', rules: [] };
  const defaulted: RuleGroupType = { id: 'defaulted', combinator: 'and', rules: [] };

  it('prefers the controlled query', () => {
    expect(
      resolveCandidateQuery({
        query: controlled,
        storeQuery: stored,
        defaultQuery: defaulted,
        fallbackQuery,
      }).id
    ).toBe('controlled');
  });

  it('falls back to the store, then the default, then the fallback', () => {
    expect(
      resolveCandidateQuery({ storeQuery: stored, defaultQuery: defaulted, fallbackQuery }).id
    ).toBe('stored');
    expect(resolveCandidateQuery({ defaultQuery: defaulted, fallbackQuery }).id).toBe('defaulted');
    expect(resolveCandidateQuery({ fallbackQuery }).id).toBe('fallback');
  });

  it('prepares a query that has no id', () => {
    const raw = { combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v1' }] };
    const result = resolveCandidateQuery({ query: raw as RuleGroupType, fallbackQuery });
    expect(result.id).toBeDefined();
    expect((result.rules[0] as RuleType).id).toBeDefined();
  });

  it('leaves an already-prepared query untouched', () => {
    expect(resolveCandidateQuery({ query: controlled, fallbackQuery })).toBe(controlled);
  });

  it('uses the given idGenerator', () => {
    let i = 0;
    const result = resolveCandidateQuery(
      { query: { combinator: 'and', rules: [] } as RuleGroupType, fallbackQuery },
      { idGenerator: () => `id-${i++}` }
    );
    expect(result.id).toBe('id-0');
  });
});
