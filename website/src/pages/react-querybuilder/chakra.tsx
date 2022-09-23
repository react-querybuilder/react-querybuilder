import BrowserOnly from '@docusaurus/BrowserOnly';
import createEmotionCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import { prefixer } from 'stylis';
import createExtraScopePlugin from 'stylis-plugin-extra-scope';
import './demo.scss';
import './rqb-chakra.scss';

const emotionCache = createEmotionCache({
  key: 'rqb-chakra-emotion-cache',
  stylisPlugins: [createExtraScopePlugin('#rqb-chakra'), prefixer],
});

function ReactQueryBuilderDemo_ChakraBrowser() {
  const { ChakraProvider, extendTheme } =
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    useMemo(() => require('@chakra-ui/react') as typeof import('@chakra-ui/react'), []);
  const { QueryBuilderChakra } = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    () => require('@react-querybuilder/chakra') as typeof import('@react-querybuilder/chakra'),
    []
  );
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
  const Demo = useMemo(() => (require('./_Demo') as typeof import('./_Demo')).default, []);

  const chakraTheme = useMemo(
    () =>
      extendTheme({
        config: { initialColorMode: 'light', useSystemColorMode: false },
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <CacheProvider value={emotionCache}>
      <ChakraProvider theme={chakraTheme}>
        <QueryBuilderChakra>
          <Demo variant="chakra" />
        </QueryBuilderChakra>
      </ChakraProvider>
    </CacheProvider>
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
