import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import type { ValueEditorProps, VersatileSelectorProps } from '../src';
import { QueryBuilder, ValueEditor, useValueSelectorAsync } from '../src';
import './styles.scss';

const VSA = (props: VersatileSelectorProps) => {
  const asyncProps = useValueSelectorAsync(props, {
    cacheTTL: 5000,
    getCacheKey: 'field',
    loadOptionList: async () => {
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { name: 'option1', value: 'option1', label: `Option ${crypto.randomUUID().slice(0, 4)}` },
        { name: 'option2', value: 'option2', label: `Option ${crypto.randomUUID().slice(0, 4)}` },
        { name: 'option3', value: 'option3', label: `Option ${crypto.randomUUID().slice(0, 4)}` },
      ];
    },
  });

  return <props.schema.controls.valueSelector {...asyncProps} />;
};

const VE = (props: ValueEditorProps) => <ValueEditor {...props} selectorComponent={VSA} />;

// const controlElements = { operatorSelector: VSA };
const controlElements = { valueEditor: VE };

const App = (): React.JSX.Element => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      {devApp.optVals.independentCombinators ? (
        <QueryBuilder
          key="queryIC"
          {...devApp.commonRQBProps}
          query={devApp.queryIC}
          onQueryChange={devApp.onQueryChangeIC}
          controlElements={controlElements}
        />
      ) : (
        <QueryBuilder
          key="query"
          {...devApp.commonRQBProps}
          query={devApp.query}
          onQueryChange={devApp.onQueryChange}
          controlElements={controlElements}
        />
      )}
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
