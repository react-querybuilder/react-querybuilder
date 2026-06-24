import type { FullField, RuleGroupType } from '@react-querybuilder/core';
import { formatQuery } from '@react-querybuilder/core';
import { add_operation, apply } from 'json-logic-js';
import { datetimeRuleProcessorJsonLogic } from '../datetimeRuleProcessorJsonLogic';
import { getDatetimeJsonLogicOperations } from '../getDatetimeJsonLogicOperations';
import { getDatetimeRuleProcessorJSONata } from '../getDatetimeRuleProcessorJSONata';
import {
  datetimeRuleProcessorCEL,
  datetimeRuleProcessorCypher,
  datetimeRuleProcessorGremlin,
  datetimeRuleProcessorLDAP,
  datetimeRuleProcessorMongoDB,
  datetimeRuleProcessorMongoDBQuery,
  datetimeRuleProcessorNL,
  datetimeRuleProcessorParameterized,
  datetimeRuleProcessorPrisma,
  datetimeRuleProcessorSPARQL,
  datetimeRuleProcessorSpEL,
  datetimeRuleProcessorSQL,
  datetimeValueProcessorANSI,
} from '../index.dayjs';
import { rqbDateTimeLibraryAPI as apiFns } from '../rqbDateTimeLibraryAPI.dayjs';
import type { RelativeDateTimeValue } from '../types';
import { materializeRelativeValues, resolveDatetimeOperator } from '../utils';

const base = new Date(2025, 5, 11, 12, 30, 45, 500);
const ctxObj = { relativeDateTimeBase: base };

const r = (
  anchor: RelativeDateTimeValue['anchor'],
  offset = 0,
  unit: RelativeDateTimeValue['unit'] = 'day'
): RelativeDateTimeValue => ({ mode: 'relative', anchor, offset, unit });

const fields = [
  { name: 'd', label: 'd', datatype: 'date' },
  { name: 'ts', label: 'ts', datatype: 'timestamp' },
];
const fieldData = (name: string) => fields.find(f => f.name === name)! as unknown as FullField;

const q = (rules: RuleGroupType['rules']): RuleGroupType => ({ combinator: 'and', rules });

/** Replace each rule's relative value(s) with the concrete materialized equivalent. */
const toAbsolute = (query: RuleGroupType, b: Date = base): RuleGroupType => ({
  ...query,
  rules: query.rules.map(rule =>
    'field' in rule
      ? {
          ...rule,
          value: materializeRelativeValues(apiFns, rule.value, {
            fieldData: fieldData(rule.field),
            context: { relativeDateTimeBase: b },
          }),
        }
      : rule
  ),
});

const relativeCases: Record<string, RuleGroupType> = {
  'gt date': q([{ field: 'd', operator: '>', value: r('startOfMonth', -3, 'month') }]),
  'eq ts': q([{ field: 'ts', operator: '=', value: r('now') }]),
  'lte ts': q([{ field: 'ts', operator: '<=', value: r('endOfDay') }]),
  between: q([{ field: 'd', operator: 'between', value: [r('startOfYear'), r('endOfYear')] }]),
  notBetween: q([
    { field: 'd', operator: 'notBetween', value: [r('startOfYear'), r('endOfYear')] },
  ]),
  in: q([{ field: 'd', operator: 'in', value: [r('startOfMonth'), '2020-01-01'] }]),
  notIn: q([{ field: 'd', operator: 'notIn', value: [r('startOfMonth')] }]),
};

// Formats that always materialize relative values: their relative output must equal the
// output of the equivalent absolute (materialized) query.
const materializingFormats = {
  cel: { format: 'cel' as const, ruleProcessor: datetimeRuleProcessorCEL },
  mongodb_query: {
    format: 'mongodb_query' as const,
    ruleProcessor: datetimeRuleProcessorMongoDBQuery,
  },
  natural_language: { format: 'natural_language' as const, ruleProcessor: datetimeRuleProcessorNL },
  cypher: { format: 'cypher' as const, ruleProcessor: datetimeRuleProcessorCypher },
  sparql: { format: 'sparql' as const, ruleProcessor: datetimeRuleProcessorSPARQL },
  jsonata: { format: 'jsonata' as const, ruleProcessor: getDatetimeRuleProcessorJSONata(apiFns) },
  parameterized: {
    format: 'parameterized' as const,
    ruleProcessor: datetimeRuleProcessorParameterized,
  },
  spel: { format: 'spel' as const, ruleProcessor: datetimeRuleProcessorSpEL },
  ldap: { format: 'ldap' as const, ruleProcessor: datetimeRuleProcessorLDAP },
  gremlin: { format: 'gremlin' as const, ruleProcessor: datetimeRuleProcessorGremlin },
  prisma: { format: 'prisma' as const, ruleProcessor: datetimeRuleProcessorPrisma },
  mongodb: { format: 'mongodb' as const, ruleProcessor: datetimeRuleProcessorMongoDB },
};

