/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import { BrowserOnly } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import { useEffect, useState } from 'react';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-bulma.scss';

function ReactQueryBuilderDemo_BulmaBrowser() {
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('@site/src/demo/components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return loading;

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
