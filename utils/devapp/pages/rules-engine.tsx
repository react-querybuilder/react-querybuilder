import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { AppRE } from '../AppRE';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <AppRE />
  </React.StrictMode>
);
