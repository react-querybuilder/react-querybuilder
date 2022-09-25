import BrowserOnly from '@docusaurus/BrowserOnly';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import './_styles/demo.scss';
import './_styles/rqb-antd-dark.less';
import './_styles/rqb-antd.less';

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.getElementById('rqb-antd')} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  const Demo = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-var-requires, @typescript-eslint/consistent-type-imports
    () => (require('./_components/Demo') as typeof import('./_components/Demo')).default,
    []
  );
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
