import type { RuleProcessor } from 'react-querybuilder';
import type { IsDateField, IsDateFieldFunction } from './types';

export const isISOStringDateOnly = (
  date: unknown
): date is `${number}${number}${number}${number}-${number}${number}-${number}${number}` =>
  typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date);

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
