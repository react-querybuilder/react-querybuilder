import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDndHtml5Backend from 'react-dnd-html5-backend';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <QueryBuilderDnD dnd={{ ...ReactDnD, ...ReactDndHtml5Backend }}>
      <App enableDragAndDrop />
    </QueryBuilderDnD>
  </React.StrictMode>
);
