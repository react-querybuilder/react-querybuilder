import type { FullOption } from '@react-querybuilder/core';
import type { RelativeDateTimeAnchor, RelativeDateTimeUnit, RelativeDateTimeValue } from '../types';
import type { RelativeDateTimeToggleLabels } from './types';

/**
 * Class name applied to the absolute/relative mode toggle button. Package-local (not part
 * of the core `standardClassnames`) to avoid coupling core to this extension.
 */
export const relativeDateTimeToggleClassName = 'rule-value-dateTimeRelative-toggle';

/** Default value applied when switching a rule to relative mode. */
export const defaultRelativeDateTimeValue: RelativeDateTimeValue = {
  mode: 'relative',
  anchor: 'now',
  offset: 0,
  unit: 'day',
};

/** Default anchor (reference-point) options for the relative date/time editor. */
export const defaultRelativeDateTimeAnchors: FullOption<RelativeDateTimeAnchor>[] = [
  { name: 'now', value: 'now', label: 'now' },
  { name: 'startOfDay', value: 'startOfDay', label: 'start of day' },
  { name: 'endOfDay', value: 'endOfDay', label: 'end of day' },
  { name: 'startOfWeek', value: 'startOfWeek', label: 'start of week' },
  { name: 'endOfWeek', value: 'endOfWeek', label: 'end of week' },
  { name: 'startOfMonth', value: 'startOfMonth', label: 'start of month' },
  { name: 'endOfMonth', value: 'endOfMonth', label: 'end of month' },
  { name: 'startOfYear', value: 'startOfYear', label: 'start of year' },
  { name: 'endOfYear', value: 'endOfYear', label: 'end of year' },
];

/** Default unit options for the relative date/time editor. */
export const defaultRelativeDateTimeUnits: FullOption<RelativeDateTimeUnit>[] = [
  { name: 'minute', value: 'minute', label: 'minute(s)' },
  { name: 'hour', value: 'hour', label: 'hour(s)' },
  { name: 'day', value: 'day', label: 'day(s)' },
  { name: 'week', value: 'week', label: 'week(s)' },
  { name: 'month', value: 'month', label: 'month(s)' },
  { name: 'year', value: 'year', label: 'year(s)' },
];

/** Default labels/content for the absolute/relative mode toggle. */
export const defaultRelativeDateTimeToggleLabels: Required<RelativeDateTimeToggleLabels> = {
  label: 'Toggle relative date/time',
  absoluteTitle: 'Absolute date/time (click for relative)',
  relativeTitle: 'Relative date/time (click for absolute)',
  // Empty by default; the CSS pseudo-element renders the glyph based on `aria-checked`.
  absoluteContent: '',
  relativeContent: '',
};
