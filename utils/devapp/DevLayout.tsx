/* oxlint-disable prefer-global-this */

import { parseCEL } from '@rqb-parsecel';
// import { parseJSONata } from '@rqb-parsejsonata';
import { parseJsonLogic } from '@rqb-parsejsonlogic';
import { parseMongoDB } from '@rqb-parsemongodb';
import { parseSpEL } from '@rqb-parsespel';
import { parseSQL } from '@rqb-parsesql';
import { regenerateIDs } from '@rqb-utils';
import * as React from 'react';
import { Fragment } from 'react';
import type { ExportFormat, RuleGroupType, RuleGroupTypeIC } from 'react-querybuilder';
import '../../packages/react-querybuilder/dist/query-builder.css';
import { optionOrder } from './constants';
import './styles.css';
import type { DemoOption, DemoOptions } from './types';
import type { useDevApp } from './useDevApp';
import { generatePermalinkHash, optionsReducer } from './utils';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const parserMap: Record<string, any> = {
  sql: parseSQL,
  cel: parseCEL,
  spel: parseSpEL,
  mongodb: parseMongoDB,
  jsonlogic: parseJsonLogic,
  // jsonata: parseJSONata,
};

const links = [
  'react-querybuilder',
  'antd',
  'bootstrap',
  'bulma',
  'chakra',
  'datetime',
  'dnd',
  'fluent',
  'mantine',
  'material',
  'native',
  'tremor',
];

export const NavBar = (): React.JSX.Element => (
  <nav>
    {links.map(link =>
      window.location.pathname.includes(link) ? (
        <strong key={link}>{link}</strong>
      ) : (
        <a key={link} href={`/${link.replace('react-querybuilder', '')}`}>
          {link}
        </a>
      )
    )}
  </nav>
);

const OptionCheckbox = ({
  opt,
  optVals,
  updateOptions,
}: {
  opt: DemoOption;
  optVals: DemoOptions;
  updateOptions: ReturnType<typeof useDevApp>['updateOptions'];
}) => {
  const onChange: React.ChangeEventHandler<HTMLInputElement> = React.useCallback(
    e => {
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
    },
    [opt, optVals, updateOptions]
  );

  return (
    <label>
      <input type="checkbox" checked={optVals[opt]} onChange={onChange} />
      <code>{opt}</code>
    </label>
  );
};

const FormatRow = ({ fmt, result }: { fmt: ExportFormat; result: string }) => {
  const onClick = React.useCallback(() => navigator.clipboard.writeText(result), [result]);

  return (
    <Fragment>
      <code>{fmt}</code>
      <div className="codeBlock">
        <pre>{result}</pre>
        <button type="button" className="copyButton" onClick={onClick}>
          ⧉
        </button>
      </div>
    </Fragment>
  );
};

export const DevLayout = ({
  actions,
  children,
  formatQueryResults,
  optVals,
  updateOptions,
  onQueryChange,
  onQueryChangeIC,
}: ReturnType<typeof useDevApp> & { children: React.ReactNode }): React.JSX.Element => {
  const [importText, setImportText] = React.useState('');
  const [importFmt, setImportFmt] = React.useState('sql');

  const onImportClick = React.useCallback(() => {
    const parser = parserMap[importFmt] ?? ((text: string) => JSON.parse(text));
    if (optVals.independentCombinators) {
      onQueryChangeIC(
        regenerateIDs(parser(importText, { independentCombinators: true })) as RuleGroupTypeIC
      );
    } else {
      onQueryChange(regenerateIDs(parser(importText)) as RuleGroupType);
    }
  }, [importFmt, importText, onQueryChange, onQueryChangeIC, optVals.independentCombinators]);

  const updateImportText: React.ChangeEventHandler<HTMLTextAreaElement> = React.useCallback(
    e => setImportText(e.target.value),
    []
  );
  const updateImportFmt: React.ChangeEventHandler<HTMLSelectElement> = React.useCallback(
    e => setImportFmt(e.target.value),
    []
  );

  return (
    <>
      <NavBar />
      <div id="dev-layout">
        <div>
          {optionOrder.map(opt => (
            <OptionCheckbox key={opt} opt={opt} optVals={optVals} updateOptions={updateOptions} />
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
            onChange={updateImportText}
          />
          <select value={importFmt} onChange={updateImportFmt}>
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
              <FormatRow key={fmt} fmt={fmt} result={result} />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};
