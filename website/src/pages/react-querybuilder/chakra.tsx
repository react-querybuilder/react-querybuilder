import { ChakraProvider, extendTheme } from '@chakra-ui/react';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
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
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
          const Demo: typeof import('./_Demo').default = require('./_Demo').default;
          return (
            <ChakraProvider theme={chakraTheme}>
              <QueryBuilderChakra>
                <Demo variant="chakra" variantClassName="rqb-chakra" />
              </QueryBuilderChakra>
            </ChakraProvider>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
