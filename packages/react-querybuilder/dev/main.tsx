import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@dev';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
