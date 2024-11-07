'use client';

import { ChakraProvider, createSystem, defaultConfig } from '@chakra-ui/react';
import * as React from 'react';
import { ColorModeProvider } from './color-mode';

const chakraTheme = createSystem(defaultConfig);

export function Provider(props: React.PropsWithChildren): React.JSX.Element {
  return (
    <ChakraProvider value={chakraTheme}>
      <ColorModeProvider>{props.children}</ColorModeProvider>
    </ChakraProvider>
  );
}
