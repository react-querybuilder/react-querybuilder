import queryString from 'query-string';
import type { FormatQueryOptions, RuleGroupTypeAny } from 'react-querybuilder';
import { bigIntJsonStringifyReplacer, formatQuery } from 'react-querybuilder';
import { defaultOptions, optionOrder } from './constants';
import type { DemoOption, DemoOptions } from './types';

type OptionsAction =
  | { type: 'all' }
  | { type: 'reset' }
  | {
      type: 'update';
      payload: {
        optionName: DemoOption;
        value: boolean;
      };
    }
  | {
      type: 'replace';
      payload: DemoOptions;
    };

export const optionsReducer = (state: DemoOptions, action: OptionsAction): DemoOptions => {
  switch (action.type) {
    case 'reset':
      return defaultOptions;
    case 'all': {
      const allSelected: DemoOptions = { ...defaultOptions };
      for (const opt of optionOrder) {
        allSelected[opt] =
          opt !== 'disabled' &&
          opt !== 'independentCombinators' &&
          opt !== 'suppressStandardClassnames';
      }
      return allSelected;
    }
    case 'replace':
      return action.payload;
  }
  const { optionName, value } = action.payload;
  return { ...state, [optionName]: value };
};

export const getFormatQueryString = (
  query: RuleGroupTypeAny,
  options: FormatQueryOptions
): string => {
  const formatQueryResult = formatQuery(query, options);
  if (options.format === 'json_without_ids' || options.format === 'mongodb') {
    return JSON.stringify(JSON.parse(formatQueryResult), null, 2);
  } else if (
    options.format === 'parameterized' ||
    options.format === 'parameterized_named' ||
    options.format === 'jsonlogic' ||
    options.format === 'elasticsearch' ||
    options.format === 'mongodb_query'
  ) {
    return JSON.stringify(formatQueryResult, bigIntJsonStringifyReplacer, 2);
  }
  return formatQueryResult;
};

export const generatePermalinkHash = (optVals: DemoOptions) => `#${queryString.stringify(optVals)}`;
