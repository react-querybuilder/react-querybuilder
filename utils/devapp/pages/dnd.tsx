import { QueryBuilderDnD } from '@react-querybuilder/dnd';
import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import * as ReactDnDTouchBackend from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import { App } from '../App';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDnDHTML5Backend, ...ReactDnDTouchBackend }}>
      <App />
    </QueryBuilderDnD>
  </React.StrictMode>
);
