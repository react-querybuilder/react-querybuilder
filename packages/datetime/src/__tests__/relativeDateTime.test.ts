import type { FullField } from 'react-querybuilder';
import { dateLibraryFunctions, fields } from '../dbqueryTestUtils';
import { rqbDateTimeLibraryAPI as apiFnsJS } from '../rqbDateTimeLibraryAPI.jsdate';
import type { RelativeDateTimeValue } from '../types';
import {
  isDateOnlyDatatype,
  isRelativeDateTimeValue,
  materializeRelativeValues,
  resolveRelativeDateTime,
} from '../utils';

const rel = (v: Partial<RelativeDateTimeValue>): RelativeDateTimeValue => ({
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
  ...v,
});

// Wednesday, 2025-06-11 12:30:45.500 (local)
const base = new Date(2025, 5, 11, 12, 30, 45, 500);

describe('isRelativeDateTimeValue', () => {
  test('accepts a valid relative value', () => {
    expect(isRelativeDateTimeValue(rel({ anchor: 'startOfMonth' }))).toBe(true);
  });
  test('rejects non-relative values', () => {
    expect(isRelativeDateTimeValue('2020-01-01')).toBe(false);
    expect(isRelativeDateTimeValue(null)).toBe(false);
    expect(isRelativeDateTimeValue(undefined)).toBe(false);
    expect(isRelativeDateTimeValue(42)).toBe(false);
    expect(isRelativeDateTimeValue({ mode: 'absolute' })).toBe(false);
    expect(isRelativeDateTimeValue({ mode: 'relative' })).toBe(false);
    expect(isRelativeDateTimeValue({ mode: 'relative', anchor: 5 })).toBe(false);
  });
});

describe('isDateOnlyDatatype', () => {
  test('date-only types', () => {
    expect(isDateOnlyDatatype('date')).toBe(true);
    expect(isDateOnlyDatatype('DATE')).toBe(true);
  });
  test('non-date-only types', () => {
    expect(isDateOnlyDatatype('datetime')).toBe(false);
    expect(isDateOnlyDatatype('datetimeoffset')).toBe(false);
    expect(isDateOnlyDatatype('timestamp')).toBe(false);
    expect(isDateOnlyDatatype(undefined)).toBe(false);
  });
});

describe('resolveRelativeDateTime (JS Date adapter, Sunday week start)', () => {
  test('now with no offset returns the base', () => {
    expect(resolveRelativeDateTime(apiFnsJS, rel({}), base).getTime()).toBe(base.getTime());
  });
  test('defaults base to current time when omitted', () => {
    const before = Date.now();
    const result = resolveRelativeDateTime(apiFnsJS, rel({})).getTime();
    const after = Date.now();
    expect(result).toBeGreaterThanOrEqual(before);
    expect(result).toBeLessThanOrEqual(after);
  });

  test.each([
    ['startOfDay', new Date(2025, 5, 11, 0, 0, 0, 0)],
    ['endOfDay', new Date(2025, 5, 11, 23, 59, 59, 999)],
    ['startOfWeek', new Date(2025, 5, 8, 0, 0, 0, 0)],
    ['endOfWeek', new Date(2025, 5, 14, 23, 59, 59, 999)],
    ['startOfMonth', new Date(2025, 5, 1, 0, 0, 0, 0)],
    ['endOfMonth', new Date(2025, 5, 30, 23, 59, 59, 999)],
    ['startOfYear', new Date(2025, 0, 1, 0, 0, 0, 0)],
    ['endOfYear', new Date(2025, 11, 31, 23, 59, 59, 999)],
  ] as const)('anchor %s', (anchor, expected) => {
    expect(resolveRelativeDateTime(apiFnsJS, rel({ anchor }), base).getTime()).toBe(
      expected.getTime()
    );
  });

  test.each([
    [-3, 'month', new Date(2025, 2, 11, 12, 30, 45, 500)],
    [2, 'day', new Date(2025, 5, 13, 12, 30, 45, 500)],
    [1, 'week', new Date(2025, 5, 18, 12, 30, 45, 500)],
    [5, 'hour', new Date(2025, 5, 11, 17, 30, 45, 500)],
    [-15, 'minute', new Date(2025, 5, 11, 12, 15, 45, 500)],
    [1, 'year', new Date(2026, 5, 11, 12, 30, 45, 500)],
  ] as const)('offset %i %s', (offset, unit, expected) => {
    expect(resolveRelativeDateTime(apiFnsJS, rel({ offset, unit }), base).getTime()).toBe(
      expected.getTime()
    );
  });

  test('combines anchor truncation with offset', () => {
    const result = resolveRelativeDateTime(
      apiFnsJS,
      rel({ anchor: 'startOfMonth', offset: -3, unit: 'month' }),
      base
    );
    expect(result.getTime()).toBe(new Date(2025, 2, 1, 0, 0, 0, 0).getTime());
  });
});

