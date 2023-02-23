/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { QueryBuilderFluent } from '@react-querybuilder/fluent';
import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-fluent.scss';

function ReactQueryBuilderDemo_FluentBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([(await import('./_components/Demo')).default]);
      const [Demo] = comps;

      if (active) {
        setComponents(() => ({ Demo }));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!Demo) return <Loading />;

  return (
    <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme}>
      <QueryBuilderFluent>
        <Demo variant="fluent" />
      </QueryBuilderFluent>
    </FluentProvider>
  );
}

export default function ReactQueryBuilderDemo_Fluent() {
  return (
    <Layout description="React Query Builder Fluent Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_FluentBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
