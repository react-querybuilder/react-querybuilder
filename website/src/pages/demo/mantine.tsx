/* oxlint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { MantineProvider } from '@mantine/core';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import Layout from '@theme/Layout';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-mantine.css';

const loading = <Loading />;

function ReactQueryBuilderDemo_MantineBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: Demo } = await import('./_components/Demo');

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
    <>
      <MantineProvider forceColorScheme={colorMode}>
        <QueryBuilderMantine>
          <Demo variant="mantine" />
        </QueryBuilderMantine>
      </MantineProvider>
    </>
  );
}

export default function ReactQueryBuilderDemo_Mantine() {
  return (
    <Layout description="React Query Builder Mantine Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_MantineBrowser />}</BrowserOnly>
    </Layout>
  );
}
