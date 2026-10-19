/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { MantineProvider } from '@mantine/core';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import { useEffect, useState } from 'react';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-mantine.css';

function ReactQueryBuilderDemo_MantineBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: D } = await import('@site/src/demo/components/Demo');

      if (active) {
        setComponents(() => ({ Demo: D }));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!Demo) return loading;

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
