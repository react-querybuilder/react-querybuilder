/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBulma } from '@react-querybuilder/bulma';
import Layout from '@theme/Layout';
import React from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-bulma-dark.scss';
import './_styles/rqb-bulma.scss';

export default function ReactQueryBuilderDemo_Bulma() {
  return (
    <Layout description="React Query Builder Bulma Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => {
          const Demo: typeof import('./_components/Demo').default =
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
