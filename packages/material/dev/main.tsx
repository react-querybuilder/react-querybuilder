import { green, purple } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderMaterial } from '../src';

const muiTheme = createTheme({
  palette: {
    primary: {
      main: purple[500],
    },
    secondary: {
      main: green[500],
    },
  },
});

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App wrapper={QueryBuilderMaterial} />
    </ThemeProvider>
  </React.StrictMode>
);
