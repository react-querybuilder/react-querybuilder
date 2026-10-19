export const frontmatter = { pageType: 'custom' };

import { BrowserOnly } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import { loading } from '@site/src/demo/utils';
import '@site/src/demo/styles/demo.css';

export default function ReactQueryBuilderDemo() {
  return (
    <Layout description="React Query Builder Demo">
      <BrowserOnly fallback={loading}>
        {() => {
          const Demo = require('@site/src/demo/components/Demo').default;
          return <Demo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
