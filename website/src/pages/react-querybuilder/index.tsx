import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import React from 'react';
import Demo from './_Demo';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>{() => <Demo />}</BrowserOnly>
    </Layout>
  );
}
