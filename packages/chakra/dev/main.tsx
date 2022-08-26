import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev';
import { chakraControlElements } from '../src';
import './styles.scss';

const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <App controlElements={chakraControlElements} />
    </ChakraProvider>
  </React.StrictMode>
);
