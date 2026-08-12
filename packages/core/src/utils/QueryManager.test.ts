import { defaultPlaceholderName } from '../defaults';
import type {
  FullCombinator,
  FullField,
  FullOption,
  QueryHistoryOptions,
  RuleGroupType,
  RuleGroupTypeAny,
  RuleGroupTypeIC,
  RuleType,
  ValidationMap,
} from '../types';
import { formatQuery } from './formatQuery';
import { QueryManager, QueryManagerError } from './QueryManager';

const fields = [
  { name: 'firstName', label: 'First Name' },
  { name: 'lastName', label: 'Last Name' },
  { name: 'age', label: 'Age', inputType: 'number' },
];

const rule = (field = 'firstName', value = 'Steve'): RuleType => ({ field, operator: '=', value });

/** Strips `id` recursively so structural assertions stay readable. */
const stripIds = (obj: unknown): unknown => {
  if (Array.isArray(obj)) return obj.map(o => stripIds(o));
  if (obj && typeof obj === 'object') {
    const { id: _id, ...rest } = obj as Record<string, unknown>;
    return Object.fromEntries(Object.entries(rest).map(([k, v]) => [k, stripIds(v)]));
  }
  return obj;
};

describe('constructor', () => {
  it('defaults to an empty root group with an id', () => {
    const q = new QueryManager();
    const query = q.getQuery();
    expect(query.id).toBeDefined();
    expect(query).toMatchObject({ combinator: 'and', rules: [], not: false });
  });

  it('accepts an initial query', () => {
    const initial: RuleGroupType = { combinator: 'or', rules: [rule()] };
    const q = new QueryManager(initial);
    expect(q.getQuery().combinator).toBe('or');
    expect(q.getQuery().rules).toHaveLength(1);
  });

  it('generates ids for an id-less initial query', () => {
    const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] });
    expect(q.getQuery().id).toBeDefined();
    expect((q.getQuery().rules[0] as RuleType).id).toBeDefined();
  });

  it('generates the group id before any contained rule id', () => {
    // Matches the order the `QueryBuilder` component has always used. Observable only with a
    // deterministic `idGenerator`.
    let i = 0;
    const q = new QueryManager<RuleGroupType>(
      { id: 'root', combinator: 'and', rules: [] },
      { fields, addRuleToNewGroups: true, idGenerator: () => `id-${i++}` }
    );
    const g = q.createRuleGroup();
    expect(g.id).toBe('id-0');
    expect((g.rules[0] as RuleType).id).toBe('id-1');
  });

  it('keeps the first field when getDefaultField returns a falsy value', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields, getDefaultField: () => '' });
    expect(q.createRule().field).toBe('firstName');
  });

  it('uses a custom idGenerator', () => {
    let i = 0;
    const q = new QueryManager(undefined, { idGenerator: () => `id-${i++}` });
    expect(q.getQuery().id).toBe('id-0');
  });

  it('uses the first configured combinator', () => {
    const q = new QueryManager(undefined, { combinators: [{ name: 'or', label: 'OR' }] });
    expect((q.getQuery() as RuleGroupType).combinator).toBe('or');
  });

  it('accepts an independent combinators query', () => {
    const q = new QueryManager<RuleGroupTypeIC>({ rules: [rule(), 'and', rule('lastName')] });
    expect(q.getQuery().rules).toHaveLength(3);
  });
});

describe('createRule', () => {
  it('uses the first field and operator by default', () => {
    const q = new QueryManager(undefined, { fields });
    expect(q.createRule()).toMatchObject({
      field: 'firstName',
      operator: '=',
      value: '',
      valueSource: 'value',
    });
  });

  it('falls back to an empty field with no fields configured', () => {
    // The default placeholder field is the only option.
    expect(new QueryManager().createRule().field).toBe('~');
  });

  it('honors getDefaultField as a string and a function', () => {
    expect(new QueryManager(undefined, { fields, getDefaultField: 'age' }).createRule().field).toBe(
      'age'
    );
    expect(
      new QueryManager(undefined, {
        fields,
        getDefaultField: flds => (flds[1] as { name: string }).name,
      }).createRule().field
    ).toBe('lastName');
  });

  it('honors getDefaultOperator as a string and a function', () => {
    expect(
      new QueryManager(undefined, { fields, getDefaultOperator: 'beginsWith' }).createRule()
        .operator
    ).toBe('beginsWith');
    expect(
      new QueryManager(undefined, {
        fields,
        getDefaultOperator: f => (f === 'firstName' ? 'contains' : '='),
      }).createRule().operator
    ).toBe('contains');
  });

  it("honors a field's defaultOperator", () => {
    const q = new QueryManager(undefined, {
      fields: [{ name: 'firstName', label: 'First Name', defaultOperator: 'endsWith' }],
    });
    expect(q.createRule().operator).toBe('endsWith');
  });

  it('honors getOperators', () => {
    const q = new QueryManager(undefined, {
      fields,
      getOperators: () => [{ name: 'contains', label: 'contains' }],
    });
    expect(q.createRule().operator).toBe('contains');
  });

  it("honors a field's operators", () => {
    const q = new QueryManager(undefined, {
      fields: [{ name: 'firstName', label: 'First Name', operators: [{ name: '>', label: '>' }] }],
    });
    expect(q.createRule().operator).toBe('>');
  });

  it('honors getDefaultValue', () => {
    const q = new QueryManager(undefined, { fields, getDefaultValue: () => 'preset' });
    expect(q.createRule().value).toBe('preset');
  });

  it('honors getValueEditorType and getValues for select defaults', () => {
    const q = new QueryManager(undefined, {
      fields,
      getValueEditorType: () => 'select',
      getValues: () => [{ name: 'v1', label: 'V1' }],
    });
    expect(q.createRule().value).toBe('v1');
  });

  it("honors a field's values and valueEditorType", () => {
    const q = new QueryManager(undefined, {
      fields: [
        {
          name: 'firstName',
          label: 'First Name',
          valueEditorType: 'select',
          values: [{ name: 'v2', label: 'V2' }],
        },
      ],
    });
    expect(q.createRule().value).toBe('v2');
  });

  it("honors a field's function-form valueEditorType", () => {
    const q = new QueryManager(undefined, {
      fields: [
        { name: 'firstName', label: 'First Name', valueEditorType: () => 'checkbox' as const },
      ],
    });
    expect(q.createRule().value).toBe(false);
  });

  it('honors getValueSources', () => {
    const q = new QueryManager(undefined, { fields, getValueSources: () => ['field', 'value'] });
    expect(q.createRule().valueSource).toBe('field');
  });

  it('honors getMatchModes', () => {
    const q = new QueryManager(undefined, {
      fields: [{ name: 'sub', label: 'Sub', matchModes: true }],
    });
    expect(q.createRule().match).toEqual({ mode: 'all', threshold: 1 });
  });

  it('honors getMatchModes as an option', () => {
    const q = new QueryManager(undefined, { fields, getMatchModes: () => ['some'] });
    expect(q.createRule().match).toEqual({ mode: 'some', threshold: 1 });
  });

  it('honors getParameters', () => {
    const q = new QueryManager(undefined, {
      fields,
      getValueSources: () => ['parameter'],
      getParameters: () => [{ name: 'p1', label: 'P1' }],
    });
    expect(q.createRule().value).toBe('p1');
  });

  it('honors listsAsArrays for between operators', () => {
    const q = new QueryManager(undefined, {
      fields,
      getDefaultOperator: 'between',
      getValueEditorType: () => 'select',
      getValues: () => [{ name: 'v1', label: 'V1' }],
      listsAsArrays: true,
    });
    expect(q.createRule().value).toEqual(['v1', 'v1']);
  });

  it('honors autoSelectValue', () => {
    const q = new QueryManager(undefined, {
      fields,
      autoSelectValue: false,
      getValueEditorType: () => 'select',
      getValues: () => [{ name: 'v1', label: 'V1' }],
    });
    expect(q.createRule().value).toBe('~');
  });

  it('falls back to empty strings when the option lists are empty', () => {
    const q = new QueryManager(undefined, { fields: [], operators: [] });
    expect(q.createRule()).toMatchObject({ field: '', operator: '', value: '' });
  });

  it('handles getParameters returning null', () => {
    const q = new QueryManager(undefined, {
      fields,
      getValueSources: () => ['parameter'],
      getParameters: () => null,
    });
    expect(q.createRule().value).toBe('');
  });

  it('falls back to the "value" value source when the list is empty', () => {
    const q = new QueryManager(undefined, { fields, getValueSources: () => [] as never });
    expect(q.createRule().valueSource).toBe('value');
  });
});

describe('createRuleGroup', () => {
  it('creates an empty standard group', () => {
    const q = new QueryManager(undefined, { fields });
    expect(stripIds(q.createRuleGroup())).toEqual({ combinator: 'and', rules: [], not: false });
  });

  it('creates an independent combinators group', () => {
    const q = new QueryManager(undefined, { fields });
    expect(stripIds(q.createRuleGroup(true))).toEqual({ rules: [], not: false });
  });

  it('honors addRuleToNewGroups', () => {
    const q = new QueryManager(undefined, { fields, addRuleToNewGroups: true });
    expect(q.createRuleGroup().rules).toHaveLength(1);
    expect(q.createRuleGroup(true).rules).toHaveLength(1);
  });

  it('falls back to an empty combinator when none are available', () => {
    const q = new QueryManager(undefined, { combinators: [] });
    expect((q.createRuleGroup() as RuleGroupType).combinator).toBe('');
  });
});

describe('add', () => {
  it('adds to the root group by default', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.getQuery().rules).toHaveLength(1);
  });

  it('adds to a nested group by id', () => {
    const q = new QueryManager(undefined, { fields });
    const group = q.createRuleGroup();
    q.add(group).add(rule(), group.id);
    expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(1);
  });

  it('adds to a nested group by path', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(q.createRuleGroup()).add(rule(), [0]);
    expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(1);
  });

  it('inserts combinators for independent combinator queries', () => {
    const q = new QueryManager<RuleGroupTypeIC>({ rules: [] });
    q.add(rule()).add(rule('lastName'));
    expect(q.getQuery().rules[1]).toBe('and');
  });

  it('honors combinatorPreceding', () => {
    const q = new QueryManager<RuleGroupTypeIC>({ rules: [] });
    q.add(rule()).add(rule('lastName'), [], { combinatorPreceding: 'or' });
    expect(q.getQuery().rules[1]).toBe('or');
  });

  it('is a no-op for an unknown parent', () => {
    const q = new QueryManager(undefined, { fields });
    const before = q.getQuery();
    q.add(rule(), 'nonexistent');
    expect(q.getQuery()).toBe(before);
  });
});

describe('remove', () => {
  it('removes by id and by path', () => {
    const q = new QueryManager(undefined, { fields });
    const r1 = { ...rule(), id: 'r1' };
    q.add(r1).add(rule('lastName'));
    q.remove('r1');
    expect(q.getQuery().rules).toHaveLength(1);
    q.remove([0]);
    expect(q.getQuery().rules).toHaveLength(0);
  });

  it('removes a nested rule', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(q.createRuleGroup()).add(rule(), [0]).remove([0, 0]);
    expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(0);
  });

  it('is a no-op for the root group', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    const before = q.getQuery();
    q.remove([]);
    expect(q.getQuery()).toBe(before);
  });

  it('is a no-op for an unknown id', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    const before = q.getQuery();
    q.remove('nonexistent');
    expect(q.getQuery()).toBe(before);
  });
});

