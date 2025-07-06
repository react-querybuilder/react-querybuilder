/* oxlint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import Layout from '@theme/Layout';
import { useEffect, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-bulma.scss';

const loading = <Loading />;

function ReactQueryBuilderDemo_BulmaBrowser() {
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
    <QueryBuilderBulma>
      <Demo variant="bulma" />
    </QueryBuilderBulma>
  );
}

export default function ReactQueryBuilderDemo_Bulma() {
  return (
    <Layout description="React Query Builder Bulma Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_BulmaBrowser />}</BrowserOnly>
    </Layout>
  );
}
