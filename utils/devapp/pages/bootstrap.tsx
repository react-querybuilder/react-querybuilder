import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderBootstrap>
      <App />
    </QueryBuilderBootstrap>
  </React.StrictMode>
);
