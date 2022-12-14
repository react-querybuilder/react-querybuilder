import clsx from 'clsx';
import queryString from 'query-string';
import type { ComponentType } from 'react';
import { Fragment, useCallback, useEffect, useMemo, useReducer, useState } from 'react';
import type {
  FormatQueryOptions,
  QueryBuilderContextProps,
  RuleGroupType,
  RuleGroupTypeIC,
} from '../src';
import { defaultValidator, QueryBuilder, standardClassnames } from '../src';
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
import type { CommonRQBProps, DemoOptions, DemoOptionsHash } from './types';
import { getFormatQueryString, optionsReducer } from './utils';

const getOptionsFromHash = (hash: DemoOptionsHash): Partial<DemoOptions> =>
  Object.fromEntries(Object.entries(hash).map(([opt, val]) => [opt, val === 'true']));

// Initialize options from URL hash
const initialOptionsFromHash = getOptionsFromHash(queryString.parse(location.hash));

export const App = ({
  controlClassnames,
  controlElements,
  wrapper: Wrapper = Fragment,
  ...initialProps
}: QueryBuilderContextProps & { wrapper?: ComponentType<any> }) => {
  const [query, setQuery] = useState(initialQuery);
  const [queryIC, setQueryIC] = useState(initialQueryIC);
  const [optVals, updateOptions] = useReducer(optionsReducer, {
    ...defaultOptions,
    ...initialProps,
    ...initialOptionsFromHash,
  });

  const permalinkHash = useMemo(() => `#${queryString.stringify(optVals)}`, [optVals]);

  const updateOptionsFromHash = useCallback((e: HashChangeEvent) => {
    const optionsFromHash = getOptionsFromHash(
      queryString.parse(
        queryString.parseUrl(e.newURL, { parseFragmentIdentifier: true }).fragmentIdentifier ?? ''
      )
    );
    const payload = { ...defaultOptions, ...optionsFromHash };

    updateOptions({ type: 'replace', payload });
  }, []);

  useEffect(() => {
    history.pushState(null, '', permalinkHash);
    window.addEventListener('hashchange', updateOptionsFromHash);

    return () => window.removeEventListener('hashchange', updateOptionsFromHash);
  }, [permalinkHash, updateOptionsFromHash]);

  const commonRQBProps = useMemo(
    (): CommonRQBProps => ({
      fields,
      ...optVals,
      validator: optVals.validateQuery ? defaultValidator : undefined,
      controlClassnames: {
        ...controlClassnames,
        queryBuilder: clsx(controlClassnames?.queryBuilder, {
          [standardClassnames.branches]: optVals.showBranches,
        }),
      },
      controlElements,
    }),
    [controlClassnames, controlElements, optVals]
  );

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
        ['Default options', () => updateOptions({ type: 'reset' })],
        ['All options', () => updateOptions({ type: 'all' })],
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
    []
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
              onChange={e =>
                updateOptions({
                  type: 'update',
                  payload: { optionName: opt, value: e.target.checked },
                })
              }
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
              key="query"
              {...commonRQBProps}
              independentCombinators={false}
              query={query}
              onQueryChange={onQueryChange}
            />
          ) : (
            <QueryBuilder
              key="queryIC"
              {...commonRQBProps}
              independentCombinators
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
