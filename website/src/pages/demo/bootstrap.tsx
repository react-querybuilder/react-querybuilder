/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import Layout from '@theme/Layout';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import React from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-bootstrap.scss';

export default function ReactQueryBuilderDemo_Bootstrap() {
  return (
    <Layout description="React Query Builder Bootstrap Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => {
          const Demo: typeof import('./_components/Demo').default =
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