describe('update', () => {
  it('updates a single property', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update('value', 'Vai', 'r1');
    expect((q.getQuery().rules[0] as RuleType).value).toBe('Vai');
  });

  it('updates with parallel arrays', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update(['operator', 'value'], ['contains', 'Va'], 'r1');
    expect(q.getQuery().rules[0]).toMatchObject({ operator: 'contains', value: 'Va' });
  });

  it('updates with a property map', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update({ operator: 'beginsWith', value: 'St' }, 'r1');
    expect(q.getQuery().rules[0]).toMatchObject({ operator: 'beginsWith', value: 'St' });
  });

  it('resets value on field change by default', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update('field', 'lastName', 'r1');
    expect(q.getQuery().rules[0]).toMatchObject({ field: 'lastName', value: '' });
  });

  it('honors resetOnFieldChange: false', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update('field', 'lastName', 'r1', { resetOnFieldChange: false });
    expect((q.getQuery().rules[0] as RuleType).value).toBe('Steve');
  });

  it('does not clobber an explicit value in a multi-property update', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update({ field: 'lastName', value: 'Vai' }, 'r1');
    expect(q.getQuery().rules[0]).toMatchObject({ field: 'lastName', value: 'Vai' });
  });

  it('honors resetOnOperatorChange with the map form', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).update({ operator: 'contains' }, 'r1', {
      resetOnOperatorChange: true,
    });
    expect((q.getQuery().rules[0] as RuleType).value).toBe('');
  });

  it('updates a group combinator', () => {
    const q = new QueryManager(undefined, { fields });
    q.update('combinator', 'or', []);
    expect((q.getQuery() as RuleGroupType).combinator).toBe('or');
  });
});

describe('move', () => {
  const twoRules = () => {
    const q = new QueryManager(undefined, { fields });
    return q.add({ ...rule(), id: 'r1' }).add({ ...rule('lastName'), id: 'r2' });
  };

  it('moves by id with a direction', () => {
    const q = twoRules().move('r1', 'down');
    expect((q.getQuery().rules[0] as RuleType).id).toBe('r2');
  });

  it('moves up by id', () => {
    const q = twoRules().move('r2', 'up');
    expect((q.getQuery().rules[0] as RuleType).id).toBe('r2');
  });

  it('moves by path', () => {
    const q = twoRules().move([0], [2]);
    expect((q.getQuery().rules[0] as RuleType).id).toBe('r2');
  });

  it('clones instead of moving', () => {
    const q = twoRules().move('r1', [2], { clone: true });
    expect(q.getQuery().rules).toHaveLength(3);
  });

  it('is a no-op for an unknown id', () => {
    const q = twoRules();
    const before = q.getQuery();
    q.move('nonexistent', 'up');
    expect(q.getQuery()).toBe(before);
  });
});

describe('insert', () => {
  it('inserts at a path', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).insert(rule('lastName'), [0]);
    expect(q.getQuery().rules).toHaveLength(2);
    // `insert` regenerates ids, so identify the inserted rule by its field.
    expect((q.getQuery().rules[0] as RuleType).field).toBe('lastName');
  });

  it('replaces at a path', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' }).insert(rule('lastName'), [0], { replace: true });
    expect(q.getQuery().rules).toHaveLength(1);
    expect((q.getQuery().rules[0] as RuleType).field).toBe('lastName');
  });

  it('inserts into an independent combinators query', () => {
    const q = new QueryManager<RuleGroupTypeIC>({ rules: [rule()] });
    q.insert(rule('lastName'), [1]);
    expect(q.getQuery().rules[1]).toBe('and');
  });

  it('honors combinatorSucceeding when inserting first in an independent combinators group', () => {
    const q = new QueryManager<RuleGroupTypeIC>({ rules: [rule()] });
    // `combinatorSucceeding` only applies when the inserted item reports an original
    // path ending at index 0.
    q.insert({ ...rule('lastName'), path: [0] }, [0], { combinatorSucceeding: 'or' });
    expect(q.getQuery().rules[1]).toBe('or');
  });
});

describe('group', () => {
  it('groups two rules by id', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' })
      .add({ ...rule('lastName'), id: 'r2' })
      .group('r2', 'r1');
    expect(q.getQuery().rules).toHaveLength(1);
    expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(2);
  });

  it('groups by path with clone', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' })
      .add({ ...rule('lastName'), id: 'r2' })
      .group([1], [0], { clone: true });
    expect(q.getQuery().rules).toHaveLength(2);
  });
});

describe('chaining and immutability', () => {
  it('returns the instance from every mutator', () => {
    const q = new QueryManager(undefined, { fields });
    expect(q.add(rule())).toBe(q);
    expect(q.update('value', 'x', [0])).toBe(q);
    expect(q.move([0], 'down')).toBe(q);
    expect(q.insert(rule(), [0])).toBe(q);
    expect(q.group([0], [1])).toBe(q);
    expect(q.remove([0])).toBe(q);
    expect(q.setQuery({ combinator: 'and', rules: [] })).toBe(q);
  });

  it('does not mutate a previously returned query', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' });
    const before = q.getQuery();
    const beforeJson = JSON.stringify(before);
    q.add(rule('lastName'));
    expect(JSON.stringify(before)).toBe(beforeJson);
    expect(q.getQuery()).not.toBe(before);
  });
});

describe('setQuery / getQuery', () => {
  it('replaces the query and assigns ids', () => {
    const q = new QueryManager(undefined, { fields });
    q.setQuery({ combinator: 'or', rules: [rule()] });
    expect(q.getQuery().combinator).toBe('or');
    expect((q.getQuery().rules[0] as RuleType).id).toBeDefined();
  });
});

describe('validate', () => {
  it('uses defaultValidator by default', () => {
    const q = new QueryManager(undefined, { fields });
    const result = q.validate() as ValidationMap;
    expect(result[q.getQuery().id!]).toEqual({ valid: false, reasons: ['empty'] });
  });

  it('uses a custom validator', () => {
    const q = new QueryManager(undefined, { fields, validator: () => true });
    expect(q.validate()).toBe(true);
  });
});

describe('format', () => {
  it('defaults to JSON', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format()).toBe(formatQuery(q.getQuery()));
  });

  it('accepts a format string', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format('sql')).toBe("(firstName = 'Steve')");
  });

  it('accepts an options object', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format({ format: 'sql', quoteFieldNamesWith: '"' })).toBe('("firstName" = \'Steve\')');
  });

  it('returns objects for object formats', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format('parameterized')).toEqual({ sql: '(firstName = ?)', params: ['Steve'] });
  });

  it('accepts a custom ruleGroupProcessor', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format({ ruleGroupProcessor: rg => rg.rules.length })).toBe(1);
  });

  it('matches formatQuery called directly', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format('mongodb_query')).toEqual(formatQuery(q.getQuery(), 'mongodb_query'));
  });
});

describe('clone', () => {
  it('produces an independent manager with the same query', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' });
    const c = q.clone();

    expect(c).not.toBe(q);
    expect(c.getQuery()).toBe(q.getQuery());

    c.add(rule('lastName'));
    expect(c.getQuery().rules).toHaveLength(2);
    expect(q.getQuery().rules).toHaveLength(1);
  });

  it('carries configuration over to the clone', () => {
    const q = new QueryManager(undefined, { fields, getDefaultField: 'age' });
    expect(q.clone().createRule().field).toBe('age');
  });

  it('regenerates ids on request', () => {
    const q = new QueryManager(undefined, { fields });
    q.add({ ...rule(), id: 'r1' });
    const c = q.clone({ regenerateIDs: true });

    expect((c.getQuery().rules[0] as RuleType).id).not.toBe('r1');
    expect((c.getQuery().rules[0] as RuleType).field).toBe('firstName');
  });

  it('does not carry over subscribers or history', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields, history: true });
    q.subscribe(listener);
    q.add(rule());

    expect(q.canUndo()).toBe(true);

    const c = q.clone();
    expect(c.canUndo()).toBe(false);

    listener.mockClear();
    c.add(rule('lastName'));
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('subscribe', () => {
  it('notifies listeners on every change', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(listener);

    q.add({ ...rule(), id: 'r1' });
    expect(listener).toHaveBeenCalledTimes(1);

    q.update('value', 'Vai', 'r1');
    expect(listener).toHaveBeenCalledTimes(2);

    q.setQuery({ combinator: 'or', rules: [] });
    expect(listener).toHaveBeenCalledTimes(3);
  });

  it('does not notify for no-op mutations', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    q.subscribe(listener);

    q.remove('nonexistent');
    q.remove([]);
    q.move('nonexistent', 'up');

    expect(listener).not.toHaveBeenCalled();
  });

  it('stops notifying after unsubscribe', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    const unsubscribe = q.subscribe(listener);

    q.add(rule());
    unsubscribe();
    q.add(rule('lastName'));

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('supports multiple listeners', () => {
    const l1 = vi.fn();
    const l2 = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(l1);
    q.subscribe(l2);

    q.add(rule());

    expect(l1).toHaveBeenCalledTimes(1);
    expect(l2).toHaveBeenCalledTimes(1);
  });

  it('is bound to the instance', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    const { subscribe } = q;
    subscribe(listener);

    q.add(rule());

    expect(listener).toHaveBeenCalledTimes(1);
  });

  describe('change payload', () => {
    it('reports query-only changes for mutations', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields });
      q.subscribe(listener);

      q.add({ ...rule(), id: 'r1' });
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });

      q.update('value', 'Vai', 'r1');
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });

      q.setQuery({ combinator: 'or', rules: [] });
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });
    });

    it('reports config-only changes for reconfigure', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields });
      q.subscribe(listener);

      q.reconfigure({ listsAsArrays: true });

      expect(listener).toHaveBeenLastCalledWith({ query: false, config: true });
    });

    it('reports query-only changes for batch, undo, and redo', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields, history: true });
      q.subscribe(listener);

      q.batch(() => {
        q.add(rule());
        q.add(rule('lastName'));
      });
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });

      q.undo();
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });

      q.redo();
      expect(listener).toHaveBeenLastCalledWith({ query: true, config: false });
    });

    it('hands out a frozen payload', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields });
      q.subscribe(listener);

      q.add(rule());

      expect(Object.isFrozen(listener.mock.calls[0][0])).toBe(true);
    });

    it('accepts zero-argument listeners', () => {
      const q = new QueryManager(undefined, { fields });
      let calls = 0;
      q.subscribe(() => {
        calls++;
      });

      q.add(rule());

      expect(calls).toBe(1);
    });
  });
});

