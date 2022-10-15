import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { antdControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App controlElements={antdControlElements} />
  </React.StrictMode>
);
