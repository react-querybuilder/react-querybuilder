import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@rqb-devapp';
import './styles.scss';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
