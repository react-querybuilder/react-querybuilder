/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React from 'react';
import './_styles/demo.scss';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          const Demo = require('./_components/Demo').default;
          return <Demo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
