import { green, purple } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';

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

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <ThemeProvider theme={muiTheme}>
      <QueryBuilderMaterial>
        <App />
      </QueryBuilderMaterial>
    </ThemeProvider>
  </React.StrictMode>
);