describe('history', () => {
  const withHistory = (history: boolean | QueryHistoryOptions = true) =>
    new QueryManager(undefined, { fields, history });

  it('records nothing when disabled', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.canUndo()).toBe(false);
    expect(q.getHistory()).toEqual({ past: [], future: [] });
  });

  it('undoes and redoes a change', () => {
    const q = withHistory();
    const empty = q.getQuery();
    q.add(rule());
    const added = q.getQuery();

    expect(q.canUndo()).toBe(true);
    q.undo();
    expect(q.getQuery()).toBe(empty);
    expect(q.canRedo()).toBe(true);

    q.redo();
    expect(q.getQuery()).toBe(added);
  });

  it('is a no-op when there is nothing to undo or redo', () => {
    const q = withHistory();
    const before = q.getQuery();

    expect(q.undo()).toBe(q);
    expect(q.redo()).toBe(q);
    expect(q.getQuery()).toBe(before);
  });

  it('notifies subscribers on undo and redo', () => {
    const listener = vi.fn();
    const q = withHistory();
    q.add(rule());
    q.subscribe(listener);

    q.undo();
    q.redo();

    expect(listener).toHaveBeenCalledTimes(2);
  });

  it('coalesces consecutive edits to the same property', () => {
    const q = withHistory({ coalesceMs: 10_000 });
    q.add({ ...rule(), id: 'r1' });
    const afterAdd = q.getQuery();

    q.update('value', 'V', 'r1');
    q.update('value', 'Va', 'r1');
    q.update('value', 'Vai', 'r1');

    // All three edits collapsed into one entry, so a single undo restores the pre-typing query.
    expect(q.getHistory().past).toHaveLength(2);
    q.undo();
    expect(q.getQuery()).toBe(afterAdd);
  });

  it('does not coalesce when coalesceMs is 0', () => {
    const q = withHistory({ coalesceMs: 0 });
    q.add({ ...rule(), id: 'r1' });

    q.update('value', 'V', 'r1');
    q.update('value', 'Va', 'r1');

    expect(q.getHistory().past).toHaveLength(3);
  });

  it('never coalesces structural changes', () => {
    const q = withHistory({ coalesceMs: 10_000 });
    q.add(rule());
    q.add(rule('lastName'));
    q.add(rule('age'));

    expect(q.getHistory().past).toHaveLength(3);
  });

  it('does not coalesce edits to different properties', () => {
    const q = withHistory({ coalesceMs: 10_000 });
    q.add({ ...rule(), id: 'r1' });
    q.update('value', 'Vai', 'r1');
    q.update('operator', 'contains', 'r1');

    expect(q.getHistory().past).toHaveLength(3);
  });

  it('records no entry when nothing observable changes', () => {
    const q = withHistory();
    q.add({ ...rule(), id: 'r1' });
    const past = q.getHistory().past.length;

    // A structurally identical replacement: the references change but no property does.
    const current = q.getQuery() as RuleGroupType;
    q.setQuery({ ...current, rules: [...current.rules] });

    expect(q.getHistory().past).toHaveLength(past);
  });

  it('discards the oldest entries beyond maxHistory', () => {
    const q = withHistory({ maxHistory: 2, coalesceMs: 0 });
    q.add(rule('firstName'));
    q.add(rule('lastName'));
    q.add(rule('age'));

    expect(q.getHistory().past).toHaveLength(2);
  });

  it('clears the redo stack on a new change', () => {
    const q = withHistory({ coalesceMs: 0 });
    q.add(rule());
    q.undo();
    expect(q.canRedo()).toBe(true);

    q.add(rule('lastName'));
    expect(q.canRedo()).toBe(false);
  });

  it('does not coalesce a change into a restored entry', () => {
    const q = withHistory({ coalesceMs: 10_000 });
    q.add({ ...rule(), id: 'r1' });
    q.update('value', 'V', 'r1');
    q.undo();

    q.update('value', 'Va', 'r1');

    expect(q.canUndo()).toBe(true);
    expect(q.getHistory().past).toHaveLength(2);
  });

  it('clears history without changing the query', () => {
    const q = withHistory();
    q.add(rule());
    const query = q.getQuery();

    expect(q.clearHistory()).toBe(q);
    expect(q.canUndo()).toBe(false);
    expect(q.canRedo()).toBe(false);
    expect(q.getQuery()).toBe(query);
  });

  it('returns copies from getHistory', () => {
    const q = withHistory();
    q.add(rule());
    const history = q.getHistory();
    history.past.push(q.getQuery());

    expect(q.getHistory().past).toHaveLength(1);
  });
});

describe('batch', () => {
  it('notifies once for multiple changes', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(listener);

    q.batch(() => {
      q.add(rule());
      q.add(rule('lastName'));
      q.add(rule('age'));
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(q.getQuery().rules).toHaveLength(3);
  });

  it('records a single history entry', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    const before = q.getQuery();

    q.batch(() => {
      q.add(rule());
      q.add(rule('lastName'));
    });

    expect(q.getHistory().past).toHaveLength(1);
    q.undo();
    expect(q.getQuery()).toBe(before);
  });

  it('does nothing when the query is unchanged', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields, history: true });
    q.subscribe(listener);

    q.batch(() => {
      q.remove('nonexistent');
    });

    expect(listener).not.toHaveBeenCalled();
    expect(q.canUndo()).toBe(false);
  });

  it('commits only at the outermost level when nested', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(listener);

    q.batch(() => {
      q.add(rule());
      q.batch(() => {
        q.add(rule('lastName'));
      });
      expect(listener).not.toHaveBeenCalled();
    });

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('rolls back and rethrows when the batched function throws', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields, history: true });
    const before = q.getQuery();
    q.subscribe(listener);

    expect(() =>
      q.batch(() => {
        q.add(rule());
        throw new Error('boom');
      })
    ).toThrow('boom');

    expect(q.getQuery()).toBe(before);
    expect(listener).not.toHaveBeenCalled();
    expect(q.canUndo()).toBe(false);
  });

  it('restores history when the batched function undoes and then throws', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    q.add(rule());
    const afterAdd = q.getQuery();
    const history = q.getHistory();

    expect(() =>
      q.batch(() => {
        q.undo();
        throw new Error('boom');
      })
    ).toThrow('boom');

    expect(q.getQuery()).toBe(afterAdd);
    expect(q.getHistory()).toEqual(history);
    expect(q.canRedo()).toBe(false);
  });

  it('only the outermost batch rolls back', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    const before = q.getQuery();

    expect(() =>
      q.batch(() => {
        q.add(rule());
        q.batch(() => {
          q.add(rule('lastName'));
          throw new Error('boom');
        });
      })
    ).toThrow('boom');

    expect(q.getQuery()).toBe(before);
  });

  it('returns the instance', () => {
    const q = new QueryManager(undefined, { fields });
    expect(q.batch(() => q.add(rule()))).toBe(q);
  });

  describe('history interaction', () => {
    /** Two recorded changes, so there is something to undo and then redo. */
    const twoEdits = () => {
      const q = new QueryManager(undefined, { fields, history: true });
      q.add(rule('firstName'));
      q.add(rule('lastName'));
      return q;
    };

    /** History reduced to rule counts, so managers with different `id`s can be compared. */
    const shape = (q: {
      getHistory: () => { past: RuleGroupTypeAny[]; future: RuleGroupTypeAny[] };
    }) => {
      const { past, future } = q.getHistory();
      return { past: past.map(p => p.rules.length), future: future.map(f => f.rules.length) };
    };

    it('batched undo leaves the same history as an unbatched undo', () => {
      const plain = twoEdits();
      plain.undo();

      const batched = twoEdits();
      batched.batch(() => batched.undo());

      expect(shape(batched)).toEqual(shape(plain));
      // The batch must not consume the redo stack that `undo` just populated.
      expect(batched.canRedo()).toBe(true);
      expect(batched.getQuery().rules).toHaveLength(1);
    });

    it('batched redo leaves the same history as an unbatched redo', () => {
      const plain = twoEdits();
      plain.undo();
      plain.redo();

      const batched = twoEdits();
      batched.undo();
      batched.batch(() => batched.redo());

      expect(shape(batched)).toEqual(shape(plain));
      expect(batched.canRedo()).toBe(false);
      expect(batched.getQuery().rules).toHaveLength(2);
    });

    it('a batched undo remains redoable', () => {
      const q = twoEdits();
      q.batch(() => q.undo());
      q.redo();
      expect(q.getQuery().rules).toHaveLength(2);
      expect(q.canRedo()).toBe(false);
    });

    it('batched clearHistory leaves the history empty', () => {
      const q = new QueryManager(undefined, { fields, history: true });
      q.add(rule('firstName'));

      q.batch(() => {
        q.add(rule('lastName'));
        q.clearHistory();
      });

      expect(shape(q)).toEqual({ past: [], future: [] });
      expect(q.canUndo()).toBe(false);
    });

    it('records no entry of its own when a batch also navigates history', () => {
      const q = twoEdits();
      const historyBefore = shape(q);

      q.batch(() => {
        q.add(rule('age'));
        q.undo();
      });

      // The batch defers to `undo`'s bookkeeping rather than adding a second entry.
      expect(shape(q)).toEqual({ past: historyBefore.past.slice(0, -1), future: [3] });
    });

    it('does not leak the bypass flag into a later batch', () => {
      const q = twoEdits();
      q.batch(() => q.undo());

      q.batch(() => q.add(rule('age')));

      // This batch contains no history navigation, so it records normally.
      expect(q.canUndo()).toBe(true);
      expect(shape(q).past.at(-1)).toBe(1);
    });

    it('does not leak the bypass flag out of a rolled-back batch', () => {
      const q = twoEdits();
      const before = shape(q);

      expect(() =>
        q.batch(() => {
          q.undo();
          throw new Error('boom');
        })
      ).toThrow('boom');
      expect(shape(q)).toEqual(before);

      q.batch(() => q.add(rule('age')));
      expect(shape(q).past).toHaveLength(before.past.length + 1);
    });
  });
});

