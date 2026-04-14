import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import * as DndKit from '@dnd-kit/core';
import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import * as ReactDnDTouchBackend from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import type { DndAdapter } from '../src';
import { QueryBuilderDnD } from '../src';
import { createDndKitAdapter } from '../src/dnd-kit';
import { createPragmaticDndAdapter } from '../src/pragmatic-dnd';
import { createReactDnDAdapter } from '../src/react-dnd';
import './styles.scss';

const adapterOptions = [
  { value: 'pragmatic-dnd', label: 'Pragmatic DnD' },
  { value: 'react-dnd', label: 'React DnD' },
  { value: 'dnd-kit', label: 'DnD Kit' },
] as const;

type AdapterKey = (typeof adapterOptions)[number]['value'];

const defaultAdapter: AdapterKey = 'pragmatic-dnd';

const getSelectedAdapter = (): AdapterKey => {
  const params = new URLSearchParams(globalThis.location.search);
  const adapter = params.get('adapter');
  if (adapterOptions.some(opt => opt.value === adapter)) return adapter as AdapterKey;
  return defaultAdapter;
};

const selectedAdapter = getSelectedAdapter();

const createAdapter = (key: AdapterKey): DndAdapter => {
  switch (key) {
    case 'react-dnd':
      return createReactDnDAdapter({
        ...ReactDnD,
        ...ReactDnDHTML5Backend,
        ...ReactDnDTouchBackend,
      });
    case 'dnd-kit':
      return createDndKitAdapter(DndKit);
  }
  return createPragmaticDndAdapter({
    draggable,
    dropTargetForElements,
    monitorForElements,
    combine,
  });
};

const dnd = createAdapter(selectedAdapter);

const AdapterSelector = () => {
  const onChange = React.useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(globalThis.location.search);
    params.set('adapter', e.target.value);
    globalThis.location.search = params.toString();
  }, []);

  return (
    <label>
      DnD Adapter:{' '}
      <select value={selectedAdapter} onChange={onChange}>
        {adapterOptions.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
};

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <AdapterSelector />
      <QueryBuilderDnD dnd={dnd} hideDefaultDragPreview>
        {devApp.optVals.independentCombinators ? (
          <QueryBuilder
            key="queryIC"
            {...devApp.commonRQBProps}
            query={devApp.queryIC}
            onQueryChange={devApp.onQueryChangeIC}
          />
        ) : (
          <QueryBuilder
            key="query"
            {...devApp.commonRQBProps}
            query={devApp.query}
            onQueryChange={devApp.onQueryChange}
          />
        )}
      </QueryBuilderDnD>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
