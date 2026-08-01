import type { RuleGroupType, RuleGroupTypeIC, RuleType, ValidationMap } from '../types';
import { formatQuery } from './formatQuery';
import { QueryManager } from './QueryManager';

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

  it('matches formatQuery called directly', () => {
    const q = new QueryManager(undefined, { fields });
    q.add(rule());
    expect(q.format('mongodb_query')).toEqual(formatQuery(q.getQuery(), 'mongodb_query'));
  });
});
