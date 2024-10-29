/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderChakra } from '@react-querybuilder/chakra';
import Layout from '@theme/Layout';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-chakra.scss';

import { ChakraProvider, createSystem, defaultConfig, defineRecipe } from '@chakra-ui/react';
import * as React from 'react';

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

const Provider = (props: React.PropsWithChildren): React.JSX.Element => (
  <ChakraProvider value={chakraTheme}>{props.children}</ChakraProvider>
);

function ReactQueryBuilderDemo_ChakraBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('./_components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return <Loading />;

  return (
    <Provider>
      <div className={colorMode}>
        <QueryBuilderChakra>
          <Demo variant="chakra" />
        </QueryBuilderChakra>
      </div>
    </Provider>
  );
}

export default function ReactQueryBuilderDemo_Chakra() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_ChakraBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
