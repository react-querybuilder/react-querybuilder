/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderTremor } from '@react-querybuilder/tremor';
import Layout from '@theme/Layout';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-tremor.scss';

function ReactQueryBuilderDemo_TremorBrowser() {
  const { colorMode: _cm } = useColorMode();
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
    <QueryBuilderTremor
      controlClassnames={{ fields: 'w-max', operators: 'w-max', combinators: 'w-max' }}>
      <Demo variant="tremor" />
    </QueryBuilderTremor>
  );
}

export default function ReactQueryBuilderDemo_Tremor() {
  return (
    <Layout description="React Query Builder Tremor Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_TremorBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
