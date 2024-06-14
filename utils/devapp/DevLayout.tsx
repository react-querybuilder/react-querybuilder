import * as React from 'react';
import { Fragment } from 'react';
import { optionOrder } from './constants';
import './styles.scss';
import type { useDevApp } from './useDevApp';
import { generatePermalinkHash, optionsReducer } from './utils';

export const DevLayout = ({
  actions,
  children,
  formatQueryResults,
  optVals,
  updateOptions,
}: ReturnType<typeof useDevApp> & { children: React.ReactNode }) => {
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
        {children}
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
