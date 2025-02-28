import { QueryBuilderAntD } from '@react-querybuilder/antd';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import './antd.css';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <QueryBuilderAntD>
      <App />
    </QueryBuilderAntD>
  </React.StrictMode>
);
