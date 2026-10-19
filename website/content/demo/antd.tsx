/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { AntDValueSelector, QueryBuilderAntD } from '@react-querybuilder/antd';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import { theme } from 'antd';
import { useEffect, useState } from 'react';
import type { ValueSelectorProps } from 'react-querybuilder';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-antd.css';

const { defaultAlgorithm, darkAlgorithm } = theme;

const AntDValueSelectorWrapper = (props: ValueSelectorProps) => (
  <AntDValueSelector {...props} getPopupContainer={() => document.querySelector('#rqb-antd')!} />
);

function ReactQueryBuilderDemo_AntdBrowser() {
  const { colorMode } = useColorMode();
  const [{ ConfigProvider, Demo }, setComponents] = useState<{
    ConfigProvider?: typeof import('antd').ConfigProvider;
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const comps = await Promise.all([import('antd'), import('@site/src/demo/components/Demo')]);
      if (active && !Demo) {
        const [antd, ImportedDemo] = comps;
        setComponents({ ConfigProvider: antd.ConfigProvider, Demo: ImportedDemo.default });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo || !ConfigProvider) return loading;

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
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_AntdBrowser />}</BrowserOnly>
    </Layout>
  );
}
