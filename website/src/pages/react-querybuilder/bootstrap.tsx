import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import Layout from '@theme/Layout';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import React from 'react';
import './demo.scss';
import './rqb-bootstrap.scss';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
          const Demo: typeof import('./_Demo').default = require('./_Demo').default;
          return (
            <QueryBuilderBootstrap>
              <Demo variant="bootstrap" variantClassName="rqb-bootstrap" />
            </QueryBuilderBootstrap>
          );
        }}
      </BrowserOnly>
    </Layout>
  );
}
