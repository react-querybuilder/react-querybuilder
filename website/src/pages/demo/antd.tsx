/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import React, { useEffect, useState } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-antd.scss';

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.getElementById('rqb-antd')} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([(await import('./_components/Demo')).default]);
      if (active && !Demo) {
        const [ImportedDemo] = comps;
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return <Loading />;

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
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_AntdBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
