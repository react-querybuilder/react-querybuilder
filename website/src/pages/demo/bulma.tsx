/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-bulma-dark.scss';
import './_styles/rqb-bulma.scss';

function ReactQueryBuilderDemo_BulmaBrowser() {
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([(await import('./_components/Demo')).default]);
      if (active && !Demo) {
        const [ImportedDemo] = comps;
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return <Loading />;

  return (
    <QueryBuilderBulma>
      <Demo variant="bulma" />
    </QueryBuilderBulma>
  );
}

export default function ReactQueryBuilderDemo_Bulma() {
  return (
    <Layout description="React Query Builder Bulma Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_BulmaBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
