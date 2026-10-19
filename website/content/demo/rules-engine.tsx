export const frontmatter = { pageType: 'custom' };

import { BrowserOnly } from '@site/src/compat';
import { Layout } from '@site/src/compat';
import '@react-querybuilder/core/dist/query-builder.css';
import '@react-querybuilder/rules-engine/dist/rules-engine.css';
import { loading } from '@site/src/demo/utils';

export default function RulesEngineDemoPage() {
  return (
    <Layout description="React Query Builder Rules Engine Demo">
      <BrowserOnly fallback={loading}>
        {() => {
          const RulesEngineDemo =
            require('@site/src/demo/components/rules-engine/RulesEngineDemo').default;
          return <RulesEngineDemo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
