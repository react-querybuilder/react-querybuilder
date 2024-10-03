/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable unicorn/prefer-module */
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import { Loading } from '../_utils';
import './_styles/demo.scss';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={<Loading />}>
        {() => {
          const Demo = require('./_components/Demo').default;
          return <Demo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
