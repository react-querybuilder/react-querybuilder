import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React from 'react';
import './demo.scss';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => {
          // eslint-disable-next-line @typescript-eslint/no-var-requires
          const Demo = require('./_Demo').default;
          return <Demo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