describe('strict mode', () => {
  const strictQM = () => new QueryManager(undefined, { fields, strict: true });

  /** Runs `fn` and returns the `code` of the {@link QueryManagerError} it throws, if any. */
  const codeOf = (fn: () => void): string | undefined => {
    try {
      fn();
      return undefined;
    } catch (error) {
      return (error as QueryManagerError).code;
    }
  };

  it('throws a QueryManagerError with a code', () => {
    const q = strictQM();
    let error: unknown;
    try {
      q.remove('nonexistent');
    } catch (error_) {
      error = error_;
    }

    expect(error).toBeInstanceOf(QueryManagerError);
    expect((error as QueryManagerError).code).toBe('target-not-found');
    expect((error as QueryManagerError).info).toMatchObject({
      operation: 'remove',
      reason: 'target-not-found',
      pathOrID: 'nonexistent',
    });
    expect((error as QueryManagerError).message).toContain('remove');
  });

  it('throws for an unresolvable path just as it does for an unresolvable id', () => {
    // These used to disagree: an unresolvable `id` threw, an unresolvable path did not.
    const q = strictQM();
    expect(codeOf(() => q.remove('nonexistent'))).toBe('target-not-found');
    expect(codeOf(() => q.remove([9, 9, 9]))).toBe('target-not-found');
    expect(codeOf(() => q.remove([99]))).toBe('target-not-found');
  });

  it('omits the target from the message when there is none', () => {
    const error = new QueryManagerError({ reason: 'root-not-allowed', operation: 'remove' });
    expect(error.message).not.toContain('for target');
    expect(error.name).toBe('QueryManagerError');
  });

  it.each([
    [
      'add to a missing parent',
      (q: ReturnType<typeof strictQM>) => q.add(rule(), 'nope'),
      'parent-not-found',
    ],
    ['add to a rule', (q: ReturnType<typeof strictQM>) => q.add(rule(), [0]), 'parent-not-a-group'],
    [
      'remove an unknown id',
      (q: ReturnType<typeof strictQM>) => q.remove('nope'),
      'target-not-found',
    ],
    ['remove the root group', (q: ReturnType<typeof strictQM>) => q.remove([]), 'root-not-allowed'],
    [
      'update an unknown id',
      (q: ReturnType<typeof strictQM>) => q.update('value', 'x', 'nope'),
      'target-not-found',
    ],
    [
      'move an unknown id',
      (q: ReturnType<typeof strictQM>) => q.move('nope', 'up'),
      'target-not-found',
    ],
    [
      'move the root group',
      (q: ReturnType<typeof strictQM>) => q.move([], [0]),
      'root-not-allowed',
    ],
    [
      'insert into a missing parent',
      (q: ReturnType<typeof strictQM>) => q.insert(rule(), [9, 9]),
      'parent-not-found',
    ],
    [
      'group an unknown id',
      (q: ReturnType<typeof strictQM>) => q.group('nope', [0]),
      'target-not-found',
    ],
  ])('throws when attempting to %s', (_label, act, code) => {
    const q = strictQM();
    q.add({ ...rule(), id: 'r1' });

    expect(() => act(q)).toThrow(QueryManagerError);
    expect(codeOf(() => act(q))).toBe(code);
  });

  it('throws for a combinator update at a rule index', () => {
    const q = new QueryManager<RuleGroupTypeIC>(
      { rules: [rule(), 'and', rule('lastName')] },
      { fields, strict: true }
    );
    expect(() => q.update('combinator', 'or', [0])).toThrow(QueryManagerError);
  });

  it('does not throw for a move to the same location', () => {
    const q = strictQM();
    q.add({ ...rule(), id: 'r1' });
    expect(() => q.move('r1', [0])).not.toThrow();
  });

  it('does not throw when a value is already set', () => {
    const q = strictQM();
    q.add({ ...rule(), id: 'r1' });
    expect(() => q.update('value', 'Steve', 'r1')).not.toThrow();
  });

  it('does not throw when disabled', () => {
    const q = new QueryManager(undefined, { fields });
    expect(() => q.remove('nonexistent')).not.toThrow();
  });

  it('leaves the query unchanged when it throws', () => {
    const q = strictQM();
    q.add(rule());
    const before = q.getQuery();

    expect(() => q.remove('nonexistent')).toThrow();
    expect(q.getQuery()).toBe(before);
  });

  describe('per-call overrides', () => {
    it('enables strict for a single call', () => {
      const q = new QueryManager(undefined, { fields });
      expect(() => q.remove('nope', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.remove('nope')).not.toThrow();
    });

    it('disables strict for a single call', () => {
      const q = strictQM();
      expect(() => q.remove('nope', { strict: false })).not.toThrow();
      expect(() => q.remove('nope')).toThrow(QueryManagerError);
    });

    it('applies to every mutator', () => {
      const q = new QueryManager(undefined, { fields });
      q.add({ ...rule(), id: 'r1' });

      expect(() => q.add(rule(), 'nope', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.update('value', 'x', 'nope', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.move('nope', 'up', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.insert(rule(), [9, 9], { strict: true })).toThrow(QueryManagerError);
      expect(() => q.group('nope', [0], { strict: true })).toThrow(QueryManagerError);
    });

    it('applies to every update overload form', () => {
      const q = new QueryManager(undefined, { fields });
      expect(() => q.update('value', 'x', 'nope', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.update(['value'], ['x'], 'nope', { strict: true })).toThrow(QueryManagerError);
      expect(() => q.update({ value: 'x' }, 'nope', { strict: true })).toThrow(QueryManagerError);
    });
  });

  describe('onInvalidTarget', () => {
    it('is called without throwing', () => {
      const onInvalidTarget = vi.fn();
      const q = new QueryManager(undefined, { fields, onInvalidTarget });

      expect(() => q.remove('nope')).not.toThrow();
      expect(onInvalidTarget).toHaveBeenCalledTimes(1);
      expect(onInvalidTarget.mock.calls[0][0]).toMatchObject({
        reason: 'target-not-found',
        operation: 'remove',
      });
    });

    it('is called for non-error reasons', () => {
      const onInvalidTarget = vi.fn();
      const q = new QueryManager(undefined, { fields, onInvalidTarget, strict: true });
      q.add({ ...rule(), id: 'r1' });

      q.update('value', 'Steve', 'r1');
      q.move('r1', [0]);

      expect(onInvalidTarget.mock.calls.map(([info]) => info.reason)).toEqual([
        'no-change',
        'same-location',
      ]);
    });

    it('runs before a strict throw', () => {
      const onInvalidTarget = vi.fn();
      const q = new QueryManager(undefined, { fields, onInvalidTarget, strict: true });

      expect(() => q.remove('nope')).toThrow(QueryManagerError);
      expect(onInvalidTarget).toHaveBeenCalledTimes(1);
    });

    it('can be overridden per call', () => {
      const fromOptions = vi.fn();
      const perCall = vi.fn();
      const q = new QueryManager(undefined, { fields, onInvalidTarget: fromOptions });

      q.remove('nope', { onInvalidTarget: perCall });

      expect(perCall).toHaveBeenCalledTimes(1);
      expect(fromOptions).not.toHaveBeenCalled();
    });
  });

  it('defers redo notification inside a batch', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields, history: true });
    q.add(rule());
    q.undo();
    q.subscribe(listener);

    q.batch(() => {
      q.redo();
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(q.getQuery().rules).toHaveLength(1);
  });

  it('rolls back a batch when a strict throw occurs mid-batch', () => {
    const q = new QueryManager(undefined, { fields, strict: true, history: true });
    const before = q.getQuery();

    expect(() =>
      q.batch(() => {
        q.add(rule());
        q.remove('nonexistent');
      })
    ).toThrow(QueryManagerError);

    expect(q.getQuery()).toBe(before);
    expect(q.canUndo()).toBe(false);
  });
});

describe('walk', () => {
  const nested: RuleGroupType = {
    combinator: 'and',
    rules: [
      { ...rule('firstName'), id: 'r1' },
      { id: 'g1', combinator: 'or', rules: [{ ...rule('lastName'), id: 'r2' }] },
      { ...rule('age', '30'), id: 'r3' },
    ],
    id: 'root',
  };

  it('yields every node depth-first in pre-order, starting with the root', () => {
    const q = new QueryManager(nested);
    expect([...q.walk()].map(e => e.path)).toEqual([[], [0], [1], [1, 0], [2]]);
  });

  it('reports the containing group as parent, and null for the root', () => {
    const q = new QueryManager(nested);
    const entries = [...q.walk()];
    expect(entries[0].parent).toBeNull();
    expect(entries[1].parent).toBe(q.getQuery());
    expect(entries[3].parent).toBe(q.getGroup('g1'));
  });

  it('filters with rulesOnly and groupsOnly', () => {
    const q = new QueryManager(nested);
    expect([...q.walk({ rulesOnly: true })].map(e => e.path)).toEqual([[0], [1, 0], [2]]);
    expect([...q.walk({ groupsOnly: true })].map(e => e.path)).toEqual([[], [1]]);
  });

  it('traverses a subtree with `from`, by path or id', () => {
    const q = new QueryManager(nested);
    expect([...q.walk({ from: [1] })].map(e => e.path)).toEqual([[1], [1, 0]]);
    expect([...q.walk({ from: 'g1' })].map(e => e.path)).toEqual([[1], [1, 0]]);
  });

  it('reports the correct parent when starting from a subtree', () => {
    const q = new QueryManager(nested);
    expect([...q.walk({ from: [1] })][0].parent).toBe(q.getQuery());
    expect([...q.walk({ from: [] })][0].parent).toBeNull();
  });

  it('yields nothing when `from` cannot be resolved', () => {
    const q = new QueryManager(nested);
    expect([...q.walk({ from: [9] })]).toEqual([]);
    expect([...q.walk({ from: 'nope' })]).toEqual([]);
  });

  it('skips combinator strings in independent-combinator groups', () => {
    const icQuery: RuleGroupTypeIC = { rules: [rule('firstName'), 'and', rule('lastName')] };
    const q = new QueryManager<RuleGroupTypeIC>(icQuery);
    expect([...q.walk()].map(e => e.path)).toEqual([[], [0], [2]]);
  });

  it('is iterable', () => {
    const q = new QueryManager(nested);
    expect([...q].map(e => e.path)).toEqual([[], [0], [1], [1, 0], [2]]);
  });

  it('provides rules() and groups() shorthands', () => {
    const q = new QueryManager(nested);
    expect([...q.rules()].map(e => e.path)).toEqual([[0], [1, 0], [2]]);
    expect([...q.groups()].map(e => e.path)).toEqual([[], [1]]);
    expect([...q.rules({ from: [1] })].map(e => e.path)).toEqual([[1, 0]]);
    expect([...q.groups({ from: [1] })].map(e => e.path)).toEqual([[1]]);
  });

  it('finds and filters', () => {
    const q = new QueryManager(nested);
    expect(q.find(e => 'field' in e.node && e.node.field === 'age')?.path).toEqual([2]);
    expect(q.find(() => false)).toBeNull();
    expect(q.filter(e => 'field' in e.node).map(e => e.path)).toEqual([[0], [1, 0], [2]]);
    expect(q.filter(() => false)).toEqual([]);
    expect(q.filter(e => 'field' in e.node, { from: [1] }).map(e => e.path)).toEqual([[1, 0]]);
    expect(q.find(e => 'field' in e.node, { from: [1] })?.path).toEqual([1, 0]);
  });
});

describe('path utilities', () => {
  const nested: RuleGroupType = {
    combinator: 'and',
    rules: [
      { ...rule('firstName'), id: 'r1' },
      { id: 'g1', combinator: 'or', rules: [{ ...rule('lastName'), id: 'r2' }] },
    ],
    id: 'root',
  };

  it('findPath', () => {
    const q = new QueryManager(nested);
    expect(q.findPath([])).toBe(q.getQuery());
    expect(q.findPath([1, 0])).toMatchObject({ field: 'lastName' });
    expect(q.findPath([9])).toBeNull();
  });

  it('findID', () => {
    const q = new QueryManager(nested);
    expect(q.findID('root')).toBe(q.getQuery());
    expect(q.findID('r2')).toMatchObject({ field: 'lastName' });
    expect(q.findID('nope')).toBeNull();
  });

  it('getPathOfID', () => {
    const q = new QueryManager(nested);
    expect(q.getPathOfID('root')).toEqual([]);
    expect(q.getPathOfID('r1')).toEqual([0]);
    expect(q.getPathOfID('r2')).toEqual([1, 0]);
    expect(q.getPathOfID('nope')).toBeNull();
  });

  it('ignores duplicate ids after the first, like findID', () => {
    const q = new QueryManager({
      combinator: 'and',
      rules: [
        { ...rule('firstName'), id: 'dupe' },
        { ...rule('lastName'), id: 'dupe' },
      ],
      id: 'root',
    } satisfies RuleGroupType);
    expect(q.getPathOfID('dupe')).toEqual([0]);
  });

  it('pathIsDisabled', () => {
    const q = new QueryManager({
      combinator: 'and',
      rules: [rule('firstName'), { combinator: 'or', disabled: true, rules: [rule('lastName')] }],
    } satisfies RuleGroupType);
    expect(q.pathIsDisabled([0])).toBe(false);
    expect(q.pathIsDisabled([1, 0])).toBe(true);
  });

  it('getNode by path and id', () => {
    const q = new QueryManager(nested);
    expect(q.getNode([1, 0])).toMatchObject({ field: 'lastName' });
    expect(q.getNode('g1')).toMatchObject({ combinator: 'or' });
    expect(q.getNode('nope')).toBeNull();
    expect(q.getNode([9])).toBeNull();
  });

  it('getRule returns null for groups', () => {
    const q = new QueryManager(nested);
    expect(q.getRule('r1')).toMatchObject({ field: 'firstName' });
    expect(q.getRule('g1')).toBeNull();
    expect(q.getRule('nope')).toBeNull();
  });

  it('getGroup returns null for rules', () => {
    const q = new QueryManager(nested);
    expect(q.getGroup('g1')).toMatchObject({ combinator: 'or' });
    expect(q.getGroup([])).toBe(q.getQuery());
    expect(q.getGroup('r1')).toBeNull();
    expect(q.getGroup('nope')).toBeNull();
  });

  it('getParent', () => {
    const q = new QueryManager(nested);
    expect(q.getParent('r2')).toBe(q.getGroup('g1'));
    expect(q.getParent('g1')).toBe(q.getQuery());
    expect(q.getParent('root')).toBeNull();
    expect(q.getParent([])).toBeNull();
    expect(q.getParent('nope')).toBeNull();
    expect(q.getParent([9])).toBeNull();
  });
});

describe('query inspection', () => {
  it('isIC', () => {
    expect(new QueryManager().isIC()).toBe(false);
    expect(new QueryManager<RuleGroupTypeIC>({ rules: [] }).isIC()).toBe(true);
  });

  it('signatureOf', () => {
    const q = new QueryManager({ combinator: 'and', rules: [rule()] } satisfies RuleGroupType);
    expect(q.signatureOf(q.getQuery())).toBe('');
    expect(typeof q.signatureOf({ combinator: 'and', rules: [] })).toBe('string');
  });

  it('diagnostics', () => {
    const q = new QueryManager({ combinator: 'and', rules: [rule()] } satisfies RuleGroupType);
    expect(q.diagnostics()).toEqual(formatQuery(q.getQuery(), 'diagnostics'));
  });

  it('toJSON round-trips through JSON.stringify', () => {
    const q = new QueryManager({ combinator: 'and', rules: [rule()] } satisfies RuleGroupType);
    expect(q.toJSON()).toBe(q.getQuery());
    expect(JSON.stringify(q)).toBe(JSON.stringify(q.getQuery()));
  });
});

describe('transforms', () => {
  it('toIC converts and returns a new manager', () => {
    const q = new QueryManager({
      combinator: 'and',
      rules: [rule('firstName'), rule('lastName')],
    } satisfies RuleGroupType);
    const before = q.getQuery();
    const ic = q.toIC();
    expect(ic).not.toBe(q);
    expect(ic.isIC()).toBe(true);
    expect(ic.getQuery().rules[1]).toBe('and');
    // Original is untouched.
    expect(q.getQuery()).toBe(before);
    // Idempotent.
    expect(ic.toIC().getQuery().rules[1]).toBe('and');
  });

  it('fromIC converts and returns a new manager', () => {
    const q = new QueryManager<RuleGroupTypeIC>({
      rules: [rule('firstName'), 'or', rule('lastName')],
    });
    const nonIC = q.fromIC();
    expect(nonIC).not.toBe(q);
    expect(nonIC.isIC()).toBe(false);
    expect(nonIC.getQuery().combinator).toBe('or');
    expect(nonIC.fromIC().getQuery().combinator).toBe('or');
  });

  it('carries configuration but not history or subscribers', () => {
    const onChange = vi.fn();
    const q = new QueryManager({ combinator: 'and', rules: [] }, { fields, history: true });
    q.subscribe(onChange);
    q.add(rule());
    const ic = q.toIC();
    expect(ic.canUndo()).toBe(false);
    ic.add(rule());
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(ic.createRule().field).toBe('firstName');
  });

  it('transform returns the raw transformQuery result', () => {
    const q = new QueryManager({ combinator: 'and', rules: [rule()] } satisfies RuleGroupType);
    const before = q.getQuery();
    expect(q.transform({ propertyMap: { combinator: 'AndOr' } })).toMatchObject({ AndOr: 'and' });
    expect(q.transform()).toMatchObject({ combinator: 'and' });
    expect(q.getQuery()).toBe(before);
  });
});

describe('cache invalidation', () => {
  const initial: RuleGroupType = {
    combinator: 'and',
    rules: [{ ...rule('firstName'), id: 'r1' }],
    id: 'root',
  };

  it('reindexes after a mutation', () => {
    const q = new QueryManager(initial);
    expect(q.getPathOfID('r1')).toEqual([0]);
    // `insert` assigns a fresh `id`, so identify the new rule by position.
    q.insert(rule('lastName'), [0]);
    expect(q.getPathOfID('r1')).toEqual([1]);
    const insertedID = q.getQuery().rules[0].id!;
    expect(q.getPathOfID(insertedID)).toEqual([0]);
    q.remove(insertedID);
    expect(q.getPathOfID(insertedID)).toBeNull();
    expect(q.getPathOfID('r1')).toEqual([0]);
  });

  it('reindexes after setQuery', () => {
    const q = new QueryManager(initial);
    expect(q.findID('r1')).toMatchObject({ field: 'firstName' });
    q.setQuery({ combinator: 'and', rules: [{ ...rule('age', '30'), id: 'r9' }], id: 'root2' });
    expect(q.getPathOfID('r1')).toBeNull();
    expect(q.getPathOfID('r9')).toEqual([0]);
  });

  it('reindexes after undo and redo, which bypass #commit', () => {
    const q = new QueryManager(initial, { history: true });
    expect(q.getPathOfID('r1')).toEqual([0]);
    q.add(rule('lastName'));
    const addedID = q.getQuery().rules[1].id!;
    expect(q.getPathOfID(addedID)).toEqual([1]);

    q.undo();
    expect(q.getPathOfID(addedID)).toBeNull();
    expect([...q.walk()].map(e => e.path)).toEqual([[], [0]]);

    q.redo();
    expect(q.getPathOfID(addedID)).toEqual([1]);
    expect([...q.walk()].map(e => e.path)).toEqual([[], [0], [1]]);
  });

  it('reindexes after a batch rollback, which bypasses #commit', () => {
    const q = new QueryManager(initial, { history: true });
    expect(q.getPathOfID('r1')).toEqual([0]);
    let addedID: string | undefined;
    expect(() =>
      q.batch(() => {
        q.add(rule('lastName'));
        expect(q.getQuery().rules).toHaveLength(2);
        addedID = q.getQuery().rules[1].id!;
        throw new Error('nope');
      })
    ).toThrow('nope');
    expect(q.getPathOfID(addedID!)).toBeNull();
    expect(q.getQuery().rules).toHaveLength(1);
    expect(q.getPathOfID('r1')).toEqual([0]);
  });

  it('caches validation until the query changes', () => {
    const validator = vi.fn(() => true);
    const q = new QueryManager(initial, { validator });
    expect(q.validate()).toBe(true);
    expect(q.validate()).toBe(true);
    expect(validator).toHaveBeenCalledTimes(1);

    q.add(rule('lastName'));
    expect(q.validate()).toBe(true);
    expect(validator).toHaveBeenCalledTimes(2);
  });

  it('caches a falsy validation result', () => {
    const validator = vi.fn(() => false);
    const q = new QueryManager(initial, { validator });
    expect(q.validate()).toBe(false);
    expect(q.validate()).toBe(false);
    expect(validator).toHaveBeenCalledTimes(1);
  });

  it('does not invalidate when a mutation is a no-op', () => {
    const validator = vi.fn(() => true);
    const q = new QueryManager(initial, { validator });
    q.validate();
    q.remove([9]);
    q.validate();
    expect(validator).toHaveBeenCalledTimes(1);
  });
});

describe('rule configuration', () => {
  const q = () =>
    new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] }, { fields });

  it('exposes field data', () => {
    expect(q().getFieldData('firstName')).toMatchObject({ name: 'firstName' });
  });

  it('returns a minimal fallback for an unknown field', () => {
    expect(q().getFieldData('nope')).toEqual({ name: 'nope', value: 'nope', label: 'nope' });
  });

  it('agrees with the fieldData reported by getRuleContext', () => {
    const m = new QueryManager<RuleGroupType>(
      { combinator: 'and', rules: [rule('nope')] },
      { fields }
    );
    expect(m.getFieldData('nope')).toEqual(m.getRuleContext([0])!.fieldData);
  });

  it('hands out frozen field data', () => {
    // `prepareOptionList` builds the map's values as separate objects from the list's, so both
    // have to be frozen for `getFieldData` to be safe.
    const fd = q().getFieldData('firstName');
    expect(Object.isFrozen(fd)).toBe(true);
    expect(() => {
      (fd as { label: string }).label = 'mutated';
    }).toThrow();
  });

  it('hands out frozen option lists', () => {
    const m = q();
    expect(Object.isFrozen(m.getFields())).toBe(true);
    expect(Object.isFrozen(m.getCombinators())).toBe(true);
    // Mutating the returned list must not affect the manager.
    expect(() =>
      (m.getFields() as FullField[]).push({ name: 'x', value: 'x', label: 'x' })
    ).toThrow();
    expect(m.getFields()).toHaveLength(3);
  });

  it('exposes operators, value sources, match modes, values, and value editor type', () => {
    const m = q();
    expect(m.getOperators('firstName').length).toBeGreaterThan(0);
    expect(m.getValueSources('firstName', '=').map(vs => vs.value)).toEqual(['value']);
    expect(m.getMatchModes('firstName')).toEqual([]);
    expect(m.getValues('firstName', '=')).toEqual([]);
    expect(m.getValueEditorType('firstName', '=')).toBe('text');
  });

  describe('default resolvers', () => {
    it('reports the same default operator createRule assigns', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [] },
        { fields, getDefaultOperator: 'beginsWith' }
      );
      expect(m.getRuleDefaultOperator('firstName')).toBe('beginsWith');
      expect(m.getRuleDefaultOperator('firstName')).toBe(m.createRule().operator);
    });

    it('accepts a function for the default operator', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [] },
        { fields, getDefaultOperator: (f: string) => (f === 'firstName' ? 'contains' : '=') }
      );
      expect(m.getRuleDefaultOperator('firstName')).toBe('contains');
      expect(m.getRuleDefaultOperator('lastName')).toBe('=');
    });

    it('reports the same default value createRule assigns', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [] },
        { fields, getDefaultValue: () => 'dv' }
      );
      const created = m.createRule();
      expect(m.getRuleDefaultValue(created)).toBe('dv');
      expect(created.value).toBe('dv');
    });

    it('reports the same default value an update assigns after a field change', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule('firstName')] },
        { fields, getDefaultValue: (r: RuleType) => `dv-${r.field}` }
      );
      const expected = m.getRuleDefaultValue({
        ...(m.getQuery().rules[0] as RuleType),
        field: 'age',
      });
      m.update('field', 'age', [0]);
      expect((m.getQuery().rules[0] as RuleType).value).toBe(expected);
    });
  });

  describe('getFieldMap', () => {
    it('is keyed by field name and agrees with getFieldData', () => {
      const m = q();
      expect(Object.keys(m.getFieldMap()).toSorted()).toEqual(fields.map(f => f.name).toSorted());
      expect(m.getFieldMap().firstName).toEqual(m.getFieldData('firstName'));
    });

    it('flattens option groups', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [] },
        { fields: [{ label: 'Names', options: [{ name: 'firstName', label: 'First' }] }] }
      );
      expect(Object.keys(m.getFieldMap())).toEqual(['firstName']);
    });

    it('returns the same reference on every call', () => {
      const m = q();
      expect(m.getFieldMap()).toBe(m.getFieldMap());
    });
  });

  describe('getRuleContext', () => {
    it('resolves context by path', () => {
      const ctx = q().getRuleContext([0]);
      expect(ctx?.fieldData).toMatchObject({ name: 'firstName' });
      expect(ctx?.operatorObject?.value).toBe('=');
      expect(ctx?.valueEditorType).toBe('text');
      expect(ctx?.valueSources).toEqual(['value']);
      expect(ctx?.hideValueControls).toBe(false);
    });

    it('resolves context by id', () => {
      const m = q();
      const id = (m.getQuery().rules[0] as RuleType).id!;
      expect(m.getRuleContext(id)?.fieldData).toMatchObject({ name: 'firstName' });
    });

    it("uses the field's inputType", () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule('age', 30 as never)] },
        { fields }
      );
      expect(m.getRuleContext([0])?.inputType).toBe('number');
    });

    it('returns null for a nonexistent target', () => {
      expect(q().getRuleContext([99])).toBeNull();
    });

    it('returns null when the target is a group', () => {
      expect(q().getRuleContext([])).toBeNull();
    });

    it('includes the validation result', () => {
      const seed = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] });
      const id = (seed.getQuery().rules[0] as RuleType).id!;
      const m = new QueryManager<RuleGroupType>(seed.getQuery(), {
        fields,
        validator: () => ({ [id]: { valid: false, reasons: ['nope'] } }),
      });
      expect(m.getRuleContext([0])?.validationResult).toEqual({ valid: false, reasons: ['nope'] });
    });

    it('tolerates a boolean validation result', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule()] },
        { fields, validator: () => true }
      );
      expect(m.getRuleContext([0])?.validationResult).toBeNull();
    });

    it('resolves parameters when configured', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [{ ...rule(), valueSource: 'parameter' }] },
        { fields, getParameters: () => [{ name: 'p1', value: 'p1', label: 'p1' }] }
      );
      const ctx = m.getRuleContext([0]);
      expect(ctx?.parameters).toEqual([{ name: 'p1', value: 'p1', label: 'p1' }]);
      expect(ctx?.valueEditorType).toBe('select');
    });

    it('normalizes a shorthand parameter list, like default values do', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [{ ...rule(), valueSource: 'parameter' }] },
        // No `value` property: `prepareOptionList` fills it in from `name`.
        { fields, getParameters: () => [{ name: 'p1', label: 'P1' }] }
      );
      expect(m.getRuleContext([0])?.parameters).toEqual([{ name: 'p1', value: 'p1', label: 'P1' }]);
    });

    it('applies autoSelectValue to parameters', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [{ ...rule(), valueSource: 'parameter' }] },
        {
          fields,
          autoSelectValue: false,
          getParameters: () => [{ name: 'p1', value: 'p1', label: 'p1' }],
        }
      );
      // A placeholder option is prepended when `autoSelectValue` is false.
      const params = m.getRuleContext([0])?.parameters as FullOption[];
      expect(params).toHaveLength(2);
      expect(params[0].value).toBe(defaultPlaceholderName);
    });

    it('reports no parameters when none are configured', () => {
      expect(q().getRuleContext([0])?.parameters).toBeNull();
    });
  });
});

