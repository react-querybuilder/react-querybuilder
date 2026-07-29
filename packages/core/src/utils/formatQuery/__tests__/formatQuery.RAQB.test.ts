import {
  defaultPlaceholderFieldName as defaultFieldPlaceholder,
  defaultPlaceholderOperatorName as defaultOperatorPlaceholder,
} from '../../../defaults';
import type { Field, RuleGroupType, RuleGroupTypeIC } from '../../../types';
import { formatRAQBFields } from '../../parseRAQB/formatRAQBFields';
import { parseRAQB } from '../../parseRAQB/parseRAQB';
import type { RAQBJsonGroup, RAQBJsonRule, RAQBJsonRuleGroup } from '../../parseRAQB/types';
import { raqbFallback } from '../defaultRuleGroupProcessorRAQB';
import { formatQuery } from '../formatQuery';

const toRAQB = (query: RuleGroupType | RuleGroupTypeIC, options = {}) =>
  formatQuery(query, { ...options, format: 'raqb' }) as RAQBJsonGroup;

/** Wraps a single rule in the minimal query shape and returns the emitted RAQB child item. */
const firstItem = (rule: object, options = {}) =>
  toRAQB({ combinator: 'and', rules: [rule] } as RuleGroupType, options).children1 as (
    | RAQBJsonRule
    | RAQBJsonRuleGroup
    | RAQBJsonGroup
  )[];

const firstRule = (rule: object, options = {}) => firstItem(rule, options)[0] as RAQBJsonRule;

const props = (rule: object, options = {}) => firstRule(rule, options).properties;

