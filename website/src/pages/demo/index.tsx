import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import { loading } from '../_utils';
import './_styles/demo.css';

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
