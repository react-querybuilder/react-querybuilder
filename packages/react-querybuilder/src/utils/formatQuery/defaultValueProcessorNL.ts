import type { FullField, ValueProcessorByRule } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { getOption } from '../optGroupUtils';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { getQuotedFieldName, shouldRenderAsNumber } from './utils';

const escapeStringValueQuotes = (v: unknown, quoteChar: string, escapeQuotes?: boolean) =>
  escapeQuotes && typeof v === 'string'
    ? v.replaceAll(`${quoteChar}`, `${quoteChar}${quoteChar}`)
    : /* istanbul ignore next */ v;

/**
 * Default value processor used by {@link formatQuery} for "natural_language" format.
 *
 * @group Export
 */
export const defaultValueProcessorNL: ValueProcessorByRule = (
  rule,
  // istanbul ignore next - defaultRuleProcessorNL always provides options
  opts = {}
) => {
  const {
    escapeQuotes,
    fields,
    parseNumbers,
    quoteFieldNamesWith,
    quoteValuesWith,
    fieldIdentifierSeparator,
  } = opts;
  const valueIsField = rule.valueSource === 'field';
  const operatorLowerCase = rule.operator.toLowerCase();
  const quoteChar = quoteValuesWith || /* istanbul ignore next */ "'";

  const quoteValue = (v: unknown) => `${quoteChar}${v}${quoteChar}`;
  const escapeValue = (v: unknown) => escapeStringValueQuotes(v, quoteChar, escapeQuotes);
  const wrapAndEscape = (v: unknown) => quoteValue(escapeValue(v));
  const wrapFieldName = (v: string) =>
    getQuotedFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });

  switch (operatorLowerCase) {
    case 'null':
    case 'notnull': {
      return '';
    }

    case 'between':
    case 'notbetween':
      return defaultValueProcessorByRule(rule, opts);

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(rule.value);
      if (valueAsArray.length === 0) return '';
      const valStringArray = valueAsArray.map(v =>
        valueIsField
          ? wrapFieldName(
              getOption((fields as FullField[]) ?? /* istanbul ignore next */ [], rule.value)
                ?.label ?? v
            )
          : shouldRenderAsNumber(v, parseNumbers)
            ? `${trimIfString(v)}`
            : `${wrapAndEscape(v)}`
      );
      if (valStringArray.length <= 2) {
        return valStringArray.join(' or ');
      }
      return `${valStringArray.slice(0, -1).join(', ')}, or ${valStringArray.at(-1)}`;
    }
  }

  if (typeof rule.value === 'boolean') {
    return rule.value ? 'true' : 'false';
  }

  return valueIsField
    ? wrapFieldName(
        getOption((fields as FullField[]) ?? /* istanbul ignore next */ [], rule.value)?.label ??
          rule.value
      )
    : shouldRenderAsNumber(rule.value, parseNumbers)
      ? `${trimIfString(rule.value)}`
      : `${wrapAndEscape(rule.value)}`;
};
