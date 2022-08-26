import { createTheme, ThemeProvider } from '@mui/material/styles';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { materialControlElements } from '../src';

const muiTheme = createTheme();

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App controlElements={materialControlElements} />
    </ThemeProvider>
  </React.StrictMode>
);
