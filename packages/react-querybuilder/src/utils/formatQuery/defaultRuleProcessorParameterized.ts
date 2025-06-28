import type {
  FormatQueryFinalOptions,
  FullField,
  RuleGroupType,
  RuleProcessor,
} from '../../types/index.noReact';
import { toArray } from '../arrayUtils';
import { lc } from '../misc';
import { parseNumber } from '../parseNumber';
import { transformQuery } from '../transformQuery';
import { defaultRuleGroupProcessorParameterized } from './defaultRuleGroupProcessorParameterized';
import { defaultOperatorProcessorSQL } from './defaultRuleProcessorSQL';
import { defaultValueProcessorByRule } from './defaultValueProcessorByRule';
import { getQuotedFieldName, processMatchMode, shouldRenderAsNumber } from './utils';

/**
 * Default rule processor used by {@link formatQuery} for "parameterized" and
 * "parameterized_named" formats.
 *
 * @group Export
 */
export const defaultRuleProcessorParameterized: RuleProcessor = (rule, opts, meta) => {
  // TODO?: test for this so we don't have to ignore it
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
    fieldIdentifierSeparator,
    concatOperator,
    operatorProcessor = defaultOperatorProcessorSQL,
    valueProcessor = defaultValueProcessorByRule,
  } = opts ?? {};

  const { processedParams = [] } = meta ?? {};

  const parameterized = format === 'parameterized';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const params: any[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const paramsNamed: Record<string, any> = {};

  const finalize = (sql: string) =>
    parameterized ? { sql, params } : { sql, params: paramsNamed };

  const wrapFieldName = (v: string) =>
    getQuotedFieldName(v, { quoteFieldNamesWith, fieldIdentifierSeparator });

  const ruleField = wrapFieldName(rule.field);

  const matchEval = processMatchMode(rule);

  if (matchEval === false) {
    return;
  } else if (matchEval) {
    // We only support PostgreSQL nested arrays
    if (opts?.preset !== 'postgresql') return finalize('');

    const { mode, threshold } = matchEval;

    // TODO?: Randomize this alias
    const arrayElementAlias = 'elem_alias';

    const { sql: nestedSQL, params: nestedParams } = defaultRuleGroupProcessorParameterized(
      transformQuery(rule.value as RuleGroupType, {
        ruleProcessor: r => ({ ...r, field: arrayElementAlias }),
      }),
      { ...(opts as FormatQueryFinalOptions), fields: [] as FullField[] }
    );
    // Ignore the "parameterized_named" case because PostgreSQL doesn't support named parameters
    // istanbul ignore else
    if (Array.isArray(nestedParams)) {
      params.push(...nestedParams);
    } else {
      Object.assign(paramsNamed, nestedParams);
    }

    switch (mode) {
      case 'all':
        return finalize(
          `(select count(*) from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedSQL}) = array_length(${ruleField}, 1)`
        );

      case 'none':
        return finalize(
          `not exists (select 1 from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedSQL})`
        );

      case 'some':
        return finalize(
          `exists (select 1 from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedSQL})`
        );

      case 'atleast':
      case 'atmost':
      case 'exactly': {
        const op = mode === 'atleast' ? '>=' : mode === 'atmost' ? '<=' : '=';

        return finalize(
          `(select count(*)${threshold > 0 && threshold < 1 ? ` / array_length(${ruleField}, 1)` : ''} from unnest(${ruleField}) as ${wrapFieldName(arrayElementAlias)} where ${nestedSQL}) ${op} ${threshold}`
        );
      }
    }
  }

  const value = valueProcessor(rule, {
    parseNumbers,
    quoteFieldNamesWith,
    concatOperator,
    fieldData,
    format,
  });

  const sqlOperator = operatorProcessor(rule, opts);
  const sqlOperatorLowerCase = lc(sqlOperator);
  const [qPre, qPost] = quoteFieldNamesWith;

  if (
    (sqlOperatorLowerCase === 'in' ||
      sqlOperatorLowerCase === 'not in' ||
      sqlOperatorLowerCase === 'between' ||
      sqlOperatorLowerCase === 'not between') &&
    !value
  ) {
    return finalize('');
  } else if (sqlOperatorLowerCase === 'is null' || sqlOperatorLowerCase === 'is not null') {
    return finalize(`${qPre}${rule.field}${qPost} ${sqlOperator}`);
  } else if (rule.valueSource === 'field') {
    return finalize(`${qPre}${rule.field}${qPost} ${sqlOperator} ${value}`.trim());
  } else if (sqlOperatorLowerCase === 'in' || sqlOperatorLowerCase === 'not in') {
    const splitValue = toArray(rule.value);
    if (parameterized) {
      for (const v of splitValue) {
        params.push(shouldRenderAsNumber(v, parseNumbers) ? parseNumber(v, { parseNumbers }) : v);
      }
      return finalize(
        `${qPre}${rule.field}${qPost} ${sqlOperator} (${splitValue
          .map((_v, i) =>
            numberedParams
              ? `${paramPrefix}${processedParams.length + 1 + splitValue.length - (splitValue.length - i)}`
              : '?'
          )
          .join(', ')})`
      );
    }
    const inParams: string[] = [];
    for (const v of splitValue) {
      const thisParamName = getNextNamedParam!(rule.field);
      inParams.push(`${paramPrefix}${thisParamName}`);
      paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${thisParamName}`] = shouldRenderAsNumber(
        v,
        parseNumbers
      )
        ? parseNumber(v, { parseNumbers })
        : v;
    }
    return finalize(`${qPre}${rule.field}${qPost} ${sqlOperator} (${inParams.join(', ')})`);
  } else if (sqlOperatorLowerCase === 'between' || sqlOperatorLowerCase === 'not between') {
    const valueAsArray = toArray(rule.value, { retainEmptyStrings: true });
    const [first, second] = valueAsArray
      .slice(0, 2)
      .map(v => (shouldRenderAsNumber(v, parseNumbers) ? parseNumber(v, { parseNumbers }) : v));
    if (parameterized) {
      params.push(first, second);
      return finalize(
        `${qPre}${rule.field}${qPost} ${sqlOperator} ${
          numberedParams ? `${paramPrefix}${processedParams.length + 1}` : '?'
        } and ${numberedParams ? `${paramPrefix}${processedParams.length + 2}` : '?'}`
      );
    }
    const firstParamName = getNextNamedParam!(rule.field);
    const secondParamName = getNextNamedParam!(rule.field);
    paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${firstParamName}`] = first;
    paramsNamed[`${paramsKeepPrefix ? paramPrefix : ''}${secondParamName}`] = second;
    return finalize(
      `${qPre}${rule.field}${qPost} ${sqlOperator} ${paramPrefix}${firstParamName} and ${paramPrefix}${secondParamName}`
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
        ? value.replaceAll(/(^'|'$)/g, '')
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
    `${qPre}${rule.field}${qPost} ${sqlOperator} ${
      parameterized
        ? numberedParams
          ? `${paramPrefix}${processedParams.length + 1}`
          : '?'
        : `${paramPrefix}${paramName}`
    }`.trim()
  );
};