describe('materializeRelativeValues', () => {
  const dateField = fields.find(f => f.name === 'birthdate')! as FullField;
  const tsField = fields.find(f => f.name === 'created_at')! as FullField;
  const ctx = { context: { relativeDateTimeBase: base } };

  test('passes non-relative values through unchanged', () => {
    expect(
      materializeRelativeValues(apiFnsJS, '2020-01-01', { fieldData: dateField, ...ctx })
    ).toBe('2020-01-01');
  });

  test('materializes a date-only field to a date-only string', () => {
    expect(
      materializeRelativeValues(apiFnsJS, rel({ anchor: 'startOfMonth' }), {
        fieldData: dateField,
        ...ctx,
      })
    ).toBe('2025-06-01');
  });

  test('materializes a timestamp field to a full ISO string', () => {
    const result = materializeRelativeValues(apiFnsJS, rel({ anchor: 'startOfDay' }), {
      fieldData: tsField,
      ...ctx,
    });
    expect(result).toBe(new Date(2025, 5, 11, 0, 0, 0, 0).toISOString());
  });

  test('maps over arrays, leaving non-relative entries alone', () => {
    const result = materializeRelativeValues(
      apiFnsJS,
      [rel({ anchor: 'startOfMonth' }), '2020-01-01'],
      { fieldData: dateField, ...ctx }
    );
    expect(result).toEqual(['2025-06-01', '2020-01-01']);
  });
});

describe('adapter startOf / endOf / add', () => {
  for (const [libName, apiFns] of dateLibraryFunctions) {
    describe(libName, () => {
      test('startOf day/month/year', () => {
        expect(apiFns.startOf(base, 'day').getTime()).toBe(new Date(2025, 5, 11).getTime());
        expect(apiFns.startOf(base, 'month').getTime()).toBe(new Date(2025, 5, 1).getTime());
        expect(apiFns.startOf(base, 'year').getTime()).toBe(new Date(2025, 0, 1).getTime());
      });

      test('endOf month/year fall on the last day', () => {
        const em = apiFns.endOf(base, 'month');
        expect([em.getFullYear(), em.getMonth(), em.getDate()]).toEqual([2025, 5, 30]);
        const ey = apiFns.endOf(base, 'year');
        expect([ey.getFullYear(), ey.getMonth(), ey.getDate()]).toEqual([2025, 11, 31]);
      });

      test('startOf/endOf week bound a 7-day range containing the base', () => {
        const start = apiFns.startOf(base, 'week');
        const end = apiFns.endOf(base, 'week');
        expect(apiFns.isAfter(base, start) || apiFns.isSame(base, start)).toBe(true);
        expect(apiFns.isBefore(base, end) || apiFns.isSame(base, end)).toBe(true);
        const days = Math.floor((end.getTime() - start.getTime()) / 86_400_000);
        expect(days).toBe(6);
      });

      test('add across units', () => {
        expect(apiFns.add(base, -3, 'month').getTime()).toBe(
          new Date(2025, 2, 11, 12, 30, 45, 500).getTime()
        );
        expect(apiFns.add(base, 2, 'day').getTime()).toBe(
          new Date(2025, 5, 13, 12, 30, 45, 500).getTime()
        );
        expect(apiFns.add(base, 1, 'week').getTime()).toBe(
          new Date(2025, 5, 18, 12, 30, 45, 500).getTime()
        );
        expect(apiFns.add(base, 5, 'hour').getTime()).toBe(
          new Date(2025, 5, 11, 17, 30, 45, 500).getTime()
        );
        expect(apiFns.add(base, -15, 'minute').getTime()).toBe(
          new Date(2025, 5, 11, 12, 15, 45, 500).getTime()
        );
        expect(apiFns.add(base, 1, 'year').getTime()).toBe(
          new Date(2026, 5, 11, 12, 30, 45, 500).getTime()
        );
      });
    });
  }
});
