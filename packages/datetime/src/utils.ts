import type { RuleProcessor, ValueSource } from '@react-querybuilder/core';
import type {
  IsDateField,
  IsDateFieldFunction,
  RelativeDateTimeTruncationUnit,
  RelativeDateTimeValue,
  RQBDateTimeLibraryAPI,
} from './types';

export const isISOStringDateOnly = (
  date: unknown
): date is `${number}${number}${number}${number}-${number}${number}-${number}${number}` =>
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);

/**
 * Whether a rule's value source is one that datetime processors must NOT materialize as a
 * date (`field` references another column; `parameter` is a named bind placeholder). Both
 * are delegated to the core default processor, which serializes them per format.
 */
export const isNonDateValueSource = (valueSource: ValueSource | undefined): boolean =>
  valueSource === 'field' || valueSource === 'parameter';

/**
 * Type guard for {@link RelativeDateTimeValue}. Relative values are stored as objects
 * (distinguishing them from the ISO 8601 strings used for absolute date/time values).
 */
export const isRelativeDateTimeValue = (value: unknown): value is RelativeDateTimeValue =>
  typeof value === 'object' &&
  value !== null &&
  (value as { mode?: unknown }).mode === 'relative' &&
  typeof (value as RelativeDateTimeValue).anchor === 'string';

const anchorRegExp = /^(start|end)Of(Day|Week|Month|Year)$/;

/**
 * Resolves a {@link RelativeDateTimeValue} into a concrete `Date` using the given
 * date library API. The anchor is applied relative to `base` (defaulting to now),
 * then the signed offset is added.
 */
export const resolveRelativeDateTime = (
  apiFns: RQBDateTimeLibraryAPI,
  value: RelativeDateTimeValue,
  base: Date = new Date()
): Date => {
  let result: Date = base;

  if (value.anchor !== 'now') {
    const match = anchorRegExp.exec(value.anchor);
    // v8 ignore next -- guarded by the RelativeDateTimeAnchor type
    if (match) {
      const unit = match[2].toLowerCase() as RelativeDateTimeTruncationUnit;
      result = match[1] === 'start' ? apiFns.startOf(result, unit) : apiFns.endOf(result, unit);
    }
  }

  if (value.offset) {
    result = apiFns.add(result, value.offset, value.unit);
  }

  return result;
};

/**
 * Whether a `datatype` represents a date-only (no time component) type, e.g. `date`
 * but not `datetime`/`datetimeoffset`/`timestamp`. Used to choose the precision when
 * materializing a relative value to an ISO 8601 string.
 */
export const isDateOnlyDatatype = (datatype: unknown): boolean =>
  /^date\b/i.test(datatype as string);

/**
 * Replaces any {@link RelativeDateTimeValue} in `value` (or in each element, if `value`
 * is an array) with a concrete ISO 8601 string, resolved via
 * {@link resolveRelativeDateTime}. The "now" reference can be pinned with
 * `opts.context.relativeDateTimeBase` for deterministic output; precision (date-only vs
 * full) follows the field's `datatype`. Non-relative values pass through unchanged.
 */
export const materializeRelativeValues = (
  apiFns: RQBDateTimeLibraryAPI,
  value: unknown,
  opts: Parameters<RuleProcessor>[1]
): unknown => {
  const base = opts?.context?.relativeDateTimeBase as Date | undefined;
  const dateOnly = isDateOnlyDatatype(opts?.fieldData?.datatype);
  const conv = (v: unknown): unknown => {
    if (!isRelativeDateTimeValue(v)) return v;
    const resolved = resolveRelativeDateTime(apiFns, v, base);
    return dateOnly ? apiFns.toISOStringDateOnly(resolved) : apiFns.toISOString(resolved);
  };
  return Array.isArray(value) ? value.map(conv) : conv(value);
};

/**
 * Resolves a rule's operator for export, applying any `context.relativeOperatorMap`
 * entry. Operator-driven mode controllers (see `createOperatorModeController`) use
 * dedicated operator names to signal relative mode; this maps those names to the real
 * comparison operator at format time. Operators absent from the map pass through unchanged.
 */
export const resolveDatetimeOperator = (...[rule, opts]: Parameters<RuleProcessor>): string =>
  (opts?.context?.relativeOperatorMap as Record<string, string> | undefined)?.[rule.operator] ??
  rule.operator;

/**
 * Prepares a date/time rule for delegation to a non-symbolic default rule processor
 * (e.g. "parameterized", "spel", "ldap", "gremlin", "prisma", "sequelize", "drizzle",
 * "tanstack_db"). Relative values are materialized to concrete dates (these formats have
 * no symbolic relative form), and `between`/`notBetween` operands are ordered
 * chronologically (defaults can't reorder non-numeric date operands). When `asDate` is
 * set, each valid value is converted to a `Date` (for object-based formats); otherwise
 * the materialized ISO 8601 strings are passed through. The resolved `operator` (after
 * any `relativeOperatorMap` mapping) is returned alongside the prepared `value`.
 */
export const materializeForExport = (
  apiFns: RQBDateTimeLibraryAPI,
  rule: Parameters<RuleProcessor>[0],
  opts: Parameters<RuleProcessor>[1],
  asDate = false
): { operator: string; value: unknown } => {
  const operator = resolveDatetimeOperator(rule, opts);
  const materialized = materializeRelativeValues(apiFns, rule.value, opts);

  let prepared = materialized;
  if (Array.isArray(materialized) && materialized.length >= 2) {
    const opLC = operator.toLowerCase();
    if (opLC === 'between' || opLC === 'notbetween') {
      const first = apiFns.toDate(materialized[0] as string | Date);
      const second = apiFns.toDate(materialized[1] as string | Date);
      if (apiFns.isValid(first) && apiFns.isValid(second) && !apiFns.isBefore(first, second)) {
        prepared = [materialized[1], materialized[0], ...materialized.slice(2)];
      }
    }
  }

  if (!asDate) return { operator, value: prepared };

  const toDateVal = (v: unknown) => {
    const d = apiFns.toDate(v as string | Date);
    return apiFns.isValid(d) ? d : v;
  };
  return {
    operator,
    value: Array.isArray(prepared) ? prepared.map(toDateVal) : toDateVal(prepared),
  };
};

export const defaultIsDateField: IsDateFieldFunction = (
  ...[rule, opts]: Parameters<RuleProcessor>
): boolean =>
  rule.operator !== 'contains' &&
  rule.operator !== 'beginsWith' &&
  rule.operator !== 'endsWith' &&
  rule.operator !== 'doesNotContain' &&
  rule.operator !== 'doesNotBeginWith' &&
  rule.operator !== 'doesNotEndWith' &&
  rule.operator !== 'null' &&
  rule.operator !== 'notNull' &&
  /^(?:date|datetime|datetimeoffset|timestamp)\b/i.test(opts?.fieldData?.datatype as string);

export const processIsDateField = (
  isDateField: IsDateField,
  ...[rule, opts]: Parameters<RuleProcessor>
): boolean => {
  if (typeof isDateField === 'boolean') {
    return isDateField;
  }

  if (typeof isDateField === 'function') {
    return isDateField(rule, opts);
  }

  if (Array.isArray(isDateField)) {
    return isDateField.some(condition =>
      Object.entries(condition).every(([key, value]) => opts?.fieldData?.[key] === value)
    );
  }

  if (typeof isDateField === 'object') {
    return Object.entries(isDateField).every(([key, value]) => opts?.fieldData?.[key] === value);
  }

  return defaultIsDateField(rule, opts);
};
