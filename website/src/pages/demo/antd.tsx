/* eslint-disable @typescript-eslint/consistent-type-imports */
import '@ant-design/v5-patch-for-react-19';
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import { theme } from 'antd';
import { useEffect, useState } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder/debug';
import { Loading } from '../_utils';
import './_styles/demo.css';
import './_styles/rqb-antd.css';

const { defaultAlgorithm, darkAlgorithm } = theme;

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.querySelector('#rqb-antd')!} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  const { colorMode } = useColorMode();
  const [{ ConfigProvider, Demo }, setComponents] = useState<{
    ConfigProvider?: typeof import('antd').ConfigProvider;
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([import('antd'), import('./_components/Demo')]);
      if (active && !Demo) {
        const [antd, ImportedDemo] = comps;
        setComponents({ ConfigProvider: antd.ConfigProvider, Demo: ImportedDemo.default });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo || !ConfigProvider) return <Loading />;

  return (
    <ConfigProvider
      theme={{
        algorithm: colorMode === 'dark' ? darkAlgorithm : defaultAlgorithm,
      }}>
      <QueryBuilderAntD controlElements={{ valueSelector: AntDValueSelectorWrapper }}>
        <Demo variant="antd" />
      </QueryBuilderAntD>
    </ConfigProvider>
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
