/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { QueryBuilderTremor } from '@react-querybuilder/tremor';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import { useEffect, useState } from 'react';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-tremor.css';

function ReactQueryBuilderDemo_TremorBrowser() {
  const { colorMode: _cm } = useColorMode();
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
    <QueryBuilderTremor
      controlClassnames={{
        fields: 'w-max',
        operators: 'w-max',
        combinators: 'w-max',
        matchMode: 'w-max',
      }}>
      <Demo variant="tremor" />
    </QueryBuilderTremor>
  );
}

export default function ReactQueryBuilderDemo_Tremor() {
  return (
    <Layout description="React Query Builder Tremor Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_TremorBrowser />}</BrowserOnly>
    </Layout>
  );
}
