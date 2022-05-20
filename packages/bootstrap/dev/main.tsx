import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { bootstrapControlClassnames, bootstrapControlElements } from '../src';
import './styles.scss';

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <App
      controlClassnames={bootstrapControlClassnames}
      controlElements={bootstrapControlElements}
    />
  </StrictMode>
);
