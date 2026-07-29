import type { Except } from 'type-fest';
import type { DefaultRuleType } from '../../types';
import { toFullOption } from '../optGroupUtils';
import { parseRAQB } from './parseRAQB';
import type { ParseRAQBOptions } from './parseRAQB';
import type { RAQBJsonGroup, RAQBRuleProperties, RAQBUnsupportedInfo } from './types';

const wrapRule = (properties: RAQBRuleProperties): RAQBJsonGroup => ({
  type: 'group',
  properties: { conjunction: 'AND' },
  children1: [{ type: 'rule', properties }],
});

const firstRule = (
  tree: RAQBJsonGroup,
  options: Except<ParseRAQBOptions, 'independentCombinators'> = {}
): DefaultRuleType =>
  parseRAQB(tree, { ...options, independentCombinators: false }).rules[0] as DefaultRuleType;

describe('parseRAQB expressions', () => {
  describe('right-hand side functions', () => {
    it('converts a mapped function to an expression', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'name',
            operator: 'equal',
            value: [{ func: 'LOWER', args: { str: { value: 'lastName', valueSrc: 'field' } } }],
            valueSrc: ['func'],
          })
        )
      ).toEqual({
        field: 'name',
        operator: '=',
        valueSource: 'expression',
        value: { kind: 'func', fn: 'lower', args: [{ kind: 'field', field: 'lastName' }] },
      });
    });

    it('converts UPPER', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'name',
            operator: 'equal',
            value: [{ func: 'UPPER', args: { str: { value: 'abc' } } }],
            valueSrc: ['func'],
          })
        ).value
      ).toEqual({ kind: 'func', fn: 'upper', args: [{ kind: 'value', value: 'abc' }] });
    });

    it('expands LINEAR_REGRESSION into add/multiply', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'score',
            operator: 'greater',
            value: [
              {
                func: 'LINEAR_REGRESSION',
                args: {
                  coef: { value: 2 },
                  val: { value: 'base', valueSrc: 'field' },
                  bias: { value: 5 },
                },
              },
            ],
            valueSrc: ['func'],
          })
        ).value
      ).toEqual({
        kind: 'func',
        fn: 'add',
        args: [
          {
            kind: 'func',
            fn: 'multiply',
            args: [
              { kind: 'value', value: 2 },
              { kind: 'field', field: 'base' },
            ],
          },
          { kind: 'value', value: 5 },
        ],
      });
    });

    it('does not expand LINEAR_REGRESSION with the wrong arity', () => {
      const result = firstRule(
        wrapRule({
          field: 'score',
          operator: 'greater',
          value: [{ func: 'LINEAR_REGRESSION', args: { coef: { value: 2 } } }],
          valueSrc: ['func'],
        })
      );
      expect(result.value).toMatchObject({ fn: 'LINEAR_REGRESSION' });
    });

    it('nests functions', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'name',
            operator: 'equal',
            value: [
              {
                func: 'LOWER',
                args: {
                  str: {
                    valueSrc: 'func',
                    value: { func: 'UPPER', args: { str: { value: 'x' } } },
                  },
                },
              },
            ],
            valueSrc: ['func'],
          })
        ).value
      ).toEqual({
        kind: 'func',
        fn: 'lower',
        args: [{ kind: 'func', fn: 'upper', args: [{ kind: 'value', value: 'x' }] }],
      });
    });

    it('handles functions with no args', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'created',
            operator: 'less',
            value: [{ func: 'CURRENT_USER' }],
            valueSrc: ['func'],
          })
        ).value
      ).toEqual({ kind: 'func', fn: 'CURRENT_USER', args: [] });
    });

    it('passes unmapped functions through and reports them', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      const result = firstRule(
        wrapRule({
          field: 'created',
          operator: 'less',
          value: [{ func: 'RELATIVE_DATETIME', args: { val: { value: 1 } } }],
          valueSrc: ['func'],
        }),
        { onUnsupported: (info: RAQBUnsupportedInfo) => unsupported.push(info) }
      );
      expect(result.value).toMatchObject({ fn: 'RELATIVE_DATETIME' });
      expect(unsupported[0]).toMatchObject({ reason: 'func', key: 'RELATIVE_DATETIME' });
    });

    it('accepts function map overrides', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'created',
            operator: 'less',
            value: [{ func: 'NOW', args: {} }],
            valueSrc: ['func'],
          }),
          { functionMap: { NOW: 'now' }, relativeDateTimes: false }
        ).value
      ).toMatchObject({ fn: 'now' });
    });

    it('honors an explicit argument order', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'f',
            operator: 'equal',
            value: [{ func: 'CUSTOM', args: { b: { value: 2 }, a: { value: 1 } } }],
            valueSrc: ['func'],
          }),
          { funcArgOrder: { CUSTOM: ['a', 'b'] } }
        ).value.args
      ).toEqual([
        { kind: 'value', value: 1 },
        { kind: 'value', value: 2 },
      ]);
    });

    it('defaults to key insertion order for arguments', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'f',
            operator: 'equal',
            value: [{ func: 'CUSTOM', args: { b: { value: 2 }, a: { value: 1 } } }],
            valueSrc: ['func'],
          })
        ).value.args
      ).toEqual([
        { kind: 'value', value: 2 },
        { kind: 'value', value: 1 },
      ]);
    });

    it('handles missing arguments referenced by funcArgOrder', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'f',
            operator: 'equal',
            value: [{ func: 'CUSTOM', args: {} }],
            valueSrc: ['func'],
          }),
          { funcArgOrder: { CUSTOM: ['a'] } }
        ).value.args
      ).toEqual([{ kind: 'value', value: undefined }]);
    });

    it('coerces a null field-sourced argument to an empty field name', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'f',
            operator: 'equal',
            value: [{ func: 'LOWER', args: { str: { value: null, valueSrc: 'field' } } }],
            valueSrc: ['func'],
          })
        ).value.args
      ).toEqual([{ kind: 'field', field: '' }]);
    });

    it('skips rules whose func value is malformed', () => {
      expect(
        parseRAQB(
          wrapRule({ field: 'f', operator: 'equal', value: ['not-a-func'], valueSrc: ['func'] })
        ).rules
      ).toHaveLength(0);
    });
  });

  describe('left-hand side functions', () => {
    it('converts fieldSrc "func" to a `lhs` expression', () => {
      expect(
        firstRule(
          wrapRule({
            fieldSrc: 'func',
            field: { func: 'LOWER', args: { str: { value: 'firstName', valueSrc: 'field' } } },
            operator: 'equal',
            value: ['steve'],
          })
        )
      ).toEqual({
        field: 'firstName',
        operator: '=',
        value: 'steve',
        lhs: { kind: 'func', fn: 'lower', args: [{ kind: 'field', field: 'firstName' }] },
      });
    });

    it('falls back to the function name when no field argument exists', () => {
      expect(
        firstRule(
          wrapRule({
            fieldSrc: 'func',
            field: { func: 'NOW', args: {} },
            operator: 'less',
            value: ['2026-01-01'],
          })
        ).field
      ).toBe('NOW');
    });

    it('falls back to the function name when nested arguments have no field reference', () => {
      expect(
        firstRule(
          wrapRule({
            fieldSrc: 'func',
            field: {
              func: 'LOWER',
              args: {
                str: {
                  valueSrc: 'func',
                  value: { func: 'UPPER', args: { str: { value: 'literal' } } },
                },
              },
            },
            operator: 'equal',
            value: ['x'],
          })
        ).field
      ).toBe('LOWER');
    });

    it('finds a field reference nested inside function arguments', () => {
      expect(
        firstRule(
          wrapRule({
            fieldSrc: 'func',
            field: {
              func: 'LOWER',
              args: {
                str: {
                  valueSrc: 'func',
                  value: { func: 'UPPER', args: { str: { value: 'nested', valueSrc: 'field' } } },
                },
              },
            },
            operator: 'equal',
            value: ['x'],
          })
        ).field
      ).toBe('nested');
    });

    it('does not apply the `fields` check to LHS expressions', () => {
      expect(
        parseRAQB(
          wrapRule({
            fieldSrc: 'func',
            field: { func: 'LOWER', args: { str: { value: 'unknownField', valueSrc: 'field' } } },
            operator: 'equal',
            value: ['x'],
          }),
          { fields: [toFullOption({ name: 'other', label: 'Other' })] }
        ).rules
      ).toHaveLength(1);
    });

    it('skips rules where fieldSrc is "func" but field is not a func value', () => {
      expect(
        parseRAQB(
          wrapRule({
            fieldSrc: 'func',
            field: 123 as unknown as string,
            operator: 'equal',
            value: ['x'],
          })
        ).rules
      ).toHaveLength(0);
    });
  });

  describe('relative date/time functions', () => {
    const dateFunc = (
      func: string,
      args: Record<string, { value: unknown; valueSrc?: string }> = {}
    ) => ({ func, args }) as never;

    const relative = (func: string, args?: Record<string, { value: unknown; valueSrc?: string }>) =>
      firstRule(
        wrapRule({
          field: 'created',
          operator: 'less',
          valueSrc: ['func'],
          value: [dateFunc(func, args)],
        })
      );

    it('converts NOW', () => {
      expect(relative('NOW').value).toEqual({
        mode: 'relative',
        anchor: 'now',
        offset: 0,
        unit: 'day',
      });
    });

    it('converts TODAY and START_OF_TODAY', () => {
      const expected = { mode: 'relative', anchor: 'startOfDay', offset: 0, unit: 'day' };
      expect(relative('TODAY').value).toEqual(expected);
      expect(relative('START_OF_TODAY').value).toEqual(expected);
    });

    it('leaves the value source alone', () => {
      expect(relative('NOW').valueSource).toBeUndefined();
    });

    it('converts TRUNCATE_DATETIME', () => {
      expect(relative('TRUNCATE_DATETIME', { dim: { value: 'month' } }).value).toEqual({
        mode: 'relative',
        anchor: 'startOfMonth',
        offset: 0,
        unit: 'day',
      });
    });

    it('converts RELATIVE_DATETIME', () => {
      expect(
        relative('RELATIVE_DATETIME', {
          date: { value: dateFunc('NOW'), valueSrc: 'func' },
          op: { value: 'minus' },
          val: { value: 3 },
          dim: { value: 'day' },
        }).value
      ).toEqual({ mode: 'relative', anchor: 'now', offset: -3, unit: 'day' });
    });

    it('converts RELATIVE_DATE with a truncated anchor', () => {
      expect(
        relative('RELATIVE_DATE', {
          date: {
            value: dateFunc('TRUNCATE_DATETIME', { dim: { value: 'year' } }),
            valueSrc: 'func',
          },
          op: { value: 'plus' },
          val: { value: '2' },
          dim: { value: 'week' },
        }).value
      ).toEqual({ mode: 'relative', anchor: 'startOfYear', offset: 2, unit: 'week' });
    });

    it('defaults a missing `date` argument to NOW', () => {
      expect(
        relative('RELATIVE_DATETIME', {
          op: { value: 'plus' },
          val: { value: 1 },
          dim: { value: 'hour' },
        }).value
      ).toEqual({ mode: 'relative', anchor: 'now', offset: 1, unit: 'hour' });
    });

    it('converts both operands of a `between` rule', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'created',
            operator: 'between',
            valueSrc: ['func', 'func'],
            value: [
              dateFunc('RELATIVE_DATETIME', {
                op: { value: 'minus' },
                val: { value: 7 },
                dim: { value: 'day' },
              }),
              dateFunc('NOW'),
            ],
          })
        ).value
      ).toEqual([
        { mode: 'relative', anchor: 'now', offset: -7, unit: 'day' },
        { mode: 'relative', anchor: 'now', offset: 0, unit: 'day' },
      ]);
    });

    it('skips `between` rules with mismatched operand value sources', () => {
      const unsupported: RAQBUnsupportedInfo[] = [];
      expect(
        parseRAQB(
          wrapRule({
            field: 'created',
            operator: 'between',
            valueSrc: ['func', 'value'],
            value: [dateFunc('LOWER', { str: { value: 'x' } }), '2024-01-01'],
          }),
          { onUnsupported: info => unsupported.push(info) }
        ).rules
      ).toHaveLength(0);
      expect(unsupported[0]).toMatchObject({ reason: 'value_source' });
    });

    it('converts both operands of a `between` rule with expressions', () => {
      const result = firstRule(
        wrapRule({
          field: 'name',
          operator: 'between',
          valueSrc: ['func', 'func'],
          value: [
            dateFunc('LOWER', { str: { value: 'a' } }),
            dateFunc('LOWER', { str: { value: 'z' } }),
          ],
        })
      );
      expect(result.valueSource).toBe('expression');
      expect(result.value).toHaveLength(2);
    });

    it('falls back to an expression for unrepresentable calls', () => {
      // "second" is not an RQB relative date/time unit.
      expect(
        relative('RELATIVE_DATETIME', {
          op: { value: 'minus' },
          val: { value: 30 },
          dim: { value: 'second' },
        }).value
      ).toMatchObject({ kind: 'func', fn: 'RELATIVE_DATETIME' });

      // Truncation applied after an offset can't be represented.
      expect(
        relative('TRUNCATE_DATETIME', {
          date: {
            value: dateFunc('RELATIVE_DATETIME', {
              op: { value: 'minus' },
              val: { value: 3 },
              dim: { value: 'day' },
            }),
            valueSrc: 'func',
          },
          dim: { value: 'month' },
        }).value
      ).toMatchObject({ kind: 'func', fn: 'TRUNCATE_DATETIME' });
    });

    it('rejects invalid arguments', () => {
      expect(relative('TRUNCATE_DATETIME', { dim: { value: 'hour' } }).value).toMatchObject({
        kind: 'func',
      });
      expect(
        relative('RELATIVE_DATETIME', {
          op: { value: 'times' },
          val: { value: 1 },
          dim: { value: 'day' },
        }).value
      ).toMatchObject({ kind: 'func' });
      expect(
        relative('RELATIVE_DATETIME', {
          op: { value: 'plus' },
          val: { value: 'x' },
          dim: { value: 'day' },
        }).value
      ).toMatchObject({ kind: 'func' });
      expect(
        relative('RELATIVE_DATETIME', {
          date: { value: 'not-a-func', valueSrc: 'value' },
          op: { value: 'plus' },
          val: { value: 1 },
          dim: { value: 'day' },
        }).value
      ).toMatchObject({ kind: 'func' });
      expect(
        relative('RELATIVE_DATETIME', {
          date: { value: '2024-01-01' },
          op: { value: 'plus' },
          val: { value: 1 },
          dim: { value: 'day' },
        }).value
      ).toMatchObject({ kind: 'func' });
      expect(
        relative('RELATIVE_DATETIME', {
          date: { value: 'not-a-func', valueSrc: 'func' },
          op: { value: 'plus' },
          val: { value: 1 },
          dim: { value: 'day' },
        }).value
      ).toMatchObject({ kind: 'func' });
      expect(
        relative('RELATIVE_DATETIME', {
          date: { value: null, valueSrc: 'func' },
          op: { value: 'plus' },
          val: { value: 1 },
          dim: { value: 'day' },
        }).value
      ).toEqual({ mode: 'relative', anchor: 'now', offset: 1, unit: 'day' });
    });

    it('converts date functions to expressions when `relativeDateTimes` is false', () => {
      expect(
        firstRule(
          wrapRule({
            field: 'created',
            operator: 'less',
            valueSrc: ['func'],
            value: [dateFunc('NOW')],
          }),
          { relativeDateTimes: false }
        )
      ).toMatchObject({ valueSource: 'expression', value: { kind: 'func', fn: 'NOW' } });
    });
  });
});
