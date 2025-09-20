import { App } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import './styles.scss';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
