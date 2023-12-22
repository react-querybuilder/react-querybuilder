/* eslint-disable @typescript-eslint/consistent-type-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import { useColorMode } from '@docusaurus/theme-common';
import { QueryBuilderBootstrap } from '@react-querybuilder/bootstrap';
import Layout from '@theme/Layout';
import 'bootstrap-icons/font/bootstrap-icons.scss';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { Loading } from '../_utils';
import './_styles/demo.scss';
import './_styles/rqb-bootstrap.scss';

const getQueryWrapper =
  ({ colorMode }: { colorMode: 'dark' | 'light' }) =>
  ({ children }: { children: ReactNode }) => <div data-bs-theme={colorMode}>{children}</div>;

function ReactQueryBuilderDemo_BootstrapBrowser() {
  const { colorMode } = useColorMode();
  const [{ Demo }, setComponents] = useState<{
    Demo?: typeof import('./_components/Demo').default;
  }>({});

  const QueryWrapper = useMemo(() => getQueryWrapper({ colorMode }), [colorMode]);

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
    <QueryBuilderBootstrap>
      <Demo variant="bootstrap" queryWrapper={QueryWrapper} />
    </QueryBuilderBootstrap>
  );
}

export default function ReactQueryBuilderDemo_Bootstrap() {
  return (
    <Layout description="React Query Builder Bootstrap Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => <ReactQueryBuilderDemo_BootstrapBrowser />}
      </BrowserOnly>
    </Layout>
  );
}