describe('translations', () => {
  const autoSelectOff = {
    autoSelectField: false,
    autoSelectOperator: false,
    autoSelectValue: false,
  } as const;
  const valueFields = [{ name: 'gender', label: 'Gender', values: [{ name: 'M', label: 'Male' }] }];

  it('uses the custom field placeholder', () => {
    const m = new QueryManager(undefined, {
      fields,
      ...autoSelectOff,
      translations: { fields: { placeholderName: '#', placeholderLabel: 'Select a field' } },
    });
    const [placeholder] = m.getFields() as FullField[];
    expect(placeholder.value).toBe('#');
    expect(placeholder.label).toBe('Select a field');
  });

  it('uses the custom field placeholder for optgroups', () => {
    const m = new QueryManager(undefined, {
      fields: [{ label: 'Names', options: fields }],
      ...autoSelectOff,
      translations: {
        fields: { placeholderName: '#', placeholderLabel: 'Select', placeholderGroupLabel: '~~~' },
      },
    });
    const [group] = m.getFields() as unknown as { label: string; options: FullField[] }[];
    expect(group.label).toBe('~~~');
    expect(group.options[0].value).toBe('#');
    expect(group.options[0].label).toBe('Select');
  });

  it('uses the custom operator placeholder', () => {
    const m = new QueryManager(undefined, {
      fields,
      ...autoSelectOff,
      translations: { operators: { placeholderName: '%', placeholderLabel: 'Select an operator' } },
    });
    const [placeholder] = m.getOperators('firstName') as FullOption[];
    expect(placeholder.value).toBe('%');
    expect(placeholder.label).toBe('Select an operator');
  });

  it('uses the custom value placeholder', () => {
    const m = new QueryManager(undefined, {
      fields: valueFields,
      ...autoSelectOff,
      translations: { values: { placeholderName: '$', placeholderLabel: 'Select a value' } },
    });
    const [placeholder] = m.getValues('gender', '=') as FullOption[];
    expect(placeholder.value).toBe('$');
    expect(placeholder.label).toBe('Select a value');
  });

  it('writes custom placeholder names into new rules', () => {
    const m = new QueryManager(undefined, {
      fields,
      ...autoSelectOff,
      translations: { fields: { placeholderName: '#' }, operators: { placeholderName: '%' } },
    });
    expect(m.createRule()).toMatchObject({ field: '#', operator: '%' });
  });

  it('surfaces the custom placeholders through getRuleContext', () => {
    const m = new QueryManager<RuleGroupType>(
      { combinator: 'and', rules: [{ field: 'gender', operator: '=', value: '' }] },
      {
        fields: valueFields,
        ...autoSelectOff,
        translations: { operators: { placeholderName: '%' }, values: { placeholderName: '$' } },
      }
    );
    const ctx = m.getRuleContext([0])!;
    expect((ctx.operators as FullOption[])[0].value).toBe('%');
    expect((ctx.values as FullOption[])[0].value).toBe('$');
  });

  it('falls back to the defaults for omitted translations', () => {
    const m = new QueryManager(undefined, {
      fields: valueFields,
      ...autoSelectOff,
      translations: { fields: { placeholderName: '#' } },
    });
    expect((m.getFields() as FullField[])[0].value).toBe('#');
    expect((m.getOperators('gender') as FullOption[])[0].value).toBe(defaultPlaceholderName);
    expect((m.getValues('gender', '=') as FullOption[])[0].value).toBe(defaultPlaceholderName);
  });

  it('ignores translations when the autoSelect options are enabled', () => {
    const m = new QueryManager(undefined, {
      fields,
      translations: { fields: { placeholderName: '#' } },
    });
    expect((m.getFields() as FullField[])[0].value).toBe('firstName');
  });
});

