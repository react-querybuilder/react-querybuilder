import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '../../react-querybuilder/dev';
import { QueryBuilderChakra } from '../src';

const chakraTheme = extendTheme({
  components: {
    Button: {
      baseStyle: {
        color: 'rebeccapurple',
        fontWeight: 'bold', // Normally "semibold"
      },
    },
  },
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

createRoot(document.getElementById('app')!).render(
  <React.StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <App wrapper={QueryBuilderChakra} />
    </ChakraProvider>
  </React.StrictMode>
);
