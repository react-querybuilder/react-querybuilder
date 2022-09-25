import Layout from '@theme/Layout';
import React from 'react';
import Nav from './_components/Nav';
import './_styles/rqb-material.scss';

export default function ReactQueryBuilderDemo_Material() {
  return (
    <Layout wrapperClassName="rqb-material" description="React Query Builder MUI/Material Demo">
      <div>
        <div style={{ width: '100%' }}>
          <Nav variant={'material'} />
        </div>
        <div>🚧 Under construction 🚧</div>
      </div>
    </Layout>
  );
}
