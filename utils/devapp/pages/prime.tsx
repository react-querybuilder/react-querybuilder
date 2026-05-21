import { QueryBuilderPrime } from '@react-querybuilder/prime';
import { PrimeReactProvider } from 'primereact/api';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../App';
import 'primeicons/primeicons.css';
import 'primereact/resources/themes/lara-light-cyan/theme.css';
import './prime.css';

createRoot(document.querySelector('#app')!).render(
  <React.StrictMode>
    <PrimeReactProvider>
      <QueryBuilderPrime>
        <App />
      </QueryBuilderPrime>
    </PrimeReactProvider>
  </React.StrictMode>
);
