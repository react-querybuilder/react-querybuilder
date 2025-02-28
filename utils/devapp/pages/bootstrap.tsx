import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import 'bootstrap-icons/font/bootstrap-icons.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './bootstrap.css';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderBootstrap>
      <App />
    </QueryBuilderBootstrap>
  </React.StrictMode>
);
