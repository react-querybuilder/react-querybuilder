import { MantineProvider } from '@mantine/core';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../react-querybuilder/dev';
import { QueryBuilderMantine } from '../src';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <MantineProvider>
      <App wrapper={QueryBuilderMantine} />
    </MantineProvider>
  </React.StrictMode>
);
