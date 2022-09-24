import BrowserOnly from '@docusaurus/BrowserOnly';
import { QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import './demo.scss';
import './rqb-antd.less';

function ReactQueryBuilderDemo_AntdBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
  const Demo = useMemo(() => (require('./_Demo') as typeof import('./_Demo')).default, []);
  return (
    <QueryBuilderAntD>
      <Demo variant="antd" />
    </QueryBuilderAntD>
  );
}

export default function ReactQueryBuilderDemo_AntD() {
  return (
    <Layout description="React Query Builder Ant Design Demo">
      <BrowserOnly fallback={<div>Loading...</div>}>
        {() => <ReactQueryBuilderDemo_AntdBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
