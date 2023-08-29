import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../react-querybuilder/dev';
import { QueryBuilderBulma } from '../src';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App wrapper={QueryBuilderBulma} />
  </React.StrictMode>
);
