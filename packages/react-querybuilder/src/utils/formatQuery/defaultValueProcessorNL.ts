import type { FullField, ValueProcessorByRule } from '../../types/index.noReact';
import { toArray, trimIfString } from '../arrayUtils';
import { lc } from '../misc';
import { getOption } from '../optGroupUtils';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { getQuotedFieldName, isValidValue, shouldRenderAsNumber } from './utils';

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
    translations,
  } = opts;
  const valueIsField = rule.valueSource === 'field';
  const operatorLowerCase = lc(rule.operator);
  const quoteChar = quoteValuesWith || /* istanbul ignore next */ "'";

  // oxlint-disable no-explicit-any
  const quoteValue = (v: any) => `${quoteChar}${v}${quoteChar}`;
  const escapeValue = (v: any) => escapeStringValueQuotes(v, quoteChar, escapeQuotes);
  const wrapAndEscape = (v: any) => quoteValue(escapeValue(v));
  // oxlint-enable no-explicit-any
  const wrapFieldName = (v: string) =>
    getQuotedFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });

  const t = translations ?? /* istanbul ignore next */ {};
  const orTL = t.or ?? 'or';
  const trueTL = t.true ?? 'true';
  const falseTL = t.false ?? 'false';

  switch (operatorLowerCase) {
    case 'null':
    case 'notnull': {
      return '';
    }

    case 'between':
    case 'notbetween': {
      if (!valueIsField) {
        return defaultValueProcessorByRule(rule, opts);
      }

      const valueAsArray = toArray(rule.value, { retainEmptyStrings: true })
        .slice(0, 2)
        .map(v =>
          wrapFieldName(
            getOption((fields as FullField[]) ?? /* istanbul ignore next */ [], v)?.label ?? v
          )
        );
      if (
        valueAsArray.length < 2 ||
        !isValidValue(valueAsArray[0]) ||
        !isValidValue(valueAsArray[1])
      ) {
        return '';
      }
      return defaultValueProcessorByRule({ ...rule, value: valueAsArray }, opts);
    }

    case 'in':
    case 'notin': {
      const valueAsArray = toArray(rule.value);
      if (valueAsArray.length === 0) return '';
      const valStringArray = valueAsArray.map(v =>
        valueIsField
          ? wrapFieldName(
              getOption((fields as FullField[]) ?? /* istanbul ignore next */ [], v)?.label ?? v
            )
          : shouldRenderAsNumber(v, parseNumbers)
            ? `${trimIfString(v)}`
            : `${wrapAndEscape(v)}`
      );
      return `${valStringArray.slice(0, -1).join(', ')}${valStringArray.length > 2 ? ',' : ''} ${orTL} ${valStringArray.at(-1)}`;
    }
  }

  if (typeof rule.value === 'boolean') {
    return rule.value ? trueTL : falseTL;
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
