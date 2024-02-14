import clsx from 'clsx';
import queryString from 'query-string';
import type { ComponentType } from 'react';
import * as React from 'react';
import { Fragment, useCallback, useMemo, useReducer, useState } from 'react';
import type {
  FormatQueryOptions,
  FullField,
  QueryBuilderContextProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from '../src';
import * as RQB from '../src';
import {
  defaultOptions,
  emptyQuery,
  emptyQueryIC,
  fields,
  formatMap,
  initialQuery,
  initialQueryIC,
  optionOrder,
} from './constants';
import './styles.scss';
import type { CommonRQBProps, DemoOptions } from './types';
import { getFormatQueryString, optionsReducer } from './utils';

const { defaultValidator, QueryBuilder, standardClassnames } = RQB;

Object.defineProperty(globalThis, 'RQB', { value: RQB });

const getOptionsFromHash = () =>
  Object.fromEntries(
    Object.entries(queryString.parse(location.hash)).map(([opt, val]) => [opt, val === 'true'])
  );

// Initialize options from URL hash
const initialOptionsFromHash = getOptionsFromHash();

const generatePermalinkHash = (optVals: DemoOptions) => `#${queryString.stringify(optVals)}`;

export const App = ({
  controlClassnames,
  controlElements,
  wrapper: Wrapper = Fragment,
  ...initialProps
}: QueryBuilderContextProps<FullField, string> & { wrapper?: ComponentType<any> }) => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [optVals, updateOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
    ...initialProps,
    ...initialOptionsFromHash,
  });

  const commonRQBProps = useMemo((): CommonRQBProps => {
    const { independentCombinators: _ic, ...opts } = optVals;
    return {
      fields,
      ...opts,
      validator: opts.validateQuery ? defaultValidator : undefined,
      controlClassnames: {
        ...controlClassnames,
        queryBuilder: clsx(controlClassnames?.queryBuilder, {
          [standardClassnames.branches]: opts.showBranches,
        }),
      },
      controlElements,
    };
  }, [controlClassnames, controlElements, optVals]);

  const formatQueryResults = formatMap.map(([format]) => {
    const formatQueryOptions: FormatQueryOptions = {
      format,
      fields: optVals.validateQuery ? fields : undefined,
      parseNumbers: optVals.parseNumbers,
    };
    const q = optVals.independentCombinators ? queryIC : query;
    return [format, getFormatQueryString(q, formatQueryOptions)] as const;
  });

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
      ] as const,
    [optVals]
  );

  const onQueryChange = useCallback((q: RuleGroupType) => setQuery(q), []);
  const onQueryChangeIC = useCallback((q: RuleGroupTypeIC) => setQueryIC(q), []);

  return (
    <>
      <div>
        {optionOrder.map(opt => (
          <label key={opt}>
            <input
              type="checkbox"
              checked={optVals[opt]}
              onChange={e => {
                history.pushState(
                  null,
                  '',
                  generatePermalinkHash(
                    optionsReducer(optVals, {
                      type: 'update',
                      payload: { optionName: opt, value: e.target.checked },
                    })
                  )
                );
                updateOptions({
                  type: 'update',
                  payload: { optionName: opt, value: e.target.checked },
                });
              }}
            />
            <code>{opt}</code>
          </label>
        ))}
        {actions.map(([label, action]) => (
          <span key={label}>
            <button type="button" onClick={action}>
              {label}
            </button>
          </span>
        ))}
      </div>
      <div>
        <Wrapper>
          {!optVals.independentCombinators ? (
            <QueryBuilder
              {...commonRQBProps}
              key="query"
              query={query}
              onQueryChange={onQueryChange}
            />
          ) : (
            <QueryBuilder
              {...commonRQBProps}
              key="queryIC"
              query={queryIC}
              onQueryChange={onQueryChangeIC}
            />
          )}
        </Wrapper>
        <div id="exports">
          {formatQueryResults.map(([fmt, result]) => (
            <Fragment key={fmt}>
              <code>{fmt}</code>
              <pre>{result}</pre>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
