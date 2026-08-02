import type { FullCombinator, FullField, FullOperator, RuleType } from '../types';
import { toFullOptionList } from './optGroupUtils';
import {
  resolveDefaultOperator,
  resolveOperatorList,
  resolveValueEditorType,
  resolveValueList,
} from './optionResolvers';
import { createRule, createRuleGroup } from './ruleFactory';

const operators = toFullOptionList<FullOperator>([
  { name: '=', label: '=' },
  { name: 'contains', label: 'contains' },
]);

const combinators = toFullOptionList<FullCombinator>([
  { name: 'and', label: 'AND' },
  { name: 'or', label: 'OR' },
]);

const f1 = { name: 'f1', value: 'f1', label: 'Field 1' } as FullField;

/** Option lists may be grouped; these tests only ever produce flat lists. */
const values = (list: unknown): string[] => (list as { value: string }[]).map(o => o.value);

describe('resolveOperatorList', () => {
  it('falls back to the query-level list', () => {
    const result = resolveOperatorList({ field: 'f1', fieldData: f1, operators });
    expect(values(result)).toEqual(['=', 'contains']);
  });

  it('prefers the getOperators callback', () => {
    const result = resolveOperatorList({
      field: 'f1',
      fieldData: f1,
      operators,
      getOperators: () => [{ name: 'beginsWith', label: 'begins with' }],
    });
    expect(values(result)).toEqual(['beginsWith']);
  });

  it("prefers the field's own operators above all", () => {
    const result = resolveOperatorList({
      field: 'f1',
      fieldData: { ...f1, operators: [{ name: '<', label: '<' }] },
      operators,
      getOperators: () => [{ name: 'beginsWith', label: 'begins with' }],
    });
    expect(values(result)).toEqual(['<']);
  });
});

describe('resolveDefaultOperator', () => {
  const getOperators = () => operators;

  it("prefers the field's defaultOperator", () => {
    expect(
      resolveDefaultOperator({
        field: 'f1',
        fieldData: { ...f1, defaultOperator: 'contains' },
        getOperators,
      })
    ).toBe('contains');
  });

  it('accepts a string getDefaultOperator', () => {
    expect(
      resolveDefaultOperator({
        field: 'f1',
        fieldData: f1,
        getDefaultOperator: 'contains',
        getOperators,
      })
    ).toBe('contains');
  });

  it('accepts a function getDefaultOperator', () => {
    expect(
      resolveDefaultOperator({
        field: 'f1',
        fieldData: f1,
        getDefaultOperator: () => 'contains',
        getOperators,
      })
    ).toBe('contains');
  });

  it('falls back to the first operator', () => {
    expect(resolveDefaultOperator({ field: 'f1', fieldData: f1, getOperators })).toBe('=');
  });

  it('falls back to an empty string when there are no operators', () => {
    expect(
      resolveDefaultOperator({
        field: 'f1',
        fieldData: f1,
        getOperators: () => toFullOptionList([]),
      })
    ).toBe('');
  });
});

describe('resolveValueEditorType', () => {
  it("prefers the field's literal valueEditorType", () => {
    expect(
      resolveValueEditorType({
        field: 'f1',
        operator: '=',
        fieldData: { ...f1, valueEditorType: 'checkbox' },
      })
    ).toBe('checkbox');
  });

  it("prefers the field's valueEditorType function", () => {
    expect(
      resolveValueEditorType({
        field: 'f1',
        operator: 'between',
        fieldData: { ...f1, valueEditorType: op => (op === 'between' ? 'select' : 'text') },
      })
    ).toBe('select');
  });

  it('falls back to the callback, then to text', () => {
    expect(
      resolveValueEditorType({
        field: 'f1',
        operator: '=',
        fieldData: f1,
        getValueEditorType: () => 'radio',
      })
    ).toBe('radio');
    expect(resolveValueEditorType({ field: 'f1', operator: '=', fieldData: f1 })).toBe('text');
  });
});

