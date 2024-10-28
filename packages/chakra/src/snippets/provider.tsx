'use client';

import { ChakraProvider, createSystem, defaultConfig, defineRecipe } from '@chakra-ui/react';
import * as React from 'react';
import { ColorModeProvider } from './color-mode';

const buttonRecipe = defineRecipe({
  base: {
    color: 'rebeccapurple',
    fontWeight: 'bold', // Normally "semibold"
  },
});

const chakraTheme = createSystem(defaultConfig, {
  theme: {
    recipes: {
      button: buttonRecipe,
    },
  },
});

export function Provider(props: React.PropsWithChildren): React.JSX.Element {
  return (
    <ChakraProvider value={chakraTheme}>
      <ColorModeProvider>{props.children}</ColorModeProvider>
    </ChakraProvider>
  );
}
