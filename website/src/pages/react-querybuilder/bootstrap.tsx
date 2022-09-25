import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import Layout from '@theme/Layout';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import React from 'react';
import './_styles/demo.scss';
import './_styles/rqb-bootstrap.scss';

export default function ReactQueryBuilderDemo_Bootstrap() {
  return (
    <Layout description="React Query Builder Bootstrap Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/consistent-type-imports
          const Demo: typeof import('./_components/Demo').default =
            // eslint-disable-next-line @typescript-eslint/no-var-requires
            require('./_components/Demo').default;
          return (
            <QueryBuilderBootstrap>
              <Demo variant="bootstrap" />
            </QueryBuilderBootstrap>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
