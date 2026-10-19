/* oxlint-disable typescript/consistent-type-imports */
export const frontmatter = { pageType: 'custom' };

import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import { BrowserOnly } from '@site/src/compat';
import { useColorMode } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import { loading } from '@site/src/demo/utils';
import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import '@site/src/demo/styles/demo.css';
import '@site/src/demo/styles/rqb-bootstrap.scss';

const getQueryWrapper =
  ({ colorMode }: { colorMode: 'dark' | 'light' }) =>
  ({ children }: { children: ReactNode }) => <div data-bs-theme={colorMode}>{children}</div>;

function ReactQueryBuilderDemo_BootstrapBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('@site/src/demo/components/Demo').default;
  }>({});

  const QueryWrapper = useMemo(() => getQueryWrapper({ colorMode }), [colorMode]);

  useEffect(() => {
    let active = true;

    (async () => {
      const { default: ImportedDemo } = await import('@site/src/demo/components/Demo');
      if (active && !Demo) {
        setComponents({ Demo: ImportedDemo });
      }
    })();

    return () => {
      active = false;
    };
  }, [Demo]);

  if (!Demo) return loading;

  return (
    <QueryBuilderBootstrap>
      <Demo variant="bootstrap" queryWrapper={QueryWrapper} />
    </QueryBuilderBootstrap>
  );
}

export default function ReactQueryBuilderDemo_Bootstrap() {
  return (
    <Layout description="React Query Builder Bootstrap Demo">
      <BrowserOnly fallback={loading}>
        {() => <ReactQueryBuilderDemo_BootstrapBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
