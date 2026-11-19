import { defaultOperators } from '../defaults';
import type { FullField, FullOperator, OptionGroup } from '../types';
import { warnedFields } from './datatypeInternals';
import {
  defaultDatatypeOperatorLabels,
  defaultInferOperatorsMap,
  getOperatorsByDatatype,
  inferOperators,
} from './inferOperators';
import { toFullOption } from './optGroupUtils';

const f = (props: Partial<FullField>): FullField =>
  toFullOption({ name: 'f', label: 'F', ...props } as FullField);

const names = (ops: unknown) =>
  (ops as (FullOperator | string)[]).map(o => (typeof o === 'string' ? o : o.name));

describe('inferOperators', () => {
  it('returns operators unchanged without hints', () => {
    expect(inferOperators(f({}))).toBe(defaultOperators);
    const ops = [{ name: 'x', label: 'X' }];
    expect(inferOperators(f({}), { operators: ops })).toBe(ops);
  });

  it.each([
    ['string', [...defaultInferOperatorsMap.string!, 'null', 'notNull']],
    ['int', [...defaultInferOperatorsMap.number!, 'null', 'notNull']],
    ['boolean', ['=', '!=', 'null', 'notNull']],
    ['enum', ['=', '!=', 'null', 'notNull', 'in', 'notIn']],
  ])('filters for %s', (datatype, expected) => {
    expect(new Set(names(inferOperators(f({ datatype }))))).toEqual(new Set(expected));
  });

  it('preserves input order', () => {
    expect(names(inferOperators(f({ datatype: 'boolean' })))).toEqual([
      '=',
      '!=',
      'null',
      'notNull',
    ]);
  });

  it('does not filter array/object/unknown', () => {
    for (const datatype of ['array', 'json', 'unknown', 'string|json']) {
      expect(inferOperators(f({ datatype }))).toEqual(defaultOperators);
      // incl. multiselect
      expect(inferOperators(f({ datatype, valueEditorType: 'multiselect' }))).toEqual(
        defaultOperators
      );
    }
    expect(inferOperators(f({ datatype: 'text[]', valueEditorType: 'multiselect' }))).toEqual(
      defaultOperators
    );
  });

  it('ignores non-string datatypes', () => {
    expect(inferOperators(f({ datatype: 1 }))).toBe(defaultOperators);
    expect(inferOperators(f({ datatype: { sql: 'int' } }))).toBe(defaultOperators);
  });

  it('unions multi-type categories', () => {
    const result = new Set(names(inferOperators(f({ datatype: 'string|boolean' }))));
    expect(result.has('contains')).toBe(true);
    expect(result.has('<')).toBe(false);
  });

  it('handles custom operators', () => {
    const operators = [...defaultOperators, { name: 'isEmpty', label: 'is empty' }];
    expect(names(inferOperators(f({ datatype: 'boolean' }), { operators }))).toContain('isEmpty');
    expect(
      names(inferOperators(f({ datatype: 'boolean' }), { operators, dropUnknownOperators: true }))
    ).not.toContain('isEmpty');
  });

  it('handles string operators and value-only options', () => {
    expect(
      inferOperators(f({ datatype: 'boolean' }), {
        operators: ['=', '<', { value: '!=', label: '!=' }] as unknown as FullOperator[],
      })
    ).toEqual(['=', { value: '!=', label: '!=' }]);
  });

  it('applies custom map', () => {
    expect(names(inferOperators(f({ datatype: 'boolean' }), { map: { boolean: ['='] } }))).toEqual([
      '=',
      'null',
      'notNull',
    ]);
    expect(
      names(inferOperators(f({ datatype: 'json' }), { map: { object: ['contains'] } }))
    ).toEqual(['contains', 'null', 'notNull']);
  });

  it('applies datatypeMap', () => {
    expect(
      names(inferOperators(f({ datatype: 'geo' }), { datatypeMap: { geo: 'boolean' } }))
    ).toEqual(['=', '!=', 'null', 'notNull']);
  });

  it('restricts enum multiselect to in/notIn', () => {
    expect(names(inferOperators(f({ datatype: 'enum', valueEditorType: 'multiselect' })))).toEqual([
      'null',
      'notNull',
      'in',
      'notIn',
    ]);
    expect(
      names(inferOperators(f({ datatype: 'varchar(100)', valueEditorType: 'multiselect' })))
    ).toEqual(['null', 'notNull', 'in', 'notIn']);
    for (const datatype of ['boolean', 'int']) {
      expect(names(inferOperators(f({ datatype, valueEditorType: 'multiselect' })))).toEqual([
        'null',
        'notNull',
        'in',
        'notIn',
      ]);
    }
    expect(
      names(
        inferOperators(f({ datatype: 'boolean', valueEditorType: 'multiselect' }), {
          map: { boolean: ['=', 'in'] },
        })
      )
    ).toEqual(['null', 'notNull', 'in']);
    expect(names(inferOperators(f({ valueEditorType: 'multiselect' })))).toEqual([
      'null',
      'notNull',
      'in',
      'notIn',
    ]);
  });

  it('preserves option groups', () => {
    const operators: OptionGroup<FullOperator>[] = [
      { label: 'Eq', options: defaultOperators.slice(0, 2) },
      { label: 'Text', options: defaultOperators.slice(6, 12) },
      { label: 'Null', options: defaultOperators.slice(12, 14) },
    ];
    const result = inferOperators(f({ datatype: 'boolean' }), { operators }) as OptionGroup[];
    expect(result.map(og => og.label)).toEqual(['Eq', 'Null']);
  });

  it('applies labels', () => {
    const byName = (ops: unknown) =>
      Object.fromEntries((ops as FullOperator[]).map(o => [o.name, o.label]));
    const date = byName(inferOperators(f({ datatype: 'date' }), { labels: true }));
    expect(date['<']).toBe('before');
    expect(date['>=']).toBe('on or after');
    expect(date['=']).toBe('=');
    expect(byName(inferOperators(f({ datatype: 'timestamp' }), { labels: true }))['>']).toBe(
      'after'
    );
    expect(byName(inferOperators(f({ datatype: 'boolean' }), { labels: true }))['!=']).toBe(
      'is not'
    );
    // family fallback
    expect(
      byName(
        inferOperators(f({ datatype: 'bigint' }), { labels: { number: { '<': 'less than' } } })
      )['<']
    ).toBe('less than');
    // explicit labels win
    expect(
      byName(
        inferOperators(f({ datatype: 'date' }), {
          labels: true,
          operators: [{ name: '<', value: '<', label: 'earlier than' }],
        })
      )['<']
    ).toBe('earlier than');
    // custom ops untouched
    expect(
      inferOperators(f({ datatype: 'date' }), {
        labels: { date: { custom: 'C' } },
        operators: [{ name: 'custom', value: 'custom', label: 'custom' }],
      })
    ).toEqual([{ name: 'custom', value: 'custom', label: 'custom' }]);
    // string ops
    expect(
      inferOperators(f({ datatype: 'date' }), {
        labels: true,
        operators: ['<', '='] as unknown as FullOperator[],
      })
    ).toEqual([{ name: '<', value: '<', label: 'before' }, '=']);
    expect(
      inferOperators(f({ datatype: 'date' }), {
        labels: { date: { between: 'from' } },
        operators: ['between'] as unknown as FullOperator[],
      })
    ).toEqual([{ name: 'between', value: 'between', label: 'from' }]);
    // multi-type → original
    expect(byName(inferOperators(f({ datatype: 'date|string' }), { labels: true }))['<']).toBe('<');
    expect(defaultDatatypeOperatorLabels.time?.['<=']).toBe('on or before');
  });

  it('returns stable relabeled operators', () => {
    const a = inferOperators(f({ datatype: 'date' }), { labels: true }) as FullOperator[];
    const b = inferOperators(f({ datatype: 'date' }), { labels: true }) as FullOperator[];
    expect(a.find(o => o.name === '<')).toBe(b.find(o => o.name === '<'));
    const strOps = ['<'] as unknown as FullOperator[];
    expect(inferOperators(f({ datatype: 'date' }), { labels: true, operators: strOps })[0]).toBe(
      inferOperators(f({ datatype: 'date' }), { labels: true, operators: strOps })[0]
    );
    // different label → different object
    expect(
      inferOperators(f({ datatype: 'date' }), {
        labels: { date: { '<': 'earlier' } },
        operators: strOps,
      })[0]
    ).toMatchObject({ label: 'earlier' });
  });

  it('does not mutate inputs', () => {
    const operators = defaultOperators.map(o => ({ ...o }));
    const snapshot = structuredClone(operators);
    inferOperators(f({ datatype: 'date' }), { operators, labels: true });
    expect(operators).toEqual(snapshot);
  });

  describe('warn', () => {
    beforeEach(() => warnedFields.clear());
    afterEach(() => vi.restoreAllMocks());

    it('warns once for incompatible field.operators', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const fd = f({ name: 'age', datatype: 'number', operators: ['=', 'contains', 'beginsWith'] });
      inferOperators(fd, { warn: true });
      inferOperators(fd, { warn: true });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toBe(
        '[RQB] Field "age" (datatype "number") lists operators incompatible w/ datatype: contains, beginsWith'
      );
    });

    it('handles option group field.operators', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      inferOperators(
        f({
          datatype: 'boolean',
          operators: [{ label: 'G', options: [{ name: '<', label: '<' }] }],
        }),
        { warn: true }
      );
      expect(spy).toHaveBeenCalledTimes(1);
    });

    it('does not warn for compatible or unset', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      inferOperators(f({ datatype: 'number', operators: ['=', 'isEmpty'] }), { warn: true });
      inferOperators(f({ datatype: 'number' }), { warn: true });
      inferOperators(f({ datatype: 'number', operators: ['contains'] }));
      inferOperators(f({ datatype: 'json', operators: ['contains'] }), { warn: true });
      expect(spy).not.toHaveBeenCalled();
    });

    it('warns when only null ops remain', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      inferOperators(f({ valueEditorType: 'multiselect' }), { warn: true, map: { enum: ['='] } });
      inferOperators(f({ valueEditorType: 'multiselect' }), { warn: true, map: { enum: ['='] } });
      expect(spy).toHaveBeenCalledTimes(1);
      expect(spy.mock.calls[0][0]).toMatch(/no inferred operators besides null/);
    });

    it('uses category in warning when datatype absent', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      inferOperators(f({ valueEditorType: 'checkbox', operators: ['<'] }), { warn: true });
      expect(spy.mock.calls[0][0]).toMatch(/datatype "boolean"/);
      inferOperators({ name: 'n', label: 'N', datatype: 'bool', operators: ['<'] } as FullField, {
        warn: true,
      });
      expect(spy.mock.calls[1][0]).toMatch(/Field "n"/);
    });

    it('does not warn in production', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const env = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      inferOperators(f({ datatype: 'number', operators: ['contains'] }), { warn: true });
      process.env.NODE_ENV = env;
      expect(spy).not.toHaveBeenCalled();
    });

    it('does not warn without process', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      vi.stubGlobal('process', undefined);
      try {
        inferOperators(f({ name: 'np', datatype: 'number', operators: ['contains'] }), {
          warn: true,
        });
      } finally {
        vi.unstubAllGlobals();
      }
      expect(spy).not.toHaveBeenCalled();
    });

    it('uses category in warning when datatype is not a string', () => {
      const spy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      inferOperators(f({ name: 'ns', datatype: 1, inputType: 'number', operators: ['contains'] }), {
        warn: true,
      });
      expect(spy.mock.calls.at(-1)?.[0]).toMatch(/datatype "number"/);
    });
  });
});

describe('getOperatorsByDatatype', () => {
  it('returns a getOperators function', () => {
    const getOperators = getOperatorsByDatatype({ map: { boolean: ['='] } });
    expect(names(getOperators('f', { fieldData: f({ datatype: 'bool' }) }))).toEqual([
      '=',
      'null',
      'notNull',
    ]);
    expect(getOperatorsByDatatype()('f', { fieldData: f({}) })).toBe(defaultOperators);
  });
});
