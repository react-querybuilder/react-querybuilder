import { DevLayout, useDevApp } from '@rqb-devapp';
import * as React from 'react';
import * as ReactDnD from 'react-dnd';
import * as ReactDnDHTML5Backend from 'react-dnd-html5-backend';
import * as ReactDnDTouchBackend from 'react-dnd-touch-backend';
import { createRoot } from 'react-dom/client';
import type { FlexibleOptionList, FullField } from 'react-querybuilder';
import { formatQuery, isRuleGroup, QueryBuilder } from 'react-querybuilder';
import { QueryBuilderDnD } from '../src/QueryBuilderDnD';
import './styles.scss';

const dnd = { ...ReactDnD, ...ReactDnDHTML5Backend, ...ReactDnDTouchBackend };
const origin = { x: 0, y: 0 };

const CustomDragLayer = React.memo(({ fields }: { fields?: FlexibleOptionList<FullField> }) => {
  const { isDragging, currentOffset, item } = ReactDnD.useDragLayer(monitor => ({
    isDragging: monitor.isDragging(),
    itemType: monitor.getItemType(),
    currentOffset: monitor.getSourceClientOffset(),
    item: monitor.getItem(),
  }));

  const { x, y } = currentOffset ?? origin;

  const divStyle: React.CSSProperties = React.useMemo(
    () => ({
      position: 'fixed',
      pointerEvents: 'none',
      border: '1px solid gray',
      backgroundColor: 'white',
      padding: '4px 8px',
      boxShadow: '2px 2px 6px rgba(0, 0, 0, 0.2)',
      top: y + 14,
      left: x + 14,
      zIndex: 10000,
    }),
    [x, y]
  );

  const innerText = React.useMemo(
    () =>
      item &&
      formatQuery(isRuleGroup(item) ? item : { rules: [item] }, {
        format: 'natural_language',
        fields,
      }),
    [item, fields]
  );

  if (!isDragging || !currentOffset || !item) return null;

  return (
    <div className="custom-drag-layer" style={divStyle}>
      {innerText}
    </div>
  );
});

const App = () => {
  const devApp = useDevApp();

  return (
    <DevLayout {...devApp}>
      <QueryBuilderDnD dnd={dnd} hideDefaultDragPreview>
        <CustomDragLayer fields={devApp.commonRQBProps.fields as FlexibleOptionList<FullField>} />
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
      </QueryBuilderDnD>
    </DevLayout>
  );
};

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
