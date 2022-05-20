import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { bulmaControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App controlElements={bulmaControlElements} />
  </StrictMode>
);
