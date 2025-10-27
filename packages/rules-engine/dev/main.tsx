import { AppRE } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <AppRE />
  </React.StrictMode>
);
