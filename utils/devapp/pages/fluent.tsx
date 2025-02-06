import { FluentProvider, webLightTheme } from '@fluentui/react-components';
import { QueryBuilderFluent } from '@react-querybuilder/fluent';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './fluent.scss';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <FluentProvider theme={webLightTheme}>
      <QueryBuilderFluent>
        <App />
      </QueryBuilderFluent>
    </FluentProvider>
  </React.StrictMode>
);
