import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from 'react-querybuilder/dev/App';
import { chakraControlElements } from '../src';
import './styles.scss';

const chakraTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
});

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ChakraProvider theme={chakraTheme}>
      <App controlElements={chakraControlElements} />
    </ChakraProvider>
  </StrictMode>
);
