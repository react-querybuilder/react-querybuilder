import { combine } from '@atlaskit/pragmatic-drag-and-drop/combine';
import {
  draggable,
  dropTargetForElements,
  monitorForElements,
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import * as DndKit from '@dnd-kit/core';
import type { DndAdapter } from '@react-querybuilder/dnd';
import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import { createDndKitAdapter } from '@react-querybuilder/dnd/dnd-kit';
import { createPragmaticDndAdapter } from '@react-querybuilder/dnd/pragmatic-dnd';
import { createReactDnDAdapter } from '@react-querybuilder/dnd/react-dnd';
import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import * as ReactDnDTouchBackend from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { App } from '../App';

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

const adapterSelectorStyle: React.CSSProperties = { padding: 'var(--rqb-spacing)' };

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
    <label style={adapterSelectorStyle}>
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

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <AdapterSelector />
    <QueryBuilderDnD dnd={dnd}>
      <App />
    </QueryBuilderDnD>
  </React.StrictMode>
);
