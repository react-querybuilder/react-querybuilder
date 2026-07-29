import type { DefaultRuleType } from '../../types';
import { toFullOption } from '../optGroupUtils';
import { parseRAQB } from './parseRAQB';
import { parseRAQBFields } from './parseRAQBFields';
import type {
  RAQBField,
  RAQBJsonGroup,
  RAQBJsonItem,
  RAQBJsonRule,
  RAQBJsonTree,
  RAQBRuleProperties,
  RAQBUnsupportedInfo,
} from './types';

const wrap = (...children1: RAQBJsonItem[]): RAQBJsonGroup => ({
  type: 'group',
  id: 'g1',
  properties: { conjunction: 'AND' },
  children1,
});

const rule = (properties: RAQBRuleProperties, id = 'r1'): RAQBJsonRule => ({
  type: 'rule',
  id,
  properties,
});

/** Cast helper for intentionally invalid/loosely-typed inputs. */
// oxlint-disable-next-line typescript/no-unnecessary-type-parameters -- intentional cast helper
const invalid = <T>(v: unknown): T => v as T;

describe('parseRAQB', () => {
  describe('basic structure', () => {
    it('parses an empty group', () => {
      expect(parseRAQB(wrap())).toEqual({ combinator: 'and', rules: [], id: 'g1' });
    });

    it('parses a simple rule', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'firstName', operator: 'equal', value: ['Steve'] })))
      ).toEqual({
        combinator: 'and',
        id: 'g1',
        rules: [{ field: 'firstName', operator: '=', value: 'Steve', id: 'r1' }],
      });
    });

    it('lowercases the conjunction and handles `not`', () => {
      const result = parseRAQB({
        type: 'group',
        properties: { conjunction: 'OR', not: true },
        children1: [rule({ field: 'f1', operator: 'equal', value: [1] })],
      });
      expect(result).toMatchObject({ combinator: 'or', not: true });
    });

    it('falls back to "and" for unrecognized conjunctions', () => {
      expect(
        parseRAQB({ type: 'group', properties: { conjunction: 'NAND' }, children1: [] })
      ).toMatchObject({ combinator: 'and' });
    });

    it('supports the "xor" conjunction', () => {
      expect(
        parseRAQB({ type: 'group', properties: { conjunction: 'XOR' }, children1: [] })
      ).toMatchObject({ combinator: 'xor' });
    });

    it('defaults the conjunction when properties are absent', () => {
      expect(parseRAQB({ type: 'group' })).toMatchObject({ combinator: 'and' });
    });

    it('parses nested groups', () => {
      const result = parseRAQB(
        wrap({
          type: 'group',
          properties: { conjunction: 'OR' },
          children1: [rule({ field: 'f1', operator: 'equal', value: [1] })],
        })
      );
      expect(result.rules[0]).toMatchObject({
        combinator: 'or',
        rules: [{ field: 'f1', operator: '=', value: 1 }],
      });
    });

    it('accepts a keyed-object `children1` (children1AsArray: false)', () => {
      const result = parseRAQB({
        type: 'group',
        properties: { conjunction: 'AND' },
        children1: {
          abc: { type: 'rule', properties: { field: 'f1', operator: 'equal', value: [1] } },
        },
      });
      expect(result.rules).toEqual([{ field: 'f1', operator: '=', value: 1, id: 'abc' }]);
    });

    it('accepts a JSON string', () => {
      expect(
        parseRAQB(JSON.stringify(wrap(rule({ field: 'f1', operator: 'equal', value: ['x'] }))))
      ).toMatchObject({ rules: [{ field: 'f1', operator: '=', value: 'x' }] });
    });

    it('returns an empty group for unparseable strings', () => {
      expect(parseRAQB('{{{')).toEqual({ combinator: 'and', rules: [] });
    });

    it('returns an empty group for non-objects', () => {
      expect(parseRAQB(invalid<RAQBJsonTree>(null))).toEqual({ combinator: 'and', rules: [] });
      expect(parseRAQB(invalid<RAQBJsonTree>(1))).toEqual({ combinator: 'and', rules: [] });
    });

    it('returns an empty group for unrecognized item types', () => {
      expect(parseRAQB(invalid<RAQBJsonTree>({ type: 'nonsense' }))).toEqual({
        combinator: 'and',
        rules: [],
      });
    });

    it('wraps a bare rule in a group', () => {
      expect(
        parseRAQB(invalid<RAQBJsonTree>(rule({ field: 'f1', operator: 'equal', value: [1] })))
      ).toEqual({ combinator: 'and', rules: [{ field: 'f1', operator: '=', value: 1, id: 'r1' }] });
    });

    it('throws for immutable.js trees', () => {
      expect(() => parseRAQB(invalid<RAQBJsonTree>({ toJS: () => ({}) }))).toThrow(
        /plain JSON tree/
      );
    });

    it('generates IDs when requested', () => {
      const result = parseRAQB(
        { type: 'group', properties: { conjunction: 'AND' }, children1: [] },
        { generateIDs: true }
      );
      expect(result.id).toBeDefined();
    });

    it('converts to independent combinators', () => {
      const result = parseRAQB(
        wrap(
          rule({ field: 'f1', operator: 'equal', value: [1] }, 'r1'),
          rule({ field: 'f2', operator: 'equal', value: [2] }, 'r2')
        ),
        { independentCombinators: true }
      );
      expect(result.rules).toHaveLength(3);
      expect(result.rules[1]).toBe('and');
    });
  });

  describe('operators', () => {
    it.each([
      ['equal', '='],
      ['not_equal', '!='],
      ['less', '<'],
      ['less_or_equal', '<='],
      ['greater', '>'],
      ['greater_or_equal', '>='],
      ['like', 'contains'],
      ['not_like', 'doesNotContain'],
      ['starts_with', 'beginsWith'],
      ['ends_with', 'endsWith'],
      ['select_equals', '='],
      ['select_not_equals', '!='],
      ['multiselect_contains', 'contains'],
      ['multiselect_not_contains', 'doesNotContain'],
    ])('maps %s to %s', (raqbOp, rqbOp) => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: raqbOp, value: ['v'] }))).rules[0]
      ).toEqual({ field: 'f1', operator: rqbOp, value: 'v', id: 'r1' });
    });

    it.each([
      ['is_null', 'null'],
      ['is_not_null', 'notNull'],
    ])('maps nullary operator %s to %s', (raqbOp, rqbOp) => {
      expect(parseRAQB(wrap(rule({ field: 'f1', operator: raqbOp, value: [] }))).rules[0]).toEqual({
        field: 'f1',
        operator: rqbOp,
        value: '',
        id: 'r1',
      });
    });

    it.each([
      ['is_empty', '='],
      ['is_not_empty', '!='],
    ])('maps %s to %s with an empty string value', (raqbOp, rqbOp) => {
      expect(parseRAQB(wrap(rule({ field: 'f1', operator: raqbOp, value: [] }))).rules[0]).toEqual({
        field: 'f1',
        operator: rqbOp,
        value: '',
        id: 'r1',
      });
    });

    it('joins `between` operands', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'price', operator: 'between', value: [10, 100] }))).rules[0]
      ).toEqual({ field: 'price', operator: 'between', value: '10,100', id: 'r1' });
    });

    it('keeps `between` operands as an array with listsAsArrays', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'price', operator: 'not_between', value: [10, 100] })), {
          listsAsArrays: true,
        }).rules[0]
      ).toEqual({ field: 'price', operator: 'notBetween', value: [10, 100], id: 'r1' });
    });

    it('skips `between` rules with a missing operand', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'price', operator: 'between', value: [10, null] }))).rules
      ).toHaveLength(0);
    });

    it('joins list operands', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'select_any_in', value: [['a', 'b']] })))
          .rules[0]
      ).toEqual({ field: 'f1', operator: 'in', value: 'a,b', id: 'r1' });
    });

    it('keeps list operands as an array with listsAsArrays', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'select_not_any_in', value: [['a', 'b']] })), {
          listsAsArrays: true,
        }).rules[0]
      ).toEqual({ field: 'f1', operator: 'notIn', value: ['a', 'b'], id: 'r1' });
    });

    it('reports and skips unmappable operators', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      const result = parseRAQB(
        wrap(rule({ field: 'f1', operator: 'proximity', value: ['a', 'b'] })),
        { onUnsupported: info => unsupported.push(info) }
      );
      expect(result.rules).toHaveLength(0);
      expect(unsupported).toEqual([
        { reason: 'operator', key: 'proximity', message: expect.stringContaining('proximity') },
      ]);
    });

    it('accepts operator map overrides', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'proximity', value: ['a'] })), {
          operatorMap: { proximity: 'contains' },
        }).rules[0]
      ).toMatchObject({ operator: 'contains', value: 'a' });
    });

    it('skips rules with no operator', () => {
      expect(parseRAQB(wrap(rule({ field: 'f1', value: ['x'] }))).rules).toHaveLength(0);
    });

    it('skips rules with no value', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'equal', value: [] }))).rules
      ).toHaveLength(0);
    });

    it('skips rules with no field', () => {
      expect(parseRAQB(wrap(rule({ operator: 'equal', value: ['x'] }))).rules).toHaveLength(0);
      expect(
        parseRAQB(wrap(rule({ field: '', operator: 'equal', value: ['x'] }))).rules
      ).toHaveLength(0);
    });

    it('handles rules with no properties', () => {
      expect(parseRAQB(wrap(invalid<RAQBJsonItem>({ type: 'rule' }))).rules).toHaveLength(0);
    });

    it('handles rule groups with no properties', () => {
      expect(parseRAQB(wrap({ type: 'rule_group' })).rules).toHaveLength(0);
    });

    it('skips rules with a null value', () => {
      expect(
        parseRAQB(
          wrap(rule({ field: 'f1', operator: 'equal', value: [null], valueSrc: ['field'] }))
        ).rules
      ).toHaveLength(0);
    });

    it('ignores non-object children', () => {
      expect(
        parseRAQB(wrap(invalid<RAQBJsonItem>(null), invalid<RAQBJsonItem>('nope'))).rules
      ).toHaveLength(0);
    });
  });

  describe('value sources', () => {
    it('parses field-sourced values', () => {
      expect(
        parseRAQB(
          wrap(rule({ field: 'f1', operator: 'equal', value: ['f2'], valueSrc: ['field'] }))
        ).rules[0]
      ).toEqual({ field: 'f1', operator: '=', value: 'f2', valueSource: 'field', id: 'r1' });
    });

    it('treats "const" like "value"', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'equal', value: [7], valueSrc: ['const'] })))
          .rules[0]
      ).toEqual({ field: 'f1', operator: '=', value: 7, id: 'r1' });
    });
  });

  describe('fields option', () => {
    it('skips rules for unknown fields', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      const result = parseRAQB(wrap(rule({ field: 'nope', operator: 'equal', value: [1] })), {
        fields: [toFullOption({ name: 'f1', label: 'F1' })],
        onUnsupported: info => unsupported.push(info),
      });
      expect(result.rules).toHaveLength(0);
      expect(unsupported[0]).toMatchObject({ reason: 'field', key: 'nope' });
    });

    it('keeps rules for known fields', () => {
      expect(
        parseRAQB(wrap(rule({ field: 'f1', operator: 'equal', value: [1] })), {
          fields: [toFullOption({ name: 'f1', label: 'F1' })],
        }).rules
      ).toHaveLength(1);
    });
  });

  describe('rule_group (!struct and !group)', () => {
    it('flattens struct-mode rule groups into nested groups', () => {
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          id: 'rg1',
          properties: { field: 'results', mode: 'struct' },
          children1: [rule({ field: 'results.score', operator: 'greater', value: [5] })],
        })
      );
      expect(result.rules[0]).toEqual({
        combinator: 'and',
        id: 'rg1',
        rules: [{ field: 'results.score', operator: '>', value: 5, id: 'r1' }],
      });
    });

    it('preserves the id of a struct-mode rule group without one', () => {
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          properties: { field: 'results', mode: 'struct' },
          children1: [rule({ field: 'results.score', operator: 'greater', value: [5] })],
        })
      );
      expect(result.rules[0]).not.toHaveProperty('id');
    });

    it('drops empty struct-mode rule groups', () => {
      expect(
        parseRAQB(wrap({ type: 'rule_group', properties: { field: 'results', mode: 'struct' } }))
          .rules
      ).toHaveLength(0);
    });

    it.each([
      ['some', 'some'],
      ['all', 'all'],
      ['none', 'none'],
    ])('maps aggregate operator %s to match mode %s', (raqbOp, mode) => {
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          id: 'rg1',
          properties: { field: 'results', mode: 'some', operator: raqbOp, conjunction: 'OR' },
          children1: [rule({ field: 'results.score', operator: 'greater', value: [5] })],
        })
      );
      expect(result.rules[0]).toEqual({
        field: 'results',
        operator: '=',
        id: 'rg1',
        match: { mode },
        value: {
          combinator: 'or',
          rules: [{ field: 'results.score', operator: '>', value: 5, id: 'r1' }],
        },
      });
    });

    it.each([
      ['equal', 'exactly'],
      ['greater_or_equal', 'atLeast'],
      ['less_or_equal', 'atMost'],
    ])('maps count operator %s to match mode %s with a threshold', (raqbOp, mode) => {
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          properties: { field: 'results', mode: 'array', operator: raqbOp, value: [3] },
          children1: [],
        })
      );
      expect(result.rules[0]).toMatchObject({ match: { mode, threshold: 3 } });
    });

    it('propagates the sub-query `not` flag', () => {
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          properties: { field: 'results', mode: 'array', operator: 'some', not: true },
          children1: [],
        })
      );
      expect((result.rules[0] as DefaultRuleType).value).toMatchObject({ not: true });
    });

    it('reports and skips unmappable group operators', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      const result = parseRAQB(
        wrap({
          type: 'rule_group',
          properties: { field: 'results', mode: 'array', operator: 'greater', value: [3] },
          children1: [],
        }),
        { onUnsupported: info => unsupported.push(info) }
      );
      expect(result.rules).toHaveLength(0);
      expect(unsupported[0]).toMatchObject({ reason: 'match_mode', key: 'greater' });
    });

    it('skips count operators with a non-numeric threshold', () => {
      expect(
        parseRAQB(
          wrap({
            type: 'rule_group',
            properties: { field: 'results', mode: 'array', operator: 'equal', value: ['x'] },
            children1: [],
          })
        ).rules
      ).toHaveLength(0);
    });

    it('skips rule groups with no operator', () => {
      expect(
        parseRAQB(
          wrap({
            type: 'rule_group',
            properties: { field: 'results', mode: 'array' },
            children1: [],
          })
        ).rules
      ).toHaveLength(0);
    });
  });

  describe('switch_group', () => {
    it('reports and skips switch groups', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      const result = parseRAQB(
        { type: 'switch_group', children1: [] },
        { onUnsupported: info => unsupported.push(info) }
      );
      expect(result).toEqual({ combinator: 'and', rules: [] });
      expect(unsupported[0]).toMatchObject({ reason: 'switch_group' });
    });

    it('reports and skips case groups', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      parseRAQB(wrap({ type: 'case_group', children1: [] }), {
        onUnsupported: info => unsupported.push(info),
      });
      expect(unsupported[0]).toMatchObject({ reason: 'case_group' });
    });
  });
});

