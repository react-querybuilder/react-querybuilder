import { green, purple } from '@mui/material/colors';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { QueryBuilderMaterial } from '@react-querybuilder/material';
import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';

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

const defaultDevAppOptions = { showInputLabels: false };

const App = () => {
  const devApp = useDevApp(defaultDevAppOptions);

  return (
    <DevLayout {...devApp}>
      <ThemeProvider theme={muiTheme}>
        <QueryBuilderMaterial showInputLabels={devApp.optVals.showInputLabels}>
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
