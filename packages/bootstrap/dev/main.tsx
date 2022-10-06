import 'bootstrap-icons/font/bootstrap-icons.scss';
import 'bootstrap/scss/bootstrap.scss';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { bootstrapControlClassnames, bootstrapControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App
      controlClassnames={bootstrapControlClassnames}
      controlElements={bootstrapControlElements}
    />
  </React.StrictMode>
);
