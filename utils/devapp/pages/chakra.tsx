import { Flex, Theme } from '@chakra-ui/react';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { QueryBuilder } from 'react-querybuilder';
import { ColorModeButton } from '../../../packages/chakra/src/snippets/color-mode';
import { Provider } from '../../../packages/chakra/src/snippets/provider';
import { DevLayout } from '../DevLayout';
import { useDevApp } from '../useDevApp';
import './chakra.css';

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
