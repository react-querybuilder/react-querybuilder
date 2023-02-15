import 'bootstrap-icons/font/bootstrap-icons.scss';
import 'bootstrap/scss/bootstrap.scss';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderBootstrap } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App wrapper={QueryBuilderBootstrap} />
  </React.StrictMode>
);
