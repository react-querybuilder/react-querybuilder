"use client"

import { ChakraProvider, createSystem, defaultConfig } from "@chakra-ui/react"
import { ColorModeProvider } from "./color-mode"

const chakraTheme = createSystem(defaultConfig, {
  theme: {
    recipes: {
      button: {
        // baseStyle: {
        //   color: 'rebeccapurple',
        //   fontWeight: 'bold', // Normally "semibold"
        // },
      },
    },
  },
  // config: {
  //   initialColorMode: 'light',
  //   useSystemColorMode: false,
  // },
});

export function Provider(props: React.PropsWithChildren) {
  return (
    <ChakraProvider value={chakraTheme}>
      <ColorModeProvider>{props.children}</ColorModeProvider>
    </ChakraProvider>
  )
}
