import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import 'bulma/css/bulma.min.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './bulma.css';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderBulma>
      <App />
    </QueryBuilderBulma>
  </React.StrictMode>
);
