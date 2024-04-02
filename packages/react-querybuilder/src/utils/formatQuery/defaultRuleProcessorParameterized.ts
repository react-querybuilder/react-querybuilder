import type { RuleProcessor } from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { parseNumber } from '../parseNumber';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { mapSQLOperator, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "sql" format.
 */
export const defaultRuleProcessorParameterized: RuleProcessor = (rule, opts, meta) => {
  // TODO: test for this so we don't have to ignore it
  // istanbul ignore next
  const {
    fieldData,
    format,
    getNextNamedParam,
    parseNumbers,
    paramPrefix,
    paramsKeepPrefix,
    numberedParams,
    quoteFieldNamesWith = ['', ''] as [string, string],
    valueProcessor = defaultValueProcessorByRule,
  } = opts ?? {};

  const { processedParams = [] } = meta ?? {};

  const parameterized = format === 'parameterized';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paramsNamed: Record<string, any> = {};

  const finalize = (sql: string) => {
    if (parameterized) {
      return { sql, params };
    }
    return { sql, params: paramsNamed };
  };

  const value = valueProcessor(rule, {
    parseNumbers,
    quoteFieldNamesWith,
    fieldData,
    format,
  });

  const sqlOperator = mapSQLOperator(rule.operator);
  const sqlOperatorLowerCase = sqlOperator.toLowerCase();

  if (
    (sqlOperatorLowerCase === 'in' ||
      sqlOperatorLowerCase === 'not in' ||
      sqlOperatorLowerCase === 'between' ||
      sqlOperatorLowerCase === 'not between') &&
    !value
  ) {
    return finalize('');
  } else if (sqlOperatorLowerCase === 'is null' || sqlOperatorLowerCase === 'is not null') {
    return finalize(
      `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${sqlOperator}`
    );
  } else if (rule.valueSource === 'field') {
    return finalize(
      `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${sqlOperator} ${value}`.trim()
    );
  }

  if (sqlOperatorLowerCase === 'in' || sqlOperatorLowerCase === 'not in') {
    const splitValue = toArray(rule.value);
    if (parameterized) {
      splitValue.forEach(v =>
        params.push(shouldRenderAsNumber(v, parseNumbers) ? parseNumber(v, { parseNumbers }) : v)
      );
      return finalize(
        `${quoteFieldNamesWith[0]}${rule.field}${
          quoteFieldNamesWith[1]
        } ${sqlOperator} (${splitValue
          .map((_v, i) =>
            numberedParams
              ? `${paramPrefix}${processedParams.length + 1 + splitValue.length - (splitValue.length - i)}`
              : '?'
          )
          .join(', ')})`
      );
    }
    const inParams: string[] = [];
    splitValue.forEach(v => {
      const thisParamName = getNextNamedParam!(rule.field);
      inParams.push(`${paramPrefix}${thisParamName}`);
      paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${thisParamName}`] = shouldRenderAsNumber(
        v,
        parseNumbers
      )
        ? parseNumber(v, { parseNumbers })
        : v;
    });
    return finalize(
      `${quoteFieldNamesWith[0]}${rule.field}${
        quoteFieldNamesWith[1]
      } ${sqlOperator} (${inParams.join(', ')})`
    );
  } else if (sqlOperatorLowerCase === 'between' || sqlOperatorLowerCase === 'not between') {
    const valueAsArray = toArray(rule.value);
    const [first, second] = valueAsArray
      .slice(0, 2)
      .map(v => (shouldRenderAsNumber(v, parseNumbers) ? parseNumber(v, { parseNumbers }) : v));
    if (parameterized) {
      params.push(first);
      params.push(second);
      return finalize(
        `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${sqlOperator} ${
          numberedParams ? `${paramPrefix}${processedParams.length + 1}` : '?'
        } and ${numberedParams ? `${paramPrefix}${processedParams.length + 2}` : '?'}`
      );
    }
    const firstParamName = getNextNamedParam!(rule.field);
    const secondParamName = getNextNamedParam!(rule.field);
    paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${firstParamName}`] = first;
    paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${secondParamName}`] = second;
    return finalize(
      `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${sqlOperator} ${paramPrefix}${firstParamName} and ${paramPrefix}${secondParamName}`
    );
  }
  let paramValue = rule.value;
  if (typeof rule.value === 'string') {
    if (shouldRenderAsNumber(rule.value, parseNumbers)) {
      paramValue = parseNumber(rule.value, { parseNumbers });
    } else {
      // Note that we're using `value` here, which has been processed through
      // a `valueProcessor`, as opposed to `rule.value` which has not
      paramValue = /^'.*'$/g.test(value)
        ? value.replace(/(^'|'$)/g, '')
        : /* istanbul ignore next */ value;
    }
  }
  let paramName = '';
  if (parameterized) {
    params.push(paramValue);
  } else {
    paramName = getNextNamedParam!(rule.field);
    paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${paramName}`] = paramValue;
  }
  return finalize(
    `${quoteFieldNamesWith[0]}${rule.field}${quoteFieldNamesWith[1]} ${sqlOperator} ${
      parameterized
        ? numberedParams
          ? `${paramPrefix}${processedParams.length + 1}`
          : '?'
        : `${paramPrefix}${paramName}`
    }`.trim()
  );
};
