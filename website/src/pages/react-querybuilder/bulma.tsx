import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import Layout from '@theme/Layout';
import React from 'react';
import './_styles/demo.scss';
import './_styles/rqb-bulma.scss';

export default function ReactQueryBuilderDemo_Bulma() {
  return (
    <Layout description="React Query Builder Bulma Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-imports
          const Demo: typeof import('./_components/Demo').default =
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('./_components/Demo').default;
          return (
            <QueryBuilderBulma>
              <Demo variant="bulma" />
            </QueryBuilderBulma>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
