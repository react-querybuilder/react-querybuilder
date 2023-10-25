/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-blueprint.scss';

function ReactQueryBuilderDemo_BlueprintBrowser() {
  const { colorMode } = useColorMode();
  const [{ QueryBuilderBlueprint, Demo }, setComponents] = useState<{
    QueryBuilderBlueprint?: typeof import('@react-querybuilder/blueprint').QueryBuilderBlueprint;
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([
        (await import('./_components/Demo')).default,
        (await import('@react-querybuilder/blueprint')).QueryBuilderBlueprint,
      ]);
      const [Demo, QueryBuilderBlueprint] = comps;

      if (active) {
        setComponents(() => ({
          Demo,
          QueryBuilderBlueprint,
        }));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!QueryBuilderBlueprint || !Demo) return <Loading />;

  return (
    <div className={colorMode === 'dark' ? 'bp5-dark' : undefined}>
      <QueryBuilderBlueprint>
        <Demo variant="blueprint" />
      </QueryBuilderBlueprint>
    </div>
  );
}

export default function ReactQueryBuilderDemo_Blueprint() {
  return (
    <Layout description="React Query Builder Blueprint Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_BlueprintBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
