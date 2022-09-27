import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import './_styles/demo.scss';
import './_styles/rqb-chakra.scss';

function ReactQueryBuilderDemo_ChakraBrowser() {
  const { colorMode } = useColorMode();
  const { ChakraProvider, extendTheme } =
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    useMemo(() => require('@chakra-ui/react') as typeof import('@chakra-ui/react'), []);
  const { QueryBuilderChakra } = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    () => require('@react-querybuilder/chakra') as typeof import('@react-querybuilder/chakra'),
    []
  );
  const Demo = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    () => (require('./_components/Demo') as typeof import('./_components/Demo')).default,
    []
  );

  const chakraTheme = useMemo(
    () =>
      extendTheme({
        config: { initialColorMode: colorMode, useSystemColorMode: false },
      }),
    [colorMode, extendTheme]
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
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <ReactQueryBuilderDemo_ChakraBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
