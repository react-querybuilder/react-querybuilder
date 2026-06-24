import type { SQLPreset } from '@react-querybuilder/core';
import { getRelativeDateTimeSQL } from '../getRelativeDateTimeSQL';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RelativeDateTimeValue } from '../types';

const presets: SQLPreset[] = ['ansi', 'postgresql', 'mysql', 'mssql', 'oracle', 'sqlite'];

const anchors: RelativeDateTimeAnchor[] = [
  'now',
  'startOfDay',
  'endOfDay',
  'startOfWeek',
  'endOfWeek',
  'startOfMonth',
  'endOfMonth',
  'startOfYear',
  'endOfYear',
];

const units: RelativeDateTimeUnit[] = ['minute', 'hour', 'day', 'week', 'month', 'year'];

// date-only granularity vs timestamp granularity (exercises both `asDate` branches
// per dialect's `isDateGranularity` logic).
const datatypes = ['date', 'timestamp', 'datetime', 'smalldatetime'];

const rel = (v: Partial<RelativeDateTimeValue>): RelativeDateTimeValue => ({
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
  ...v,
});

// Full matrix: every preset × anchor × unit × offset(0/+3/-2) × datatype.
// Snapshot locks the symbolic SQL for every branch; iterating drives 100% coverage.
test('symbolic SQL matrix', () => {
  const out: Record<string, string> = {};
  for (const preset of presets) {
    for (const datatype of datatypes) {
      for (const anchor of anchors) {
        for (const unit of units) {
          for (const offset of [0, 3, -2]) {
            const value = rel({ anchor, unit, offset });
            const key = `${preset}|${datatype}|${anchor}|${unit}|${offset}`;
            out[key] = getRelativeDateTimeSQL(value, preset, datatype);
          }
        }
      }
    }
  }
  expect(out).toMatchSnapshot();
});
