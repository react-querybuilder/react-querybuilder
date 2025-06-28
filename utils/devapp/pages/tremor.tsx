import { QueryBuilderTremor } from '@react-querybuilder/tremor';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './tremor.css';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderTremor
      controlClassnames={{
        fields: 'w-max',
        operators: 'w-max',
        combinators: 'w-max',
        matchMode: 'w-max',
      }}>
      <App />
    </QueryBuilderTremor>
  </React.StrictMode>
);
