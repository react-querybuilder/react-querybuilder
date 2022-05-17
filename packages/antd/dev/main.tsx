import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev/App';
import { antdControlElements } from '../src';
import 'antd/dist/antd.compact.css';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App controlElements={antdControlElements} />
  </StrictMode>
);