for (const [formatName, cfg] of Object.entries(materializingFormats)) {
  describe(formatName, () => {
    for (const [caseName, query] of Object.entries(relativeCases)) {
      test(`${caseName} matches materialized absolute`, () => {
        const opts = { fields, context: ctxObj, ...cfg };
        const relativeOut = formatQuery(query, opts);
        const absoluteOut = formatQuery(toAbsolute(query), opts);
        expect(relativeOut).toEqual(absoluteOut);
        expect(relativeOut).toBeTruthy();
      });
    }
  });
}

describe('SQL', () => {
  const liveOpts = {
    format: 'sql' as const,
    preset: 'ansi' as const,
    fields,
    ruleProcessor: datetimeRuleProcessorSQL,
    valueProcessor: datetimeValueProcessorANSI,
    context: ctxObj,
  };

  test('emits live symbolic expressions by default', () => {
    expect(formatQuery(relativeCases['gt date'], liveOpts)).toBe(
      `(d > cast(date_trunc('month', current_date) - interval '3 months' as date))`
    );
    expect(formatQuery(relativeCases['eq ts'], liveOpts)).toBe('(ts = current_timestamp)');
    expect(formatQuery(relativeCases.between, liveOpts)).toBe(
      `(d between cast(date_trunc('year', current_date) as date) and ` +
        `cast(date_trunc('year', current_date) + interval '1 year' - interval '1 day' as date))`
    );
    expect(formatQuery(relativeCases.in, liveOpts)).toBe(
      `(d in (cast(date_trunc('month', current_date) as date), '2020-01-01'))`
    );
    expect(formatQuery(relativeCases.notIn, liveOpts)).toBe(
      `(d not in (cast(date_trunc('month', current_date) as date)))`
    );
    expect(formatQuery(relativeCases.notBetween, liveOpts)).toBe(
      `(d not between cast(date_trunc('year', current_date) as date) and ` +
        `cast(date_trunc('year', current_date) + interval '1 year' - interval '1 day' as date))`
    );
  });

  test('materializes when context.materializeRelativeDateTime is set', () => {
    const ansiOpts = {
      format: 'sql' as const,
      preset: 'ansi' as const,
      fields,
      ruleProcessor: datetimeRuleProcessorSQL,
      valueProcessor: datetimeValueProcessorANSI,
    };
    for (const query of Object.values(relativeCases)) {
      const matl = formatQuery(query, {
        ...ansiOpts,
        context: { ...ctxObj, materializeRelativeDateTime: true },
      });
      const absolute = formatQuery(toAbsolute(query), { ...ansiOpts, context: ctxObj });
      expect(matl).toBe(absolute);
    }
  });

  test('rule processor returns empty string for an unorderable between operand', () => {
    const result = datetimeRuleProcessorSQL(
      { field: 'd', operator: 'between', value: [r('startOfYear'), 'not-a-date'] },
      { preset: 'ansi', fieldData: fieldData('d'), context: ctxObj }
    );
    expect(result).toBe('');
  });
});

