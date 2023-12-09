/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import Layout from '@theme/Layout';
import { theme } from 'antd';
import { useEffect, useState } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-antd.scss';

const { defaultAlgorithm, darkAlgorithm } = theme;

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.getElementById('rqb-antd')} />
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
      const comps = await Promise.all([
        (await import('antd')).ConfigProvider,
        (await import('./_components/Demo')).default,
      ]);
      if (active && !Demo) {
        const [ImportedConfigProvider, ImportedDemo] = comps;
        setComponents({ ConfigProvider: ImportedConfigProvider, Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return <Loading />;

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
