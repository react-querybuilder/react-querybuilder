import { defaultOperators } from '../../../defaults';
import type { ExportFormat, FormatQueryOptions, RuleGroupType, RuleType } from '../../../types';
import { formatCapabilities, getUnsupportedRuleFeature } from '../formatCapabilities';
import { formatQuery } from '../formatQuery';
import { negateOperator, negateRule, negateRuleGroup } from '../negation';
import { coerceBoolean, coerceNumber, isDateInputType, toRFC3339 } from '../vectorValueUtils';

describe('negateOperator', () => {
  it.each([
    ['=', '!='],
    ['<', '>='],
    ['>', '<='],
    ['in', 'notIn'],
    ['between', 'notBetween'],
    ['null', 'notNull'],
    ['contains', 'doesNotContain'],
    ['beginsWith', 'doesNotBeginWith'],
    ['endsWith', 'doesNotEndWith'],
  ])('%s ↔ %s', (a, b) => {
    expect(negateOperator(a)).toBe(b);
    expect(negateOperator(b)).toBe(a);
    expect(negateOperator(a.toUpperCase())).toBe(b);
  });

  it('covers every default operator', () => {
    for (const { name } of defaultOperators) {
      expect(negateOperator(negateOperator(name)!)).toBe(name);
    }
  });

  it('returns undefined for unknown', () => {
    expect(negateOperator('foo')).toBeUndefined();
  });
});

describe('negateRule', () => {
  const sub: RuleGroupType = { combinator: 'and', rules: [] };
  it('negates operators and some/none match modes', () => {
    expect(negateRule({ field: 'f', operator: '=', value: 1 })).toEqual({
      field: 'f',
      operator: '!=',
      value: 1,
    });
    expect(
      negateRule({ field: 'f', operator: '=', value: sub, match: { mode: 'Some' as 'some' } })
    ).toEqual({ field: 'f', operator: '=', value: sub, match: { mode: 'none' } });
    expect(negateRule({ field: 'f', operator: '=', value: sub, match: { mode: 'none' } })).toEqual({
      field: 'f',
      operator: '=',
      value: sub,
      match: { mode: 'some' },
    });
  });
  it('returns undefined when not negatable', () => {
    expect(negateRule({ field: 'f', operator: 'foo', value: 1 })).toBeUndefined();
    expect(
      negateRule({ field: 'f', operator: '=', value: sub, match: { mode: 'all' } })
    ).toBeUndefined();
  });
});

describe('negateRuleGroup', () => {
  const rg: RuleGroupType = {
    id: 'root',
    combinator: 'and',
    rules: [
      { field: 'a', operator: '=', value: 1 },
      { combinator: 'or', rules: [{ field: 'b', operator: 'in', value: [1] }] },
      { combinator: 'or', not: true, rules: [{ field: 'c', operator: 'null', value: null }] },
    ],
  };

  it('applies De Morgan', () => {
    expect(negateRuleGroup({ ...rg, not: true })).toEqual({
      id: 'root',
      combinator: 'or',
      rules: [
        { field: 'a', operator: '!=', value: 1 },
        { combinator: 'or', not: true, rules: [{ field: 'b', operator: 'in', value: [1] }] },
        { combinator: 'or', rules: [{ field: 'c', operator: 'null', value: null }] },
      ],
    });
  });

  it('double negation is identity', () => {
    expect(negateRuleGroup(negateRuleGroup(rg))).toEqual(rg);
    expect(negateRuleGroup(negateRuleGroup({ ...rg, combinator: 'or' }))).toEqual({
      ...rg,
      combinator: 'or',
    });
  });

  it('drops non-negatable rules', () => {
    expect(
      negateRuleGroup({ combinator: 'and', rules: [{ field: 'a', operator: 'foo', value: 1 }] })
    ).toEqual({ combinator: 'or', rules: [] });
  });

  it('empties xor groups', () => {
    expect(
      negateRuleGroup({ combinator: 'xor', rules: [{ field: 'a', operator: '=', value: 1 }] })
    ).toEqual({ combinator: 'xor', rules: [] });
  });
});

