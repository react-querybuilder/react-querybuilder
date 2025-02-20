import { green, purple } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { DevLayout, useDevApp } from '@rqb-devapp';
import { QueryBuilderMaterial } from '../src';
import './styles.scss';

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

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <ThemeProvider theme={muiTheme}>
        <QueryBuilderMaterial>
          {devApp.optVals.independentCombinators ? (
            <QueryBuilder
              key="queryIC"
              {...devApp.commonRQBProps}
              query={devApp.queryIC}
              onQueryChange={devApp.onQueryChangeIC}
            />
          ) : (
            <QueryBuilder
              key="query"
              {...devApp.commonRQBProps}
              query={devApp.query}
              onQueryChange={devApp.onQueryChange}
            />
          )}
        </QueryBuilderMaterial>
      </ThemeProvider>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
