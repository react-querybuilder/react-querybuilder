import BrowserOnly from '@docusaurus/BrowserOnly';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import './demo.scss';
import './rqb-antd-dark.less';
import './rqb-antd.less';

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.getElementById('rqb-antd')} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
  const Demo = useMemo(() => (require('./_Demo') as typeof import('./_Demo')).default, []);
  return (
    <QueryBuilderAntD
      controlElements={{
        fieldSelector: AntDValueSelectorWrapper,
        combinatorSelector: AntDValueSelectorWrapper,
        operatorSelector: AntDValueSelectorWrapper,
        valueSourceSelector: AntDValueSelectorWrapper,
      }}>
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
