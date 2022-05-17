import { createTheme, ThemeProvider } from '@mui/material/styles';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev/App';
import { materialControlElements } from '../src';

const muiTheme = createTheme();

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ThemeProvider theme={muiTheme}>
      <App controlElements={materialControlElements} />
    </ThemeProvider>
  </StrictMode>
);
