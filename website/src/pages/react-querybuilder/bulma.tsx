import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import Layout from '@theme/Layout';
import React from 'react';
import './demo.scss';
import './rqb-bulma.scss';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
          const Demo: typeof import('./_Demo').default = require('./_Demo').default;
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
