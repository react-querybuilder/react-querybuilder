import { extendTheme } from '@chakra-ui/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React from 'react';
import './demo.scss';
import './rqb-chakra.scss';

const chakraTheme = extendTheme({
  config: { initialColorMode: 'light', useSystemColorMode: false },
});

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          const { ChakraProvider } =
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
            require('@chakra-ui/react') as typeof import('@chakra-ui/react');
          const { QueryBuilderChakra } =
            // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
            require('@react-querybuilder/chakra') as typeof import('@react-querybuilder/chakra');
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
          const Demo = (require('./_Demo') as typeof import('./_Demo')).default;

          return (
            <ChakraProvider theme={chakraTheme}>
              <QueryBuilderChakra>
                <Demo variant="chakra" />
              </QueryBuilderChakra>
            </ChakraProvider>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
