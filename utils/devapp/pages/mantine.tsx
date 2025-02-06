import { MantineProvider } from '@mantine/core';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './mantine.scss';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <MantineProvider>
      <QueryBuilderMantine>
        <App />
      </QueryBuilderMantine>
    </MantineProvider>
  </React.StrictMode>
);
