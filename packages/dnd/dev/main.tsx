import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderWithDndProvider } from '../src/QueryBuilderDnD';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App queryBuilder={QueryBuilderWithDndProvider} />
  </React.StrictMode>
);
