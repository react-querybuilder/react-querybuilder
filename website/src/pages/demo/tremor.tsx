/* oxlint-disable typescript/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderTremor } from '@react-querybuilder/tremor';
import Layout from '@theme/Layout';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-tremor.css';

const loading = <Loading />;

function ReactQueryBuilderDemo_TremorBrowser() {
  const { colorMode: _cm } = useColorMode();
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
