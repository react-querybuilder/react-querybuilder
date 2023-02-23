import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderFluent } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <App
      wrapper={({ children }) => (
        <FluentProvider theme={webLightTheme}>
          <QueryBuilderFluent>{children}</QueryBuilderFluent>
        </FluentProvider>
      )}
    />
  </React.StrictMode>
);
