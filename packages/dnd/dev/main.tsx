import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';

const DndApp = () => {
  const [waitForDrop, setWaitForDrop] = React.useState(true);

  return (
    <QueryBuilderDnD waitForDrop={waitForDrop}>
      <label>
        <input
          type="checkbox"
          checked={waitForDrop}
          onChange={e => setWaitForDrop(e.target.checked)}
        />
        <code>waitForDrop</code>
      </label>
      <div id="app">
        <App enableDragAndDrop />
      </div>
    </QueryBuilderDnD>
  );
};

createRoot(document.getElementById('app-dnd')!).render(
  <React.StrictMode>
    <DndApp />
  </React.StrictMode>
);
