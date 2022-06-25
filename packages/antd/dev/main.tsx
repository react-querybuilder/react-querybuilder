import 'antd/dist/antd.compact.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { antdControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App controlElements={antdControlElements} />
  </StrictMode>
);
