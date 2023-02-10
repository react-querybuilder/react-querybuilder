/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import {
  ChakraProvider,
  ColorModeProvider,
  ColorModeScript,
  extendTheme,
  useColorMode as useChakraColorMode,
} from '@chakra-ui/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import Layout from '@theme/Layout';
import React, { useEffect, useMemo, useRef } from 'react';
import './_styles/demo.scss';
import './_styles/rqb-chakra.scss';

const chakraTheme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
});

function ReactQueryBuilderDemo_ChakraBrowser() {
  const { colorMode } = useColorMode();
  const { colorMode: chakraColorMode, setColorMode } = useChakraColorMode();
  const firstRender = useRef(true);

  useEffect(() => {
    const doReload = !firstRender.current && colorMode !== chakraColorMode;
    setColorMode(colorMode);
    if (doReload)
      setTimeout(() => {
        window.location.reload();
      });
    firstRender.current = false;
  }, [chakraColorMode, colorMode, setColorMode]);

  const Demo = useMemo(
    () => (require('./_components/Demo') as typeof import('./_components/Demo')).default,
    []
  );

  return (
    <ChakraProvider theme={chakraTheme} resetCSS={false}>
      <QueryBuilderChakra>
        <Demo variant="chakra" />
      </QueryBuilderChakra>
    </ChakraProvider>
  );
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <ColorModeScript />
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => (
          <ColorModeProvider>
            <ReactQueryBuilderDemo_ChakraBrowser />
          </ColorModeProvider>
        )}
      </BrowserOnly>
    </Layout>
  );
}