describe('reconfigure', () => {
  const autoSelectOff = {
    autoSelectField: false,
    autoSelectOperator: false,
    autoSelectValue: false,
  } as const;

  it('propagates new translations to the option lists', () => {
    const q = new QueryManager(undefined, {
      fields,
      ...autoSelectOff,
      translations: { fields: { placeholderLabel: 'Select a field' } },
    });
    expect((q.getFields() as FullField[])[0].label).toBe('Select a field');

    q.reconfigure({ translations: { fields: { placeholderLabel: 'Choisir un champ' } } });

    expect((q.getFields() as FullField[])[0].label).toBe('Choisir un champ');
    expect(q.getFieldData(defaultPlaceholderName).label).toBe('Choisir un champ');
  });

  it('propagates new translations to operators and values', () => {
    const q = new QueryManager(undefined, {
      fields: [{ name: 'gender', label: 'Gender', values: [{ name: 'M', label: 'Male' }] }],
      ...autoSelectOff,
    });

    q.reconfigure({
      translations: {
        operators: { placeholderName: '%', placeholderLabel: 'Op' },
        values: { placeholderName: '$', placeholderLabel: 'Val' },
      },
    });

    expect((q.getOperators('gender') as FullOption[])[0]).toMatchObject({
      value: '%',
      label: 'Op',
    });
    expect((q.getValues('gender', '=') as FullOption[])[0]).toMatchObject({
      value: '$',
      label: 'Val',
    });
    expect(q.createRule()).toMatchObject({ operator: '%' });
  });

  it('shallow-merges over the existing options', () => {
    const q = new QueryManager(undefined, { fields, ...autoSelectOff });
    q.reconfigure({ translations: { fields: { placeholderName: '#' } } });

    // `fields` and the autoSelect options were not passed to `reconfigure` but are preserved.
    expect(q.getFields()).toHaveLength(fields.length + 1);
    expect(q.createRule()).toMatchObject({ field: '#' });
  });

  it('resets an option to its default when passed explicitly as undefined', () => {
    const q = new QueryManager(undefined, { fields, combinators: [{ name: 'xor', label: 'XOR' }] });
    expect(q.getCombinators()).toHaveLength(1);

    q.reconfigure({ combinators: undefined });

    expect(q.getCombinators().length).toBeGreaterThan(1);
  });

  it('discards the previous options when `replace` is true', () => {
    const q = new QueryManager(undefined, { fields, ...autoSelectOff });
    q.reconfigure({ validator: () => true }, { replace: true });

    expect(q.getOptions()).toEqual({ validator: expect.any(Function) });
    // `fields` is gone, so the list holds nothing but the placeholder.
    expect(q.getFields()).toHaveLength(1);
  });

  it('returns the manager for chaining', () => {
    const q = new QueryManager(undefined, { fields });
    expect(q.reconfigure({})).toBe(q);
  });

  it('exposes the merged options as a frozen copy', () => {
    const q = new QueryManager(undefined, { fields });
    q.reconfigure({ listsAsArrays: true });

    const options = q.getOptions();
    expect(options).toMatchObject({ fields, listsAsArrays: true });
    expect(Object.isFrozen(options)).toBe(true);
    // A copy, so mutating it does not affect the manager.
    expect(q.getOptions()).not.toBe(options);
  });

  it('leaves the query untouched', () => {
    const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] }, { fields });
    const before = q.getQuery();

    q.reconfigure({ fields: [{ name: 'other', label: 'Other' }] });

    expect(q.getQuery()).toBe(before);
    expect(q.getQuery().rules[0]).toMatchObject({ field: 'firstName' });
  });

  it('notifies subscribers and bumps the config version', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    expect(q.getConfigVersion()).toBe(0);
    q.subscribe(listener);

    q.reconfigure({ listsAsArrays: true });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({ query: false, config: true });
    expect(q.getConfigVersion()).toBe(1);

    // A merge that changes nothing is a no-op.
    q.reconfigure({});
    expect(listener).toHaveBeenCalledTimes(1);
    expect(q.getConfigVersion()).toBe(1);
  });

  it('defers its notification inside a batch', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(listener);

    q.batch(() => {
      q.reconfigure({ listsAsArrays: true });
      // The options are applied immediately...
      expect(q.getOptions().listsAsArrays).toBe(true);
      expect(q.getConfigVersion()).toBe(1);
      // ...but the notification waits for the batch, so the batch emits exactly one.
      expect(listener).not.toHaveBeenCalled();
      q.add(rule());
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({ query: true, config: true });
  });

  it('notifies once for a batch containing only a reconfigure', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    q.subscribe(listener);

    q.batch(() => {
      q.reconfigure({ listsAsArrays: true });
    });

    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({ query: false, config: true });
  });

  it('notifies about a reconfigure even when the batch rolls back', () => {
    const listener = vi.fn();
    const q = new QueryManager(undefined, { fields });
    const before = q.getQuery();
    q.subscribe(listener);

    expect(() =>
      q.batch(() => {
        q.add(rule());
        q.reconfigure({ listsAsArrays: true });
        throw new Error('nope');
      })
    ).toThrow('nope');

    // The query was rolled back; the configuration was not, so subscribers hear about it.
    expect(q.getQuery()).toBe(before);
    expect(q.getOptions().listsAsArrays).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    expect(listener).toHaveBeenLastCalledWith({ query: false, config: true });
  });

  describe('self-gating', () => {
    // This is the gate that Solid's and Svelte's ports each implemented locally as
    // `valuesEqual`: a caller that rebuilds its options object on every render must not force a
    // reconfigure, or the effect that calls it becomes self-perpetuating.
    it('does not reconfigure when a rebuilt options object is structurally identical', () => {
      const getDefaultValue = () => 'x';
      const buildOptions = () => ({
        fields: [
          { name: 'firstName', label: 'First Name' },
          { name: 'lastName', label: 'Last Name' },
        ],
        translations: { fields: { placeholderLabel: 'Select a field' } },
        history: { maxHistory: 10, coalesceMs: 250 },
        getDefaultValue,
      });
      const listener = vi.fn();
      const q = new QueryManager(undefined, buildOptions());
      q.subscribe(listener);

      q.reconfigure(buildOptions());

      expect(listener).not.toHaveBeenCalled();
      expect(q.getConfigVersion()).toBe(0);
    });

    it('reconfigures when a nested option value changes', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields, history: { maxHistory: 10 } });
      q.subscribe(listener);

      q.reconfigure({ history: { maxHistory: 10 } });
      expect(listener).not.toHaveBeenCalled();

      q.reconfigure({ history: { maxHistory: 3 } });
      expect(listener).toHaveBeenCalledTimes(1);
      expect(q.getConfigVersion()).toBe(1);
    });

    it('honors history options that survive the gate', () => {
      const q = new QueryManager(undefined, { fields, history: { maxHistory: 10 } });
      q.add(rule());
      q.add(rule('lastName'));
      expect(q.getHistory().past).toHaveLength(2);

      // A no-op reconfigure skips `reconcileHistoryConfig`, which is only correct because
      // `history` is part of the comparison. A real one still trims.
      q.reconfigure({ history: { maxHistory: 10 } });
      expect(q.getHistory().past).toHaveLength(2);

      q.reconfigure({ history: { maxHistory: 1 } });
      expect(q.getHistory().past).toHaveLength(1);
    });

    it('reconfigures when a function-valued option is rebuilt', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields, getDefaultValue: () => 'x' });
      q.subscribe(listener);

      q.reconfigure({ getDefaultValue: () => 'x' });

      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('gates on the merged options rather than the argument', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields, listsAsArrays: true });
      q.subscribe(listener);

      // Both describe the configuration already in effect.
      q.reconfigure({});
      q.reconfigure({ listsAsArrays: true });

      expect(listener).not.toHaveBeenCalled();
    });

    it('gates on the replacement result under `replace: true`', () => {
      const listener = vi.fn();
      const options = { fields, listsAsArrays: true };
      const q = new QueryManager(undefined, options);
      q.subscribe(listener);

      // Equal to the current options, so a no-op even though it discards them first.
      q.reconfigure({ ...options }, { replace: true });
      expect(listener).not.toHaveBeenCalled();

      // A merge would have preserved `fields`; a replacement does not, so this is a change.
      q.reconfigure({ listsAsArrays: true }, { replace: true });
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('is a no-op for a reconfigure inside a batch that changes nothing', () => {
      const listener = vi.fn();
      const q = new QueryManager(undefined, { fields });
      q.subscribe(listener);

      q.batch(() => {
        q.reconfigure({});
      });

      expect(listener).not.toHaveBeenCalled();
    });
  });

  it('invalidates the cached validation result', () => {
    const q = new QueryManager(undefined, { fields });
    expect(q.validate()).not.toBe(true);

    q.reconfigure({ validator: () => true });

    expect(q.validate()).toBe(true);
  });

  it('preserves history and trims the undo stack to a lower maxHistory', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    q.add(rule('firstName')).add(rule('lastName')).add(rule('age'));
    expect(q.getHistory().past).toHaveLength(3);

    q.reconfigure({ history: { maxHistory: 1 } });

    const { past } = q.getHistory();
    expect(past).toHaveLength(1);
    // The most recent entry is the one kept.
    expect(past[0].rules).toHaveLength(2);
    expect(q.canUndo()).toBe(true);
  });

  it('leaves a shorter undo stack alone when maxHistory is raised', () => {
    const q = new QueryManager(undefined, { fields, history: { maxHistory: 5 } });
    q.add(rule());

    q.reconfigure({ history: { maxHistory: 50 } });

    expect(q.getHistory().past).toHaveLength(1);
  });

  it('clears history when history is turned off', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    q.add(rule());
    q.undo();
    expect(q.getHistory()).toMatchObject({ past: [], future: [expect.anything()] });

    q.reconfigure({ history: false });

    expect(q.getHistory()).toEqual({ past: [], future: [] });
    expect(q.canUndo()).toBe(false);
    expect(q.canRedo()).toBe(false);
  });

  it('reconciles history after a failed batch turns history off', () => {
    const q = new QueryManager(undefined, { fields, history: true });
    q.add(rule());
    expect(q.canUndo()).toBe(true);

    expect(() =>
      q.batch(() => {
        q.reconfigure({ history: false });
        throw new Error('rollback');
      })
    ).toThrow('rollback');

    expect(q.canUndo()).toBe(false);
    expect(q.canRedo()).toBe(false);
  });

  it('records history for a mutation after history is toggled within a batch', () => {
    const q = new QueryManager(undefined, { fields, history: true });

    q.batch(() => {
      q.reconfigure({ history: false });
      q.reconfigure({ history: true });
      q.add(rule());
    });

    expect(q.canUndo()).toBe(true);
    expect(q.getHistory().past).toHaveLength(1);
  });

  it('starts recording when history is turned on', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.canUndo()).toBe(false);

    q.reconfigure({ history: true });
    q.add(rule('lastName'));

    expect(q.canUndo()).toBe(true);
    expect(q.getHistory().past).toHaveLength(1);
  });

  it('applies new behavior options to subsequent mutations', () => {
    const q = new QueryManager<RuleGroupType>(
      { combinator: 'and', rules: [rule()] },
      { fields, strict: false }
    );

    expect(() => q.remove([9])).not.toThrow();
    q.reconfigure({ strict: true });
    expect(() => q.remove([9])).toThrow(QueryManagerError);
  });

  it('carries the reconfigured options into clones', () => {
    const q = new QueryManager(undefined, { fields, ...autoSelectOff });
    q.reconfigure({ translations: { fields: { placeholderName: '#' } } });

    expect(q.clone().createRule()).toMatchObject({ field: '#' });
  });
});