describe('resolveValueList', () => {
  it("prefers the field's own values", () => {
    const result = resolveValueList({
      field: 'f1',
      operator: '=',
      fieldData: { ...f1, values: [{ name: 'a', label: 'A' }] },
      getValues: () => [{ name: 'b', label: 'B' }],
    });
    expect(values(result)).toEqual(['a']);
  });

  it('falls back to the callback, then to an empty list', () => {
    expect(
      values(
        resolveValueList({
          field: 'f1',
          operator: '=',
          fieldData: f1,
          getValues: () => [{ name: 'b', label: 'B' }],
        })
      )
    ).toEqual(['b']);
    expect(resolveValueList({ field: 'f1', operator: '=', fieldData: f1 })).toHaveLength(0);
  });
});

describe('createRule', () => {
  const base = {
    fields: toFullOptionList([f1, { name: 'f2', label: 'Field 2' }]) as never,
    getRuleDefaultOperator: () => '=',
    getValueSources: () => toFullOptionList(['value']) as never,
    getMatchModes: () => [],
    getRuleDefaultValue: () => 'dflt',
  };

  it('uses the first field by default', () => {
    expect(createRule(base)).toMatchObject({ field: 'f1', operator: '=', value: 'dflt' });
  });

  it('accepts a string getDefaultField', () => {
    expect(createRule({ ...base, getDefaultField: 'f2' }).field).toBe('f2');
  });

  it('accepts a function getDefaultField', () => {
    expect(createRule({ ...base, getDefaultField: () => 'f2' }).field).toBe('f2');
  });

  it('keeps the first field when getDefaultField returns a falsy value', () => {
    expect(createRule({ ...base, getDefaultField: () => '' }).field).toBe('f1');
  });

  it('adds a match mode when one is available', () => {
    const rule = createRule({
      ...base,
      getMatchModes: () => [{ name: 'all', value: 'all', label: 'all' }] as never,
    });
    expect(rule.match).toEqual({ mode: 'all', threshold: 1 });
  });

  it('omits `match` when no match modes are available', () => {
    expect(createRule(base).match).toBeUndefined();
  });

  it('computes the value after field, operator, and valueSource are known', () => {
    const getRuleDefaultValue = vi.fn((r: RuleType) => `${r.field}/${r.operator}`);
    expect(createRule({ ...base, getRuleDefaultValue }).value).toBe('f1/=');
  });
});

describe('createRuleGroup', () => {
  const createRuleFn = () => ({ id: 'rule', field: 'f1', operator: '=', value: '' });

  it('includes the first combinator', () => {
    expect(createRuleGroup({ combinators, createRule: createRuleFn })).toMatchObject({
      combinator: 'and',
      not: false,
      rules: [],
    });
  });

  it('omits the combinator for independent combinators', () => {
    expect(createRuleGroup({ combinators, createRule: createRuleFn }, true)).not.toHaveProperty(
      'combinator'
    );
  });

  it('adds a rule when addRuleToNewGroups is set', () => {
    expect(
      createRuleGroup({ combinators, createRule: createRuleFn, addRuleToNewGroups: true }).rules
    ).toHaveLength(1);
  });

  it('generates the group id before the contained rule id', () => {
    let i = 0;
    const idGenerator = () => `id-${i++}`;
    const g = createRuleGroup({
      combinators,
      addRuleToNewGroups: true,
      createRule: () => ({ id: idGenerator(), field: 'f1', operator: '=', value: '' }),
      idGenerator,
    });
    expect(g.id).toBe('id-0');
    expect((g.rules[0] as RuleType).id).toBe('id-1');
  });

  it('falls back to an empty combinator when none are configured', () => {
    expect(
      createRuleGroup({
        combinators: toFullOptionList<FullCombinator>([]),
        createRule: createRuleFn,
      })
    ).toMatchObject({ combinator: '' });
  });
});
