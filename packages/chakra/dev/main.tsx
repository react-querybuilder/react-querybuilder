import { Flex, Theme } from '@chakra-ui/react';
import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import 'react-querybuilder/query-builder.scss';
import { QueryBuilderChakra } from '../src';
import { ColorModeButton } from '../src/snippets/color-mode';
import { Provider } from '../src/snippets/provider';
import './styles.scss';

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <Provider>
        <Theme colorPalette="teal">
          <Flex justify="flex-end">
            <ColorModeButton />
          </Flex>
          <QueryBuilderChakra>
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
          </QueryBuilderChakra>
        </Theme>
      </Provider>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
