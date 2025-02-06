import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import 'bootstrap/scss/bootstrap.scss';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './bootstrap.scss';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderBootstrap>
      <App />
    </QueryBuilderBootstrap>
  </React.StrictMode>
);
