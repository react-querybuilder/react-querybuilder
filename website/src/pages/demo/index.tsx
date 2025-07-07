/* oxlint-disable typescript/no-require-imports */
import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import { Loading } from '../_utils';
import './_styles/demo.css';

const loading = <Loading />;

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={loading}>
        {() => {
          const Demo = require('./_components/Demo').default;
          return <Demo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
