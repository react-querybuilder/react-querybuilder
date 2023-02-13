/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderMantine } from '@react-querybuilder/mantine';
import Layout from '@theme/Layout';
import React from 'react';
import './_styles/demo.scss';
import './_styles/rqb-mantine.scss';

export default function ReactQueryBuilderDemo_Mantine() {
  return (
    <Layout description="React Query Builder Mantine Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          const Demo: typeof import('./_components/Demo').default =
            require('./_components/Demo').default;
          return (
            <QueryBuilderMantine>
              <Demo variant="mantine" />
            </QueryBuilderMantine>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
