/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { FluentProvider, webDarkTheme, webLightTheme } from '@fluentui/react-components';
import { QueryBuilderFluent } from '@react-querybuilder/fluent';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import { useEffect, useState } from 'react';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-fluent.css';

function ReactQueryBuilderDemo_FluentBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: D } = await import('@site/src/demo/components/Demo');

      if (active) {
        setComponents(() => ({ Demo: D }));
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  if (!Demo) return loading;

  return (
    <FluentProvider theme={colorMode === 'dark' ? webDarkTheme : webLightTheme}>
      <QueryBuilderFluent>
        <Demo variant="fluent" />
      </QueryBuilderFluent>
    </FluentProvider>
  );
}

export default function ReactQueryBuilderDemo_Fluent() {
  return (
    <Layout description="React Query Builder Fluent Demo">
      <BrowserOnly fallback={loading}>{() => <ReactQueryBuilderDemo_FluentBrowser />}</BrowserOnly>
    </Layout>
  );
}