describe('parseRAQBFields', () => {
  it('translates simple fields', () => {
    expect(
      parseRAQBFields({
        fields: { firstName: { type: 'text', label: 'First name' }, age: { type: 'number' } },
      })
    ).toEqual([
      { name: 'firstName', label: 'First name', inputType: 'text', valueEditorType: 'text' },
      { name: 'age', label: 'age', inputType: 'number' },
    ]);
  });

  it('accepts a bare fields object', () => {
    expect(parseRAQBFields({ f1: { type: 'text' } })).toMatchObject([{ name: 'f1' }]);
  });

  it('flattens !struct fields with dotted names', () => {
    expect(
      parseRAQBFields({
        fields: { user: { type: '!struct', subfields: { name: { type: 'text', label: 'Name' } } } },
      })
    ).toMatchObject([{ name: 'user.name', label: 'Name' }]);
  });

  it('honors a custom field separator', () => {
    expect(
      parseRAQBFields(
        { fields: { user: { type: '!struct', subfields: { name: { type: 'text' } } } } },
        { fieldSeparator: '->' }
      )
    ).toMatchObject([{ name: 'user->name' }]);
  });

  it('reads the field separator from config settings', () => {
    expect(
      parseRAQBFields({
        fields: { user: { type: '!struct', subfields: { name: { type: 'text' } } } },
        settings: { fieldSeparator: '/' },
      })
    ).toMatchObject([{ name: 'user/name' }]);
  });

  it('translates !group fields to match modes with subproperties', () => {
    expect(
      parseRAQBFields({
        fields: {
          results: {
            type: '!group',
            mode: 'array',
            label: 'Results',
            subfields: { score: { type: 'number' } },
          },
        },
      })
    ).toEqual([
      {
        name: 'results',
        label: 'Results',
        matchModes: true,
        subproperties: [{ name: 'score', label: 'score', inputType: 'number' }],
      },
    ]);
  });

  it('handles !group fields with no subfields', () => {
    expect(parseRAQBFields({ fields: { r: { type: '!group', mode: 'array' } } })).toMatchObject([
      { name: 'r', subproperties: [] },
    ]);
  });

  it.each([
    ['select', 'select'],
    ['multiselect', 'multiselect'],
    ['treeselect', 'select'],
    ['treemultiselect', 'multiselect'],
    ['boolean', 'checkbox'],
    ['textarea', 'textarea'],
  ])('maps type %s to value editor %s', (type, valueEditorType) => {
    expect(parseRAQBFields({ fields: { f: { type } } })[0]).toMatchObject({ valueEditorType });
  });

  it.each([
    ['date', 'date'],
    ['time', 'time'],
    ['datetime', 'datetime-local'],
    ['price', 'number'],
    ['slider', 'number'],
  ])('maps type %s to input type %s', (type, inputType) => {
    expect(parseRAQBFields({ fields: { f: { type } } })[0]).toMatchObject({ inputType });
  });

  it('normalizes listValues in all accepted shapes', () => {
    const expected = [
      { name: 'a', label: 'A' },
      { name: 'b', label: 'B' },
    ];
    expect(
      parseRAQBFields({
        fields: {
          f: {
            type: 'select',
            fieldSettings: {
              listValues: [
                { value: 'a', title: 'A' },
                { value: 'b', title: 'B' },
              ],
            },
          },
        },
      })[0].values
    ).toEqual(expected);
    expect(
      parseRAQBFields({
        fields: { f: { type: 'select', fieldSettings: { listValues: { a: 'A', b: 'B' } } } },
      })[0].values
    ).toEqual(expected);
    expect(
      parseRAQBFields({
        fields: { f: { type: 'select', fieldSettings: { listValues: ['a', 'b'] } } },
      })[0].values
    ).toEqual([
      { name: 'a', label: 'a' },
      { name: 'b', label: 'b' },
    ]);
  });

  it('flattens treeValues depth-first', () => {
    expect(
      parseRAQBFields({
        fields: {
          f: {
            type: 'treeselect',
            fieldSettings: {
              treeValues: [
                { value: '1', title: 'One', children: [{ value: '1.1', title: 'One.One' }] },
                { value: '2', title: 'Two' },
              ],
            },
          },
        },
      })[0].values
    ).toEqual([
      { name: '1', label: 'One' },
      { name: '1.1', label: 'One.One' },
      { name: '2', label: 'Two' },
    ]);
  });

  it('defaults the value editor to select when values are present', () => {
    expect(
      parseRAQBFields({
        fields: { f: { type: 'unknown-type', fieldSettings: { listValues: ['a'] } } },
      })[0]
    ).toMatchObject({ valueEditorType: 'select' });
  });

  it('translates and deduplicates operators', () => {
    expect(
      parseRAQBFields({
        fields: {
          f: {
            type: 'text',
            operators: ['equal', 'select_equals', 'not_equal'],
            defaultOperator: 'equal',
          },
        },
      })[0]
    ).toMatchObject({ operators: ['=', '!='], defaultOperator: '=' });
  });

  it('applies excludeOperators', () => {
    expect(
      parseRAQBFields({
        fields: {
          f: { type: 'text', operators: ['equal', 'not_equal'], excludeOperators: ['not_equal'] },
        },
      })[0]
    ).toMatchObject({ operators: ['='] });
  });

  it('reports untranslatable operators', () => {
    const unsupported: RAQBUnsupportedInfo[] = [];
    const result = parseRAQBFields(
      { fields: { f: { type: 'text', operators: ['proximity'] } } },
      { onUnsupported: info => unsupported.push(info) }
    );
    expect(result[0].operators).toBeUndefined();
    expect(unsupported[0]).toMatchObject({ reason: 'operator', key: 'proximity' });
  });

  it('ignores an untranslatable defaultOperator', () => {
    expect(
      parseRAQBFields({ fields: { f: { type: 'text', defaultOperator: 'proximity' } } })[0]
        .defaultOperator
    ).toBeUndefined();
  });

  it('translates value sources', () => {
    expect(
      parseRAQBFields({
        fields: { f: { type: 'text', valueSources: ['value', 'field', 'func', 'const'] } },
      })[0]
    ).toMatchObject({ valueSources: ['value', 'field', 'expression'] });
  });

  it('preserves defaultValue', () => {
    expect(
      parseRAQBFields({ fields: { f: { type: 'text', defaultValue: 'x' } } })[0]
    ).toMatchObject({ defaultValue: 'x' });
  });

  it('omits hidden fields unless requested', () => {
    const fields = { f1: { type: 'text', hideForSelect: true }, f2: { type: 'text' } };
    expect(parseRAQBFields({ fields })).toHaveLength(1);
    expect(parseRAQBFields({ fields }, { includeHidden: true })).toHaveLength(2);
  });

  it('ignores non-object field entries', () => {
    expect(
      parseRAQBFields({ fields: { f1: invalid<RAQBField>(null), f2: { type: 'text' } } })
    ).toHaveLength(1);
  });

  it('handles a missing fields object', () => {
    expect(parseRAQBFields(invalid<Record<string, RAQBField>>({}))).toEqual([]);
    expect(parseRAQBFields(invalid<Record<string, RAQBField>>(undefined))).toEqual([]);
  });

  it('handles !struct fields with no subfields', () => {
    expect(parseRAQBFields({ fields: { s: { type: '!struct' } } })).toEqual([]);
  });

  it('ignores an empty valueSources array', () => {
    expect(
      parseRAQBFields({ fields: { f: { type: 'text', valueSources: [] } } })[0].valueSources
    ).toBeUndefined();
  });

  it('normalizes list values keyed by `key` and labeled by `label`', () => {
    expect(
      parseRAQBFields({
        fields: {
          f: { type: 'select', fieldSettings: { listValues: [{ key: 'a', label: 'A' }] } },
        },
      })[0].values
    ).toEqual([{ name: 'a', label: 'A' }]);
  });

  it('falls back to the value for a missing list value title', () => {
    expect(
      parseRAQBFields({
        fields: { f: { type: 'select', fieldSettings: { listValues: [{ value: 'a' }, {}] } } },
      })[0].values
    ).toEqual([
      { name: 'a', label: 'a' },
      { name: '', label: '' },
    ]);
  });

  it('handles tree values with no children', () => {
    expect(
      parseRAQBFields({
        fields: { f: { type: 'treeselect', fieldSettings: { treeValues: [{ value: '1' }] } } },
      })[0].values
    ).toEqual([{ name: '1', label: '1' }]);
  });

  it('accepts operator map overrides', () => {
    expect(
      parseRAQBFields(
        { fields: { f: { type: 'text', operators: ['proximity'] } } },
        { operatorMap: { proximity: 'contains' } }
      )[0]
    ).toMatchObject({ operators: ['contains'] });
  });
});