describe('group configuration', () => {
  const q = () =>
    new QueryManager<RuleGroupType>({ combinator: 'or', rules: [rule()] }, { fields });

  it('exposes the normalized field and combinator lists', () => {
    const m = q();
    expect((m.getFields() as FullField[]).map(f => f.value)).toEqual([
      'firstName',
      'lastName',
      'age',
    ]);
    expect((m.getCombinators() as FullCombinator[]).map(c => c.value)).toEqual(['and', 'or']);
  });

  describe('getRuleGroupContext', () => {
    it('defaults to the root group', () => {
      const ctx = q().getRuleGroupContext()!;
      expect(ctx.combinator).toBe('or');
      expect(ctx.independentCombinators).toBe(false);
      expect((ctx.combinators as FullCombinator[]).map(c => c.value)).toEqual(['and', 'or']);
    });

    it('resolves a nested group by path and id', () => {
      const m = new QueryManager<RuleGroupType>({
        combinator: 'and',
        rules: [{ combinator: 'or', rules: [] }],
      });
      expect(m.getRuleGroupContext([0])?.combinator).toBe('or');
      const id = (m.getQuery().rules[0] as RuleGroupType).id!;
      expect(m.getRuleGroupContext(id)?.combinator).toBe('or');
    });

    it('reports independent combinators', () => {
      const m = new QueryManager<RuleGroupTypeIC>({ rules: [] });
      const ctx = m.getRuleGroupContext();
      expect(ctx?.independentCombinators).toBe(true);
      expect(ctx?.combinatorBasedClassName).toBeNull();
    });

    it('returns null for a nonexistent target', () => {
      expect(q().getRuleGroupContext([99])).toBeNull();
    });

    it('returns null when the target is a rule', () => {
      expect(q().getRuleGroupContext([0])).toBeNull();
    });

    it('includes the validation result', () => {
      const seed = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [] });
      const id = seed.getQuery().id!;
      const m = new QueryManager<RuleGroupType>(seed.getQuery(), {
        validator: () => ({ [id]: { valid: false, reasons: ['nope'] } }),
      });
      expect(m.getRuleGroupContext()?.validationResult).toEqual({
        valid: false,
        reasons: ['nope'],
      });
    });

    it('tolerates a boolean validation result', () => {
      const m = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [] },
        { validator: () => true }
      );
      expect(m.getRuleGroupContext()?.validationResult).toBeNull();
    });
  });
});

