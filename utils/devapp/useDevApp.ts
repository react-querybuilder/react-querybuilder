import type {
  ExportFormat,
  FormatQueryOptions,
  RuleGroupType,
  RuleGroupTypeIC,
} from '@react-querybuilder/core';
import { defaultValidator, standardClassnames } from '@react-querybuilder/core';
import * as RQButils from '@rqb-utils';
import queryString from 'query-string';
import { useCallback, useMemo, useReducer, useState } from 'react';
import {
  defaultOptions,
  emptyQuery,
  emptyQueryIC,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
} from './constants';
import type { CommonRQBProps, DemoOptions } from './types';
import type { OptionsAction } from './utils';
import { generatePermalinkHash, getFormatQueryString, optionsReducer } from './utils';

Object.defineProperty(globalThis, 'RQButils', { value: RQButils });

const getOptionsFromHash = () =>
  Object.fromEntries(
    Object.entries(queryString.parse(location.hash)).map(([opt, val]) => [opt, val === 'true'])
  );

// Initialize options from URL hash
const initialOptionsFromHash = getOptionsFromHash();

export const useDevApp = <ExtraOptions extends Record<string, boolean | undefined>>(
  extraOptions: Partial<ExtraOptions> = {}
): {
  actions: [string, () => void][];
  commonRQBProps: CommonRQBProps;
  formatQueryResults: (readonly [ExportFormat, string])[];
  onQueryChange: (q: RuleGroupType) => void;
  onQueryChangeIC: (q: RuleGroupTypeIC) => void;
  optVals: DemoOptions & Partial<ExtraOptions>;
  query: RuleGroupType;
  queryIC: RuleGroupTypeIC;
  updateOptions: React.ActionDispatch<
    [action: OptionsAction<Partial<ExtraOptions> & { [k: string]: boolean }>]
  >;
} => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [optVals, updateOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
    ...extraOptions,
    ...initialOptionsFromHash,
  });

  const commonRQBProps = useMemo((): CommonRQBProps => {
    const { independentCombinators: _ic, ...opts } = optVals;
    return {
      ...opts,
      fields,
      validator: opts.validateQuery ? defaultValidator : undefined,
      controlClassnames: {
        queryBuilder: {
          [standardClassnames.branches]: opts.showBranches,
          [standardClassnames.justified]: opts.justifiedLayout,
        },
      },
    };
  }, [optVals]);

  const formatQueryResults = useMemo(
    () =>
      formatMap.map(([format]) => {
        const formatQueryOptions: FormatQueryOptions = {
          format,
          fields: optVals.validateQuery ? fields : undefined,
          parseNumbers: optVals.parseNumbers,
        };
        const q = optVals.independentCombinators ? queryIC : query;
        return [format, getFormatQueryString(q, formatQueryOptions)] as const;
      }),
    [optVals.validateQuery, optVals.parseNumbers, optVals.independentCombinators, queryIC, query]
  );

  const actions = useMemo(
    () =>
      [
        [
          'Default options',
          () => {
            history.pushState(
              null,
              '',
              generatePermalinkHash(optionsReducer(optVals, { type: 'reset' }))
            );
            updateOptions({ type: 'reset' });
          },
        ],
        [
          'All options',
          () => {
            history.pushState(
              null,
              '',
              generatePermalinkHash(optionsReducer(optVals, { type: 'all' }))
            );
            updateOptions({ type: 'all' });
          },
        ],
        [
          'Clear query',
          () => {
            setQuery(emptyQuery);
            setQueryIC(emptyQueryIC);
          },
        ],
        [
          'Default query',
          () => {
            setQuery(initialQuery);
            setQueryIC(initialQueryIC);
          },
        ],
      ] satisfies [string, () => void][],
    [optVals]
  );

  const onQueryChange = useCallback((q: RuleGroupType) => setQuery(q), []);
  const onQueryChangeIC = useCallback((q: RuleGroupTypeIC) => setQueryIC(q), []);

  return {
    actions,
    commonRQBProps,
    formatQueryResults,
    onQueryChange,
    onQueryChangeIC,
    optVals,
    query,
    queryIC,
    updateOptions,
  };
};
