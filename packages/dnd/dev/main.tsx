import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../react-querybuilder/dev';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <QueryBuilderDnD>
      <App enableDragAndDrop />
    </QueryBuilderDnD>
  </React.StrictMode>
);