describe('jsonlogic', () => {
  const records = [{ d: '2025-06-01' }, { d: '2020-01-01' }, { d: '2030-01-01' }];

  beforeAll(() => {
    for (const [op, func] of Object.entries(getDatetimeJsonLogicOperations(apiFns))) {
      add_operation(op, func);
    }
  });

  test('emits a live dateRelative op', () => {
    const jl = formatQuery(relativeCases['gt date'], {
      format: 'jsonlogic',
      fields,
      ruleProcessor: datetimeRuleProcessorJsonLogic,
      context: ctxObj,
    });
    expect(jl).toEqual({
      and: [{ dateAfter: [{ var: 'd' }, { dateRelative: ['startOfMonth', -3, 'month', true] }] }],
    });
  });

  test('dateRelative resolves at evaluation time (date-only and full)', () => {
    const ops = getDatetimeJsonLogicOperations(apiFns);
    // Pin "now" is not available at eval time; just assert shape/precision.
    expect(ops.dateRelative('startOfYear', 0, 'day', true)).toMatch(/^\d{4}-01-01$/);
    expect(ops.dateRelative('startOfYear', 0, 'day', false)).toMatch(/T/);
  });

  test.each(['in', 'notIn', 'between', 'notBetween'] as const)(
    'evaluates %s consistently with the materialized (live) query',
    operator => {
      const query = relativeCases[operator];
      const relJL = formatQuery(query, {
        format: 'jsonlogic',
        fields,
        ruleProcessor: datetimeRuleProcessorJsonLogic,
        context: ctxObj,
      });
      // Relative jsonlogic is "live" (resolves at eval time), so compare against an
      // absolute query materialized at the current time rather than the pinned base.
      const absJL = formatQuery(toAbsolute(query, new Date()), {
        format: 'jsonlogic',
        fields,
        ruleProcessor: datetimeRuleProcessorJsonLogic,
        context: ctxObj,
      });
      for (const rec of records) {
        expect(apply(relJL, rec)).toBe(apply(absJL, rec));
      }
    }
  );

  test('comparison operations evaluate correctly', () => {
    const ops = getDatetimeJsonLogicOperations(apiFns);
    const lo = '2020-01-01';
    const mid = '2025-06-01';
    const hi = '2030-01-01';
    expect(ops.dateAfter(hi, lo)).toBe(true);
    expect(ops.dateAfter(lo, hi)).toBe(false);
    expect(ops.dateBefore(lo, hi)).toBe(true);
    expect(ops.dateBefore(hi, lo)).toBe(false);
    expect(ops.dateOn(mid, mid)).toBe(true);
    expect(ops.dateNotOn(mid, lo)).toBe(true);
    expect(ops.dateNotOn(mid, mid)).toBe(false);
    expect(ops.dateOnOrAfter(mid, mid)).toBe(true);
    expect(ops.dateOnOrAfter(lo, mid)).toBe(false);
    expect(ops.dateOnOrBefore(mid, mid)).toBe(true);
    expect(ops.dateOnOrBefore(hi, mid)).toBe(false);
    expect(ops.dateBetween(lo, mid, hi)).toBe(true);
    // dateBetween clauses: same-as-lower, same-as-upper, strictly-inside, reversed bounds
    expect(ops.dateBetween(lo, lo, hi)).toBe(true);
    expect(ops.dateBetween(lo, hi, hi)).toBe(true);
    expect(ops.dateBetween(hi, mid, lo)).toBe(true);
    expect(ops.dateBetween(lo, hi, mid)).toBe(false);
    // dateNotBetween clauses: equal bounds short-circuit, normal order (below/above),
    // reversed bounds (below/above), and inside (false)
    expect(ops.dateNotBetween(mid, mid, hi)).toBe(false);
    expect(ops.dateNotBetween(lo, mid, mid)).toBe(false);
    expect(ops.dateNotBetween(mid, lo, hi)).toBe(true);
    expect(ops.dateNotBetween(lo, hi, mid)).toBe(true);
    expect(ops.dateNotBetween(hi, lo, mid)).toBe(true);
    expect(ops.dateNotBetween(mid, hi, lo)).toBe(true);
    expect(ops.dateNotBetween(lo, mid, hi)).toBe(false);
    expect(ops.dateIn(mid, [lo, mid])).toBe(true);
    expect(ops.dateNotIn(mid, [lo, hi])).toBe(true);
  });

  test('between returns false with fewer than two operands', () => {
    const jl = formatQuery(q([{ field: 'd', operator: 'between', value: [r('startOfYear')] }]), {
      format: 'jsonlogic',
      fields,
      ruleProcessor: datetimeRuleProcessorJsonLogic,
      context: ctxObj,
    });
    expect(jl).toBe(false);
  });
});

describe('relativeOperatorMap (operator-driven export)', () => {
  test('resolveDatetimeOperator maps configured operators and passes others through', () => {
    const opts = { context: { relativeOperatorMap: { relativeEq: '=' } } };
    expect(resolveDatetimeOperator({ field: 'd', operator: 'relativeEq', value: '' }, opts)).toBe(
      '='
    );
    expect(resolveDatetimeOperator({ field: 'd', operator: '<', value: '' }, opts)).toBe('<');
    // No context/map -> operator unchanged
    expect(resolveDatetimeOperator({ field: 'd', operator: 'relativeEq', value: '' }, {})).toBe(
      'relativeEq'
    );
  });

  const relEqQuery = q([{ field: 'ts', operator: 'relativeEq', value: r('now') }]);
  const eqQuery = q([{ field: 'ts', operator: '=', value: r('now') }]);
  const map = { relativeEq: '=' };

  test('SQL exports a mapped operator as its comparison', () => {
    const opts = {
      format: 'sql' as const,
      preset: 'ansi' as const,
      fields,
      ruleProcessor: datetimeRuleProcessorSQL,
      valueProcessor: datetimeValueProcessorANSI,
    };
    expect(
      formatQuery(relEqQuery, { ...opts, context: { ...ctxObj, relativeOperatorMap: map } })
    ).toBe(formatQuery(eqQuery, { ...opts, context: ctxObj }));
  });

  test('jsonlogic exports a mapped operator as its comparison', () => {
    const opts = {
      format: 'jsonlogic' as const,
      fields,
      ruleProcessor: datetimeRuleProcessorJsonLogic,
    };
    expect(
      formatQuery(relEqQuery, { ...opts, context: { ...ctxObj, relativeOperatorMap: map } })
    ).toEqual(formatQuery(eqQuery, { ...opts, context: ctxObj }));
  });

  test('natural_language renders the mapped operator text', () => {
    const opts = {
      format: 'natural_language' as const,
      fields,
      ruleProcessor: datetimeRuleProcessorNL,
    };
    expect(
      formatQuery(relEqQuery, { ...opts, context: { ...ctxObj, relativeOperatorMap: map } })
    ).toBe(formatQuery(eqQuery, { ...opts, context: ctxObj }));
  });
});
