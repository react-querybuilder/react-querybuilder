import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';

const DndApp = () => {
  const [moveWhileDragging, setMoveWhileDragging] = React.useState(true);

  return (
    <QueryBuilderDnD moveWhileDragging={moveWhileDragging}>
      <label>
        <input
          type="checkbox"
          checked={moveWhileDragging}
          onChange={e => setMoveWhileDragging(e.target.checked)}
        />
        <code>moveWhileDragging</code>
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