describe('guards', () => {
  const withDisabledRule = (): RuleGroupType => ({
    combinator: 'and',
    rules: [
      { id: 'r1', field: 'firstName', operator: '=', value: 'Steve', disabled: true },
      { id: 'r2', field: 'lastName', operator: '=', value: 'Vai' },
    ],
  });

  describe('respectDisabled', () => {
    it('is enabled by default, matching the QueryBuilder component', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), { fields });
      const before = q.getQuery();
      q.update('value', 'x', [0]);
      expect(q.getQuery()).toBe(before);
    });

    it('still allows re-enabling a disabled node', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), { fields });
      q.update('disabled', false, [0]);
      expect((q.getQuery().rules[0] as RuleType).disabled).toBe(false);
    });

    it('can be turned off', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), {
        fields,
        respectDisabled: false,
      });
      q.update('value', 'x', [0]);
      expect((q.getQuery().rules[0] as RuleType).value).toBe('x');
    });

    it('does not affect enabled nodes', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), { fields });
      q.update('value', 'x', [1]);
      expect((q.getQuery().rules[1] as RuleType).value).toBe('x');
    });

    it('blocks remove of a disabled rule', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), { fields });
      q.remove([0]);
      expect(q.getQuery().rules).toHaveLength(2);
    });

    it('throws in strict mode', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), { fields, strict: true });
      expect(() => q.update('value', 'x', [0])).toThrow(QueryManagerError);
      expect(() => q.remove([0])).toThrow(expect.objectContaining({ code: 'target-disabled' }));
    });
  });

  describe('queryDisabled', () => {
    it('blocks every mutation, including `disabled` itself', () => {
      const q = new QueryManager<RuleGroupType>(withDisabledRule(), {
        fields,
        queryDisabled: true,
      });
      const before = q.getQuery();
      q.update('value', 'x', [1]);
      q.update('disabled', false, [0]);
      q.remove([1]);
      expect(q.getQuery()).toBe(before);
    });
  });

  describe('disabledPaths', () => {
    const nested = (): RuleGroupType => ({
      combinator: 'and',
      rules: [
        { id: 'r1', field: 'firstName', operator: '=', value: 'Steve' },
        {
          id: 'g1',
          combinator: 'or',
          rules: [{ id: 'r2', field: 'lastName', operator: '=', value: 'Vai' }],
        },
      ],
    });

    it('blocks mutations targeting a listed path', () => {
      const q = new QueryManager<RuleGroupType>(nested(), { fields, disabledPaths: [[1]] });
      const before = q.getQuery();
      q.update('combinator', 'and', [1]);
      q.remove([1]);
      q.add(q.createRule(), [1]);
      expect(q.getQuery()).toBe(before);
    });

    it('blocks mutations targeting a descendant of a listed path', () => {
      const q = new QueryManager<RuleGroupType>(nested(), { fields, disabledPaths: [[1]] });
      const before = q.getQuery();
      q.update('value', 'x', [1, 0]);
      expect(q.getQuery()).toBe(before);
    });

    it('resolves an `id` to a listed path', () => {
      const q = new QueryManager<RuleGroupType>(nested(), { fields, disabledPaths: [[1]] });
      const before = q.getQuery();
      q.update('value', 'x', 'r2');
      expect(q.getQuery()).toBe(before);
    });

    it('leaves unlisted paths alone', () => {
      const q = new QueryManager<RuleGroupType>(nested(), { fields, disabledPaths: [[1]] });
      q.update('value', 'x', [0]);
      expect((q.getQuery().rules[0] as RuleType).value).toBe('x');
    });

    it('still allows re-enabling a path-disabled node', () => {
      const q = new QueryManager<RuleGroupType>(nested(), { fields, disabledPaths: [[1]] });
      q.update('disabled', false, [1]);
      expect((q.getQuery().rules[1] as RuleGroupType).disabled).toBe(false);
    });

    it('is ignored when respectDisabled is false', () => {
      const q = new QueryManager<RuleGroupType>(nested(), {
        fields,
        disabledPaths: [[1]],
        respectDisabled: false,
      });
      q.update('combinator', 'and', [1]);
      expect((q.getQuery().rules[1] as RuleGroupType).combinator).toBe('and');
    });

    it('throws in strict mode', () => {
      const q = new QueryManager<RuleGroupType>(nested(), {
        fields,
        disabledPaths: [[1]],
        strict: true,
      });
      expect(() => q.remove([1, 0])).toThrow(expect.objectContaining({ code: 'target-disabled' }));
    });
  });

  describe('maxLevels', () => {
    it('blocks groups deeper than the limit', () => {
      const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [] }, { maxLevels: 1 });
      q.add(q.createRuleGroup());
      expect(q.getQuery().rules).toHaveLength(1);
      // The nested group is one level deep, so a further group is rejected.
      q.add(q.createRuleGroup(), [0]);
      expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(0);
    });

    it('does not restrict rules', () => {
      const q = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [{ combinator: 'and', rules: [] }] },
        { fields, maxLevels: 1 }
      );
      // A rule may be added at a depth where a group would be rejected.
      q.add(q.createRule(), [0]);
      expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(1);
    });

    it('treats a non-positive value as unlimited, matching QueryBuilder', () => {
      for (const maxLevels of [0, -1]) {
        const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [] }, { maxLevels });
        q.add(q.createRuleGroup());
        q.add(q.createRuleGroup(), [0]);
        expect((q.getQuery().rules[0] as RuleGroupType).rules).toHaveLength(1);
      }
    });
  });

  describe('reset options', () => {
    it('honors resetOnOperatorChange', () => {
      const q = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule()] },
        { fields, resetOnOperatorChange: true }
      );
      q.update('operator', 'contains', [0]);
      expect((q.getQuery().rules[0] as RuleType).value).toBe('');
    });

    it('honors resetOnFieldChange: false', () => {
      const q = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule()] },
        { fields, resetOnFieldChange: false }
      );
      q.update('field', 'lastName', [0]);
      expect((q.getQuery().rules[0] as RuleType).value).toBe('Steve');
    });
  });

  describe('getInputType and getSubQueryBuilderProps', () => {
    it('surfaces both through getRuleContext', () => {
      const q = new QueryManager<RuleGroupType>(
        { combinator: 'and', rules: [rule()] },
        {
          fields,
          getInputType: () => 'date',
          getSubQueryBuilderProps: () => ({ showNotToggle: true }),
        }
      );
      const ctx = q.getRuleContext([0])!;
      expect(ctx.inputType).toBe('date');
      expect(ctx.subQueryBuilderProps).toEqual({ showNotToggle: true });
    });

    it('defaults to null and an empty object', () => {
      const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] }, { fields });
      const ctx = q.getRuleContext([0])!;
      expect(ctx.inputType).toBeNull();
      expect(ctx.subQueryBuilderProps).toEqual({});
    });
  });
});

describe('freeze option', () => {
  it('freezes everything it hands out by default', () => {
    const q = new QueryManager<RuleGroupType>({ combinator: 'and', rules: [rule()] }, { fields });
    expect(Object.isFrozen(q.getQuery())).toBe(true);
    expect(Object.isFrozen(q.getQuery().rules[0])).toBe(true);
    expect(Object.isFrozen(q.getFields())).toBe(true);
    expect(Object.isFrozen(q.getFieldMap())).toBe(true);
    expect(Object.isFrozen(q.getFieldData('firstName'))).toBe(true);
    expect(Object.isFrozen(q.getCombinators())).toBe(true);
    expect(Object.isFrozen(q.getOptions())).toBe(true);
  });

  it('leaves everything unfrozen when freeze is false', () => {
    const q = new QueryManager<RuleGroupType>(
      { combinator: 'and', rules: [rule()] },
      { fields, freeze: false }
    );
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    expect(Object.isFrozen(q.getQuery().rules[0])).toBe(false);
    expect(Object.isFrozen(q.getFields())).toBe(false);
    expect(Object.isFrozen(q.getFieldMap())).toBe(false);
    expect(Object.isFrozen(q.getFieldData('firstName'))).toBe(false);
    expect(Object.isFrozen(q.getCombinators())).toBe(false);
  });

  it('still freezes the options snapshot when freeze is false', () => {
    const q = new QueryManager(undefined, { fields, freeze: false });
    expect(Object.isFrozen(q.getOptions())).toBe(true);
  });

  it('does not freeze the results of mutations when freeze is false', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields, freeze: false });
    q.add(rule());
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.update('value', 'Stevie', [0]);
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.add(rule('lastName', 'Vai')).move([1], [0]);
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.group([1], [0]);
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.insert(rule(), [0]);
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.remove([0]);
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.setQuery({ combinator: 'and', rules: [rule()] });
    expect(Object.isFrozen(q.getQuery())).toBe(false);
  });

  it('allows in-place mutation of a query it handed out when freeze is false', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields, freeze: false });
    q.add(rule());
    const query = q.getQuery();
    expect(() => {
      query.rules.push(rule('lastName', 'Vai'));
    }).not.toThrow();
    expect(query.rules).toHaveLength(2);
  });

  it('throws on in-place mutation by default', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields });
    q.add(rule());
    expect(() => {
      q.getQuery().rules.push(rule('lastName', 'Vai'));
    }).toThrow();
  });

  it('leaves history, batch, and undo/redo results unfrozen when freeze is false', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields, freeze: false, history: true });
    q.batch(() => {
      q.add(rule()).add(rule('lastName', 'Vai'));
    });
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.undo();
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    q.redo();
    expect(Object.isFrozen(q.getQuery())).toBe(false);
    expect(q.getQuery().rules).toHaveLength(2);
  });

  it('honors the option through reconfigure', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields });
    q.add(rule());
    expect(Object.isFrozen(q.getQuery())).toBe(true);
    q.reconfigure({ freeze: false });
    expect(Object.isFrozen(q.getFields())).toBe(false);
    q.add(rule('lastName', 'Vai'));
    expect(Object.isFrozen(q.getQuery())).toBe(false);
  });
});

describe('proxy safety', () => {
  // Mirrors the shape of Vue's `reactive()`: a deep proxy that lazily wraps object-valued
  // property reads, and skips anything carrying a truthy `__v_skip` (what `markRaw` sets).
  const reactive = <T extends object>(target: T): T => {
    if ((target as Record<string, unknown>).__v_skip) return target;
    return new Proxy(target, {
      get(t, k, r) {
        const value = Reflect.get(t, k, r);
        return value !== null && typeof value === 'object' ? reactive(value) : value;
      },
    });
  };

  // Deterministic ids so two managers driven identically produce deep-equal output.
  const counter = () => {
    let n = 0;
    return () => `id-${n++}`;
  };

  const drive = (q: QueryManager) => {
    q.add(rule('firstName', 'Steve'));
    q.add(rule('lastName', 'Vai'));
    q.update('value', 'Ray', [0]);
    q.move([1], [0]);
    q.batch(() => {
      q.add(rule('age', '26'));
      q.remove([0]);
    });
    q.undo();
    q.redo();
    q.reconfigure({ fields: [...fields, { name: 'gender', label: 'Gender' }] });
    q.setQuery(q.getQuery());
    return {
      query: q.getQuery(),
      configVersion: q.getConfigVersion(),
      history: q.getHistory(),
      walk: [...q.walk()].map(({ path }) => path),
      fields: q.getFields().map(f => f.label),
      validation: q.validate(),
      sql: q.format('sql'),
    };
  };

  it('works through a bare Proxy', () => {
    const expected = drive(
      new QueryManager<RuleGroupType>(undefined, { fields, history: true, idGenerator: counter() })
    );
    const proxied = new Proxy(
      new QueryManager<RuleGroupType>(undefined, { fields, history: true, idGenerator: counter() }),
      {}
    );
    expect(drive(proxied)).toEqual(expected);
  });

  it('works through a deep reactive-style Proxy', () => {
    const expected = drive(
      new QueryManager<RuleGroupType>(undefined, { fields, history: true, idGenerator: counter() })
    );
    const proxied = reactive(
      new QueryManager<RuleGroupType>(undefined, { fields, history: true, idGenerator: counter() })
    );
    expect(drive(proxied)).toEqual(expected);
  });

  it('marks its state bag so reactive() skips it', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields });
    const [state] = Object.getOwnPropertySymbols(q).map(
      s => (q as unknown as Record<symbol, object>)[s]
    );
    expect((state as Record<string, unknown>).__v_skip).toBe(true);
    expect(Object.keys(state)).not.toContain('__v_skip');
  });

  it('keeps its state off every enumerable surface', () => {
    const q = new QueryManager<RuleGroupType>(undefined, { fields });
    q.add(rule());

    // Instance-bound methods only; the state bag is symbol-keyed and non-enumerable.
    expect(Object.keys(q)).toEqual(['getQuery', 'getConfigVersion', 'subscribe']);
    expect(JSON.stringify(q)).toBe(JSON.stringify(q.getQuery()));
    expect(JSON.parse(JSON.stringify(q))).toEqual(q.getQuery());
    expect(Object.keys({ ...q })).toEqual(Object.keys(q));
    expect(q.diagnostics()).toBeDefined();
    expect(q.clone().getQuery()).toBe(q.getQuery());
  });
});