describe('formatQuery "raqb" format', () => {
  it('emits an empty group for an empty query', () => {
    expect(toRAQB({ combinator: 'and', rules: [] })).toEqual({
      type: 'group',
      properties: { conjunction: 'AND', not: false },
      children1: [],
    });
  });

  it('maps combinators to conjunctions', () => {
    expect(toRAQB({ combinator: 'or', rules: [] }).properties?.conjunction).toBe('OR');
    // RAQB defines no XOR conjunction; the value is emitted verbatim rather than degraded.
    expect(toRAQB({ combinator: 'xor', rules: [] }).properties?.conjunction).toBe('XOR');
  });

  it('emits `not`', () => {
    expect(toRAQB({ combinator: 'and', not: true, rules: [] }).properties?.not).toBe(true);
  });

  it('preserves ids', () => {
    const result = toRAQB({
      id: 'g-root',
      combinator: 'and',
      rules: [{ id: 'r-1', field: 'f1', operator: '=', value: 'v1' }],
    });
    expect(result.id).toBe('g-root');
    expect((result.children1 as RAQBJsonRule[])[0].id).toBe('r-1');
  });

  it('converts independent combinators', () => {
    const queryIC: RuleGroupTypeIC = {
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        'or',
        { field: 'f2', operator: '=', value: 'v2' },
      ],
    };
    expect(toRAQB(queryIC).properties?.conjunction).toBe('OR');
    expect(toRAQB(queryIC).children1).toHaveLength(2);
  });

  it('omits empty nested groups but keeps the outermost group', () => {
    expect(
      toRAQB({ combinator: 'and', rules: [{ combinator: 'or', rules: [] }] }).children1
    ).toEqual([]);
  });

  it('omits placeholder rules', () => {
    expect(
      toRAQB({
        combinator: 'and',
        rules: [
          { field: defaultFieldPlaceholder, operator: '=', value: 'v' },
          { field: 'f1', operator: defaultOperatorPlaceholder, value: 'v' },
        ],
      }).children1
    ).toEqual([]);
  });

  describe('operators', () => {
    it.each([
      ['=', 'equal'],
      ['!=', 'not_equal'],
      ['<', 'less'],
      ['<=', 'less_or_equal'],
      ['>', 'greater'],
      ['>=', 'greater_or_equal'],
      ['contains', 'like'],
      ['doesNotContain', 'not_like'],
      ['beginsWith', 'starts_with'],
      ['endsWith', 'ends_with'],
    ])('maps "%s" to "%s"', (rqbOperator, raqbOperator) => {
      expect(props({ field: 'f1', operator: rqbOperator, value: 'v' }).operator).toBe(raqbOperator);
    });

    it('maps null/notNull with no operands', () => {
      expect(props({ field: 'f1', operator: 'null', value: '' })).toEqual({
        field: 'f1',
        operator: 'is_null',
        value: [],
        valueSrc: [],
      });
      expect(props({ field: 'f1', operator: 'notNull', value: '' }).operator).toBe('is_not_null');
    });

    it('skips operators with no RAQB equivalent', () => {
      expect(firstItem({ field: 'f1', operator: 'doesNotBeginWith', value: 'v' })).toEqual([]);
      expect(firstItem({ field: 'f1', operator: 'doesNotEndWith', value: 'v' })).toEqual([]);
    });

    it('accepts operator map overrides', () => {
      expect(
        props(
          { field: 'f1', operator: 'doesNotBeginWith', value: 'v' },
          { context: { raqbOperatorMap: { doesNotBeginWith: 'not_starts_with' } } }
        ).operator
      ).toBe('not_starts_with');
    });

    it('prefers select variants for select fields', () => {
      const fields: Field[] = [{ name: 'f1', label: 'F1', valueEditorType: 'select' }];
      expect(props({ field: 'f1', operator: '=', value: 'v' }, { fields }).operator).toBe(
        'select_equals'
      );
      expect(props({ field: 'f1', operator: '!=', value: 'v' }, { fields }).operator).toBe(
        'select_not_equals'
      );
    });

    it('prefers multiselect variants for multiselect fields', () => {
      const fields: Field[] = [{ name: 'f1', label: 'F1', valueEditorType: 'multiselect' }];
      expect(props({ field: 'f1', operator: '=', value: 'v' }, { fields }).operator).toBe(
        'multiselect_equals'
      );
      expect(props({ field: 'f1', operator: 'contains', value: 'v' }, { fields }).operator).toBe(
        'multiselect_contains'
      );
    });
  });

  describe('values', () => {
    it('wraps a scalar operand in an array', () => {
      expect(props({ field: 'f1', operator: '=', value: 'v1' })).toEqual({
        field: 'f1',
        operator: 'equal',
        value: ['v1'],
        valueSrc: ['value'],
      });
    });

    it.each([
      ['1,2', [1, 2]],
      [
        ['1', '2'],
        ['1', '2'],
      ],
    ])('splits `between` operands (%j)', (value, _expected) => {
      const result = props({ field: 'f1', operator: 'between', value });
      expect(result.value).toHaveLength(2);
      expect(result.valueSrc).toEqual(['value', 'value']);
    });

    it('nests `in` operands in a list', () => {
      expect(props({ field: 'f1', operator: 'in', value: 'a,b' })).toEqual({
        field: 'f1',
        operator: 'select_any_in',
        value: [['a', 'b']],
        valueSrc: ['value'],
      });
      expect(props({ field: 'f1', operator: 'notIn', value: ['a', 'b'] }).operator).toBe(
        'select_not_any_in'
      );
    });

    it('emits field-sourced operands', () => {
      expect(props({ field: 'f1', operator: '=', value: 'f2', valueSource: 'field' })).toEqual({
        field: 'f1',
        operator: 'equal',
        value: ['f2'],
        valueSrc: ['field'],
      });
    });

    it('skips parameter-sourced operands', () => {
      expect(
        firstItem({ field: 'f1', operator: '=', value: 'p1', valueSource: 'parameter' })
      ).toEqual([]);
    });

    it('emits value types on request', () => {
      const fields: Field[] = [{ name: 'f1', label: 'F1', inputType: 'number' }];
      expect(
        props(
          { field: 'f1', operator: '=', value: 1 },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toEqual(['number']);
      expect(
        props(
          { field: 'f1', operator: 'between', value: '1,2' },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toEqual(['number', 'number']);
      expect(
        props(
          { field: 'f1', operator: 'in', value: '1,2' },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toEqual(['multiselect']);
    });

    it('falls back to `valueEditorType` and omits unmappable value types', () => {
      const fields: Field[] = [
        { name: 'f1', label: 'F1', valueEditorType: 'select' },
        { name: 'f2', label: 'F2' },
      ];
      expect(
        props(
          { field: 'f1', operator: '=', value: 'v' },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toEqual(['select']);
      expect(
        props(
          { field: 'f2', operator: '=', value: 'v' },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toBeUndefined();
      // No matching field at all.
      expect(
        props(
          { field: 'f3', operator: '=', value: 'v' },
          { fields, context: { raqbValueTypes: true } }
        ).valueType
      ).toBeUndefined();
    });

    it('skips `between` rules with an unrepresentable operand', () => {
      expect(
        firstItem({ field: 'f1', operator: 'between', valueSource: 'parameter', value: 'p1,p2' })
      ).toEqual([]);
    });

    it('omits value types by default', () => {
      expect(props({ field: 'f1', operator: '=', value: 1 }).valueType).toBeUndefined();
    });
  });

  describe('expressions', () => {
    it('emits an LHS function', () => {
      expect(
        props({
          field: 'f1',
          operator: '=',
          value: 'v',
          lhs: { kind: 'func', fn: 'lower', args: [{ kind: 'field', field: 'f1' }] },
        })
      ).toEqual({
        field: { func: 'LOWER', args: { str: { value: 'f1', valueSrc: 'field' } } },
        fieldSrc: 'func',
        operator: 'equal',
        value: ['v'],
        valueSrc: ['value'],
      });
    });

    it('emits an RHS function', () => {
      expect(
        props({
          field: 'f1',
          operator: '=',
          valueSource: 'expression',
          value: { kind: 'func', fn: 'upper', args: [{ kind: 'value', value: 'x' }] },
        })
      ).toEqual({
        field: 'f1',
        operator: 'equal',
        value: [{ func: 'UPPER', args: { str: { value: 'x', valueSrc: 'value' } } }],
        valueSrc: ['func'],
      });
    });

    it('names unknown function arguments positionally', () => {
      expect(
        props({
          field: 'f1',
          operator: '=',
          valueSource: 'expression',
          value: {
            kind: 'func',
            fn: 'myFunc',
            args: [
              { kind: 'value', value: 1 },
              { kind: 'value', value: 2 },
            ],
          },
        }).value
      ).toEqual([
        {
          func: 'myFunc',
          args: { arg0: { value: 1, valueSrc: 'value' }, arg1: { value: 2, valueSrc: 'value' } },
        },
      ]);
    });

    it('accepts function name and argument name overrides', () => {
      expect(
        props(
          {
            field: 'f1',
            operator: '=',
            valueSource: 'expression',
            value: { kind: 'func', fn: 'myFunc', args: [{ kind: 'value', value: 1 }] },
          },
          {
            context: {
              raqbFunctionMap: { myFunc: 'MY_FUNC' },
              raqbFuncArgOrder: { MY_FUNC: ['num'] },
            },
          }
        ).value
      ).toEqual([{ func: 'MY_FUNC', args: { num: { value: 1, valueSrc: 'value' } } }]);
    });

    it('skips expressions containing parameters', () => {
      expect(
        firstItem({
          field: 'f1',
          operator: '=',
          valueSource: 'expression',
          value: { kind: 'func', fn: 'lower', args: [{ kind: 'parameter', parameter: 'p' }] },
        })
      ).toEqual([]);
      expect(
        firstItem({
          field: 'f1',
          operator: '=',
          value: 'v',
          lhs: { kind: 'parameter', parameter: 'p' },
        })
      ).toEqual([]);
    });

    it('skips non-object expression operands', () => {
      expect(
        firstItem({ field: 'f1', operator: '=', valueSource: 'expression', value: 'nope' })
      ).toEqual([]);
    });

    it('leaves a non-function LHS as a plain field', () => {
      expect(
        props({ field: 'f1', operator: '=', value: 'v', lhs: { kind: 'field', field: 'f2' } })
      ).toHaveProperty('field', 'f1');
    });
  });

  describe('relative date/time values', () => {
    const relative = (value: object, options = {}) =>
      props({ field: 'f1', operator: '=', value }, options).value?.[0];

    it('converts a `now` anchor with no offset', () => {
      expect(relative({ mode: 'relative', anchor: 'now', offset: 0, unit: 'day' })).toEqual({
        func: 'NOW',
        args: {},
      });
    });

    it('converts a `startOfDay` anchor', () => {
      expect(relative({ mode: 'relative', anchor: 'startOfDay', offset: 0, unit: 'day' })).toEqual({
        func: 'START_OF_TODAY',
        args: {},
      });
    });

    it('converts a truncated anchor', () => {
      expect(
        relative({ mode: 'relative', anchor: 'startOfMonth', offset: 0, unit: 'day' })
      ).toEqual({
        func: 'TRUNCATE_DATETIME',
        args: {
          date: { value: { func: 'NOW', args: {} }, valueSrc: 'func', valueType: 'datetime' },
          dim: { value: 'month', valueSrc: 'value', valueType: 'select' },
        },
      });
    });

    it('converts an offset', () => {
      expect(relative({ mode: 'relative', anchor: 'now', offset: -3, unit: 'day' })).toEqual({
        func: 'RELATIVE_DATETIME',
        args: {
          date: { value: { func: 'NOW', args: {} }, valueSrc: 'func', valueType: 'datetime' },
          op: { value: 'minus', valueSrc: 'value', valueType: 'select' },
          val: { value: 3, valueSrc: 'value', valueType: 'number' },
          dim: { value: 'day', valueSrc: 'value', valueType: 'select' },
        },
      });
    });

    it('converts a positive offset', () => {
      expect(relative({ mode: 'relative', anchor: 'now', offset: 3, unit: 'hour' })).toMatchObject({
        func: 'RELATIVE_DATETIME',
        args: {
          op: { value: 'plus', valueSrc: 'value', valueType: 'select' },
          val: { value: 3, valueSrc: 'value', valueType: 'number' },
          dim: { value: 'hour', valueSrc: 'value', valueType: 'select' },
        },
      });
    });

    it('emits a non-finite offset as the bare anchor', () => {
      expect(
        relative({ mode: 'relative', anchor: 'now', offset: Number.NaN, unit: 'day' })
      ).toEqual({ func: 'NOW', args: {} });
    });

    it('emits `endOf*` anchors as plain values', () => {
      const value = { mode: 'relative', anchor: 'endOfMonth', offset: 0, unit: 'day' };
      expect(relative(value)).toEqual(value);
    });

    it('emits plain values when disabled', () => {
      const value = { mode: 'relative', anchor: 'now', offset: 0, unit: 'day' };
      expect(relative(value, { context: { raqbRelativeDateTimes: false } })).toEqual(value);
    });
  });

  describe('match modes', () => {
    const matchRule = (match: object, options = {}) =>
      firstItem(
        {
          field: 'cars',
          operator: '=',
          match,
          value: { combinator: 'and', rules: [{ field: 'year', operator: '>', value: 2000 }] },
        },
        options
      )[0] as RAQBJsonRuleGroup;

    it.each([
      [{ mode: 'all' }, 'all', []],
      [{ mode: 'some' }, 'some', []],
      [{ mode: 'none' }, 'none', []],
      [{ mode: 'exactly', threshold: 2 }, 'equal', [2]],
      [{ mode: 'atLeast', threshold: 2 }, 'greater_or_equal', [2]],
      [{ mode: 'atMost', threshold: 2 }, 'less_or_equal', [2]],
    ])('maps %j', (match, operator, value) => {
      const result = matchRule(match);
      expect(result.type).toBe('rule_group');
      expect(result.properties).toMatchObject({
        field: 'cars',
        mode: 'array',
        operator,
        value,
        conjunction: 'AND',
      });
    });

    it('qualifies sub-query field names with the group field name', () => {
      const children = matchRule({ mode: 'some' }).children1 as RAQBJsonRule[];
      expect(children[0].properties.field).toBe('cars.year');
    });

    it('does not double-qualify already-qualified field names', () => {
      const result = firstItem({
        field: 'cars',
        operator: '=',
        match: { mode: 'some' },
        value: { combinator: 'and', rules: [{ field: 'cars.year', operator: '>', value: 2000 }] },
      })[0] as RAQBJsonRuleGroup;
      expect((result.children1 as RAQBJsonRule[])[0].properties.field).toBe('cars.year');
    });

    it('honors a custom field separator', () => {
      const children = matchRule({ mode: 'some' }, { context: { raqbFieldSeparator: '->' } })
        .children1 as RAQBJsonRule[];
      expect(children[0].properties.field).toBe('cars->year');
    });

    it('defaults a missing sub-query combinator to AND', () => {
      const result = firstItem({
        field: 'cars',
        operator: '=',
        match: { mode: 'some' },
        // oxlint-disable-next-line typescript/no-explicit-any
        value: { rules: [{ field: 'year', operator: '>', value: 2000 }] } as any,
      })[0] as RAQBJsonRuleGroup;
      expect(result.properties?.conjunction).toBe('AND');
    });

    it('emits `not` on the sub-query', () => {
      const result = firstItem({
        field: 'cars',
        operator: '=',
        match: { mode: 'some' },
        value: {
          combinator: 'or',
          not: true,
          rules: [{ field: 'year', operator: '>', value: 2000 }],
        },
      })[0] as RAQBJsonRuleGroup;
      expect(result.properties).toMatchObject({ conjunction: 'OR', not: true });
    });

    it('preserves the rule id', () => {
      const result = firstItem({
        id: 'r-1',
        field: 'cars',
        operator: '=',
        match: { mode: 'some' },
        value: { combinator: 'and', rules: [] },
      })[0] as RAQBJsonRuleGroup;
      expect(result.id).toBe('r-1');
    });

    it('skips invalid match configurations', () => {
      expect(
        firstItem({ field: 'cars', operator: '=', match: { mode: 'some' }, value: 'x' })
      ).toEqual([]);
      expect(
        firstItem({
          field: 'cars',
          operator: '=',
          match: { mode: 'atLeast' },
          value: { combinator: 'and', rules: [] },
        })
      ).toEqual([]);
    });
  });

  describe('validation', () => {
    it('returns the fallback tree when the validator returns false', () => {
      expect(
        formatQuery({ combinator: 'and', rules: [] }, { format: 'raqb', validator: () => false })
      ).toEqual(raqbFallback);
    });

    it('omits invalid rules', () => {
      expect(
        toRAQB(
          { combinator: 'and', rules: [{ id: 'r-1', field: 'f1', operator: '=', value: 'v' }] },
          { validator: () => ({ 'r-1': false }) }
        ).children1
      ).toEqual([]);
    });

    it('omits invalid groups', () => {
      expect(
        toRAQB(
          {
            combinator: 'and',
            rules: [
              { id: 'g-1', combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 'v' }] },
            ],
          },
          { validator: () => ({ 'g-1': false }) }
        ).children1
      ).toEqual([]);
    });
  });
});

describe('formatRAQBFields', () => {
  it('converts simple fields', () => {
    expect(
      formatRAQBFields([
        { name: 'f1', label: 'F1' },
        { name: 'n1', label: 'N1', inputType: 'number' },
        { name: 'd1', label: 'D1', inputType: 'datetime-local' },
        { name: 'b1', label: 'B1', valueEditorType: 'checkbox' },
        { name: 't1', label: 'T1', valueEditorType: 'textarea' },
      ])
    ).toEqual({
      f1: { type: 'text', label: 'F1' },
      n1: { type: 'number', label: 'N1' },
      d1: { type: 'datetime', label: 'D1' },
      b1: { type: 'boolean', label: 'B1' },
      t1: { type: 'text', label: 'T1', preferWidgets: ['textarea'] },
    });
  });

  it('converts values to list values and infers a select type', () => {
    expect(
      formatRAQBFields([{ name: 'f1', label: 'F1', values: [{ name: 'a', label: 'A' }] }]).f1
    ).toEqual({
      type: 'select',
      label: 'F1',
      fieldSettings: { listValues: [{ value: 'a', title: 'A' }] },
    });
  });

  it('converts operators, default operator, default value, and value sources', () => {
    expect(
      formatRAQBFields([
        {
          name: 'f1',
          label: 'F1',
          operators: [
            { name: '=', label: '=' },
            { name: 'doesNotBeginWith', label: 'x' },
          ],
          defaultOperator: 'contains',
          defaultValue: 'dv',
          valueSources: ['value', 'field', 'expression'],
        },
      ]).f1
    ).toEqual({
      type: 'text',
      label: 'F1',
      operators: ['equal'],
      defaultOperator: 'like',
      defaultValue: 'dv',
      valueSources: ['value', 'field', 'func'],
    });
  });

  it('nests dot-separated field names into `!struct` subfields', () => {
    expect(formatRAQBFields([{ name: 'a.b.c', label: 'C' }])).toEqual({
      a: {
        type: '!struct',
        label: 'a',
        subfields: {
          b: { type: '!struct', label: 'b', subfields: { c: { type: 'text', label: 'C' } } },
        },
      },
    });
  });

  it('honors a custom separator and the `flat` option', () => {
    expect(
      Object.keys(formatRAQBFields([{ name: 'a->b', label: 'B' }], { fieldSeparator: '->' }))
    ).toEqual(['a']);
    expect(Object.keys(formatRAQBFields([{ name: 'a.b', label: 'B' }], { flat: true }))).toEqual([
      'a.b',
    ]);
  });

  it('converts match-mode fields to `!group`', () => {
    expect(
      formatRAQBFields([
        {
          name: 'cars',
          label: 'Cars',
          matchModes: true,
          subproperties: [{ name: 'year', label: 'Year', inputType: 'number' }],
        },
      ]).cars
    ).toEqual({
      type: '!group',
      label: 'Cars',
      mode: 'array',
      subfields: { year: { type: 'number', label: 'Year' } },
    });
  });

  it('ignores fields and subproperties without names', () => {
    expect(
      formatRAQBFields([
        { name: '', label: 'X' },
        { name: 'g', label: 'G', matchModes: true, subproperties: [{ name: '', label: 'Y' }] },
        // oxlint-disable-next-line typescript/no-explicit-any
      ] as any)
    ).toEqual({ g: { type: '!group', label: 'G', mode: 'array', subfields: {} } });
  });

  it('accepts operator map overrides', () => {
    expect(
      formatRAQBFields([{ name: 'f1', label: 'F1', operators: [{ name: 'x', label: 'X' }] }], {
        operatorMap: { x: 'custom_op' },
      }).f1.operators
    ).toEqual(['custom_op']);
  });

  it('omits unmappable operators and default operators', () => {
    expect(
      formatRAQBFields([
        {
          name: 'f1',
          label: 'F1',
          operators: [{ name: 'doesNotBeginWith', label: 'x' }],
          defaultOperator: 'doesNotEndWith',
        },
      ]).f1
    ).toEqual({ type: 'text', label: 'F1' });
  });

  it('falls back to the field name when no label is provided', () => {
    // oxlint-disable-next-line typescript/no-explicit-any
    const result = formatRAQBFields([{ name: 'f1' }, { name: 'g1', matchModes: true }] as any);
    expect(result.f1).toEqual({ type: 'text', label: 'f1' });
    expect(result.g1).toEqual({ type: '!group', label: 'g1', mode: 'array', subfields: {} });
  });

  it('reuses an existing `!struct` container', () => {
    expect(
      formatRAQBFields([
        { name: 'a.b', label: 'B' },
        { name: 'a.c', label: 'C' },
      ]).a.subfields
    ).toEqual({ b: { type: 'text', label: 'B' }, c: { type: 'text', label: 'C' } });
  });

  it('overwrites a `!struct` placeholder created for a nested name', () => {
    // `a` is emitted as a container first, then declared as a field of its own.
    expect(
      formatRAQBFields([
        { name: 'a.b', label: 'B' },
        { name: 'a', label: 'A' },
      ]).a
    ).toEqual({ type: 'text', label: 'A' });
  });
});

describe('round trip', () => {
  it('survives parseRAQB(formatQuery(query, "raqb"))', () => {
    const query: RuleGroupType = {
      combinator: 'and',
      rules: [
        { field: 'f1', operator: '=', value: 'v1' },
        { field: 'f2', operator: 'between', value: '1,2' },
        { field: 'f3', operator: 'in', value: 'a,b' },
        { field: 'f4', operator: 'null', value: '' },
        { field: 'f5', operator: '=', value: 'f6', valueSource: 'field' },
        {
          field: 'f7',
          operator: '=',
          value: { mode: 'relative', anchor: 'startOfMonth', offset: -3, unit: 'day' },
        },
        {
          field: 'f8',
          operator: '=',
          lhs: { kind: 'func', fn: 'lower', args: [{ kind: 'field', field: 'f8' }] },
          value: 'x',
        },
        { combinator: 'or', not: true, rules: [{ field: 'f9', operator: '>', value: 1 }] },
        {
          field: 'cars',
          operator: '=',
          match: { mode: 'atLeast', threshold: 2 },
          value: { combinator: 'and', rules: [{ field: 'cars.year', operator: '>', value: 2000 }] },
        },
      ],
    };

    expect(parseRAQB(formatQuery(query, 'raqb'))).toEqual(query);
  });
});
