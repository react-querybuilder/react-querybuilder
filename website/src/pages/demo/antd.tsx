/* eslint-disable @typescript-eslint/consistent-type-imports */
/* eslint-disable @typescript-eslint/no-var-requires */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import React, { useMemo } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import './_styles/demo.scss';
import './_styles/rqb-antd.scss';

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.getElementById('rqb-antd')} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  const Demo = useMemo(
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
