import { parseCEL } from '@rqb-parsecel';
import { parseJSONata } from '@rqb-parsejsonata';
import { parseJsonLogic } from '@rqb-parsejsonlogic';
import { parseMongoDB } from '@rqb-parsemongodb';
import { parseSpEL } from '@rqb-parsespel';
import { parseSQL } from '@rqb-parsesql';
import { regenerateIDs } from '@rqb-utils';
import * as React from 'react';
import { Fragment } from 'react';
import type { RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder';
import { optionOrder } from './constants';
import './styles.scss';
import type { useDevApp } from './useDevApp';
import { generatePermalinkHash, optionsReducer } from './utils';

// TODO: Type this better
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parserMap: Record<string, any> = {
  sql: parseSQL,
  cel: parseCEL,
  spel: parseSpEL,
  mongodb: parseMongoDB,
  jsonlogic: parseJsonLogic,
  jsonata: parseJSONata,
};

export const DevLayout = ({
  actions,
  children,
  formatQueryResults,
  optVals,
  updateOptions,
  onQueryChange,
  onQueryChangeIC,
}: ReturnType<typeof useDevApp> & { children: React.ReactNode }) => {
  const [importText, setImportText] = React.useState('');
  const [importFmt, setImportFmt] = React.useState('sql');

  const onImportClick = () => {
    const parser = parserMap[importFmt] ?? ((text: string) => JSON.parse(text));
    if (!optVals.independentCombinators) {
      onQueryChange(regenerateIDs(parser(importText)) as RuleGroupType);
    } else {
      onQueryChangeIC(
        regenerateIDs(parser(importText, { independentCombinators: true })) as RuleGroupTypeIC
      );
    }
  };

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
        <textarea
          name="import"
          id="import"
          rows={5}
          value={importText}
          onChange={e => setImportText(e.target.value)}
        />
        <select value={importFmt} onChange={e => setImportFmt(e.target.value)}>
          <option value="sql">SQL</option>
          <option value="cel">CEL</option>
          <option value="spel">SpEL</option>
          <option value="mongodb">MongoDB</option>
          <option value="jsonlogic">JsonLogic</option>
          <option value="jsonata">JSONata</option>
          <option value="json">JSON</option>
        </select>
        <button type="button" onClick={onImportClick}>
          Import
        </button>
      </div>
      <div>
        {children}
        <div id="exports">
          {formatQueryResults.map(([fmt, result]) => (
            <Fragment key={fmt}>
              <code>{fmt}</code>
              <div className="codeBlock">
                <pre>{result}</pre>
                <button
                  type="button"
                  className="copyButton"
                  onClick={() => navigator.clipboard.writeText(result)}>
                  ⧉
                </button>
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