describe('value helpers', () => {
  it('coerceNumber', () => {
    expect(coerceNumber(1)).toBe(1);
    expect(coerceNumber(Number.NaN)).toBeUndefined();
    expect(coerceNumber(2n)).toBe(2);
    expect(coerceNumber(' 1.5 ')).toBe(1.5);
    expect(coerceNumber('1.5', false)).toBeUndefined();
    expect(coerceNumber('abc')).toBeUndefined();
    expect(coerceNumber(true)).toBeUndefined();
  });

  it('isDateInputType', () => {
    expect(isDateInputType('date')).toBe(true);
    expect(isDateInputType('datetime-local')).toBe(true);
    expect(isDateInputType('time')).toBe(false);
    expect(isDateInputType()).toBe(false);
  });

  it('toRFC3339', () => {
    expect(toRFC3339('2024-01-02')).toBe('2024-01-02T00:00:00Z');
    expect(toRFC3339('2024-01-02T03:04')).toBe('2024-01-02T03:04:00Z');
    expect(toRFC3339('2024-01-02 03:04:05.6')).toBe('2024-01-02T03:04:05.6Z');
    expect(toRFC3339('2024-01-02T03:04:05+02:00')).toBe('2024-01-02T03:04:05+02:00');
    expect(toRFC3339('2024-01-02T03:04:05z')).toBe('2024-01-02T03:04:05Z');
    expect(toRFC3339(new Date(Date.UTC(2024, 0, 2)))).toBe('2024-01-02T00:00:00.000Z');
    expect(toRFC3339(new Date('x'))).toBeUndefined();
    expect(toRFC3339('nope')).toBeUndefined();
    expect(toRFC3339(1)).toBeUndefined();
  });

  it('coerceBoolean', () => {
    expect(coerceBoolean(true)).toBe(true);
    expect(coerceBoolean(' TRUE ')).toBe(true);
    expect(coerceBoolean('false')).toBe(false);
    expect(coerceBoolean('x')).toBeUndefined();
    expect(coerceBoolean(1)).toBeUndefined();
  });
});

describe('formatCapabilities', () => {
  const sampleValues: Record<string, unknown> = {
    between: [1, 2],
    notbetween: [1, 2],
    in: ['a', 'b'],
    notin: ['a', 'b'],
  };
  const objectFormats = new Set<ExportFormat>(['pinecone', 'chroma', 'qdrant', 'weaviate']);
  const isSkipped = (format: ExportFormat, rule: RuleType) => {
    const out = formatQuery({ combinator: 'and', rules: [rule] }, {
      format,
    } as FormatQueryOptions) as unknown;
    return objectFormats.has(format)
      ? Object.keys(out as object).length === 0
      : out === '' || out === undefined;
  };

  for (const [format, caps] of Object.entries(formatCapabilities) as [
    ExportFormat,
    NonNullable<(typeof formatCapabilities)[ExportFormat]>,
  ][]) {
    describe(format, () => {
      it.each(defaultOperators.map(o => o.name))('operator %s consistent', op => {
        const rule: RuleType = {
          field: 'f',
          operator: op,
          value: sampleValues[op.toLowerCase()] ?? '5',
        };
        expect(isSkipped(format, rule)).toBe(!caps.operators.has(op.toLowerCase() as never));
      });

      it.each(defaultOperators.map(o => o.name))('valueSource field %s consistent', op => {
        const lcOp = op.toLowerCase() as never;
        const value = ['between', 'notBetween'].includes(op) ? 'g,h' : 'g';
        const rule: RuleType = { field: 'f', operator: op, value, valueSource: 'field' };
        const fvs = caps.fieldValueSource;
        const fvsOk = typeof fvs === 'boolean' ? fvs : fvs.has(lcOp);
        expect(isSkipped(format, rule)).toBe(!fvsOk || !caps.operators.has(lcOp));
      });

      it.each(['all', 'some', 'none', 'atLeast', 'atMost', 'exactly'] as const)(
        'match mode %s consistent',
        mode => {
          const rule: RuleType = {
            field: 'f',
            operator: '=',
            value: { combinator: 'and', rules: [{ field: 'g', operator: '=', value: 'x' }] },
            match: { mode, threshold: 2 },
          };
          expect(isSkipped(format, rule)).toBe(!caps.matchModes.has(mode.toLowerCase() as never));
        }
      );
    });
  }

  it('getUnsupportedRuleFeature', () => {
    const caps = formatCapabilities.qdrant!;
    expect(getUnsupportedRuleFeature({ field: 'f', operator: '=', value: 1 }, caps)).toBeNull();
    expect(getUnsupportedRuleFeature({ field: 'f', operator: 'beginsWith', value: 1 }, caps)).toBe(
      'operator'
    );
    expect(
      getUnsupportedRuleFeature(
        { field: 'f', operator: '=', value: 'g', valueSource: 'field' },
        caps
      )
    ).toBe('valueSource');
    // Invalid match (non-group value) checked by raw mode
    expect(
      getUnsupportedRuleFeature(
        { field: 'f', operator: '=', value: 1, match: { mode: 'All' as 'all' } },
        caps
      )
    ).toBe('matchMode');
    expect(
      getUnsupportedRuleFeature(
        { field: 'f', operator: '=', value: 1, match: { mode: 'some' } },
        caps
      )
    ).toBeNull();
  });
});

