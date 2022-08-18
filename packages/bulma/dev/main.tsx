import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { bulmaControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App controlElements={bulmaControlElements} />
  </React.StrictMode>
);
