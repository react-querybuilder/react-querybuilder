import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderBulma>
      <App />
    </QueryBuilderBulma>
  </React.StrictMode>
);