describe('diagnostics format-check', () => {
  const sub: RuleGroupType = {
    combinator: 'and',
    rules: [{ field: 'g', operator: '=', value: 1 }],
  };
  const query: RuleGroupType = {
    combinator: 'and',
    rules: [
      { id: 'r0', field: 'f', operator: 'beginsWith', value: 'x' },
      { id: 'r1', field: 'f', operator: '=', value: 'g', valueSource: 'field' },
      { id: 'r2', field: 'f', operator: '=', value: sub, match: { mode: 'all' } },
      { id: 'r3', field: 'f', operator: '=', value: 'x' },
      { id: 'r4', field: 'f', operator: 'beginsWith', value: 'x', muted: true },
    ],
  };
  const formatChecks = (q: RuleGroupType, opts: FormatQueryOptions = {}) =>
    formatQuery(q, { ...opts, format: 'diagnostics' }).diagnostics.filter(
      d => d.source === 'format-check'
    );

  it('no-op without target or without capabilities entry', () => {
    expect(formatChecks(query)).toEqual([]);
    expect(formatChecks(query, { diagnosticsTargetFormat: 'sql' })).toEqual([]);
  });

  it('reports unsupported features as warnings w/o affecting validity', () => {
    const result = formatQuery(query, { format: 'diagnostics', diagnosticsTargetFormat: 'qdrant' });
    expect(result.diagnostics.filter(d => d.source === 'format-check')).toEqual([
      {
        id: 'r0',
        path: [0],
        code: 'UNSUPPORTED_OPERATOR_FOR_FORMAT',
        message: 'Operator "beginsWith" is not supported by format "qdrant"',
        source: 'format-check',
        severity: 'warning',
      },
      {
        id: 'r1',
        path: [1],
        code: 'UNSUPPORTED_VALUE_SOURCE_FOR_FORMAT',
        message: 'Value source "field" is not supported by format "qdrant"',
        source: 'format-check',
        severity: 'warning',
      },
      {
        id: 'r2',
        path: [2],
        code: 'UNSUPPORTED_MATCH_MODE_FOR_FORMAT',
        message: 'Match mode "all" is not supported by format "qdrant"',
        source: 'format-check',
        severity: 'warning',
      },
    ]);
    const baseline = formatQuery(query, 'diagnostics');
    expect(result.stats).toEqual(baseline.stats);
    expect(result.query).toEqual(baseline.query);
  });

  it('traverses match-mode value groups', () => {
    const nested: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          id: 'm',
          field: 'arr',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            rules: [
              { id: 'n0', field: 'a', operator: 'beginsWith', value: 'x' },
              { id: 'n1', field: 'a', operator: 'beginsWith', value: 'x', muted: true },
              {
                combinator: 'and',
                rules: [{ id: 'n2', field: 'b', operator: '=', value: 'c', valueSource: 'field' }],
              },
              {
                id: 'n3',
                field: 'c',
                operator: '=',
                match: { mode: 'none' },
                value: {
                  combinator: 'and',
                  rules: [{ id: 'n4', field: 'd', operator: 'endsWith', value: 'x' }],
                },
              },
            ],
          },
        },
      ],
    };
    expect(
      formatChecks(nested, { diagnosticsTargetFormat: 'qdrant' }).map(d => [d.id, d.path, d.code])
    ).toEqual([
      ['n0', [0, 0], 'UNSUPPORTED_OPERATOR_FOR_FORMAT'],
      ['n2', [0, 2, 0], 'UNSUPPORTED_VALUE_SOURCE_FOR_FORMAT'],
      ['n4', [0, 3, 0], 'UNSUPPORTED_OPERATOR_FOR_FORMAT'],
    ]);
    const ic = {
      rules: [
        {
          id: 'm',
          field: 'arr',
          operator: '=',
          match: { mode: 'some' },
          value: { rules: [{ id: 'i0', field: 'a', operator: 'beginsWith', value: 'x' }, 'and'] },
        },
      ],
    } as unknown as RuleGroupType;
    expect(formatChecks(ic, { diagnosticsTargetFormat: 'qdrant' }).map(d => d.id)).toEqual(['i0']);
  });

  it('skips muted match-mode value groups', () => {
    const muted: RuleGroupType = {
      combinator: 'and',
      rules: [
        {
          id: 'm',
          field: 'arr',
          operator: '=',
          match: { mode: 'some' },
          value: {
            combinator: 'and',
            muted: true,
            rules: [{ id: 'n0', field: 'a', operator: 'beginsWith', value: 'x' }],
          },
        },
      ],
    };
    expect(formatChecks(muted, { diagnosticsTargetFormat: 'qdrant' })).toEqual([]);
  });

  describe('De Morgan (nativeNot: false)', () => {
    const fake = 'cel' as ExportFormat;
    beforeAll(() => {
      formatCapabilities[fake] = { ...formatCapabilities.qdrant!, nativeNot: false };
    });
    afterAll(() => {
      delete formatCapabilities[fake];
    });

    it('checks negated operators/match modes inside odd `not` depth', () => {
      const negQuery: RuleGroupType = {
        combinator: 'and',
        rules: [
          {
            combinator: 'and',
            not: true,
            rules: [
              { field: 'f', operator: 'doesNotContain', value: 'x' }, // → contains: OK
              { field: 'f', operator: 'beginsWith', value: 'x' }, // → doesNotBeginWith: unsupported
              { field: 'f', operator: 'foo', value: 'x' }, // not negatable
              { field: 'f', operator: '=', value: sub, match: { mode: 'none' } }, // → some: OK
              { field: 'f', operator: '=', value: sub, match: { mode: 'all' } }, // not negatable
              { combinator: 'and', not: true, rules: [{ field: 'f', operator: '>', value: 1 }] },
            ],
          },
        ],
      };
      expect(formatChecks(negQuery, { diagnosticsTargetFormat: fake }).map(d => d.message)).toEqual(
        [
          'Operator "doesNotBeginWith" (negation of "beginsWith") is not supported by format "cel"',
          'Operator "foo" (cannot be negated) is not supported by format "cel"',
          'Match mode "all" (cannot be negated) is not supported by format "cel"',
        ]
      );
    });

    it('omits negation note for value source', () => {
      const negQuery: RuleGroupType = {
        combinator: 'and',
        not: true,
        rules: [{ field: 'f', operator: '=', value: 'g', valueSource: 'field' }],
      };
      expect(formatChecks(negQuery, { diagnosticsTargetFormat: fake }).map(d => d.message)).toEqual(
        ['Value source "field" is not supported by format "cel"']
      );
    });
  });
});
