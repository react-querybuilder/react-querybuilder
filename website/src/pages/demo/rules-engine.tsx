import BrowserOnly from '@docusaurus/BrowserOnly';
import Layout from '@theme/Layout';
import '@react-querybuilder/core/dist/query-builder.css';
import '@react-querybuilder/rules-engine/dist/rules-engine.css';
import { loading } from '../_utils';

export default function RulesEngineDemoPage() {
  return (
    <Layout description="React Query Builder Rules Engine Demo">
      <BrowserOnly fallback={loading}>
        {() => {
          const RulesEngineDemo = require('./_components/rules-engine/RulesEngineDemo').default;
          return <RulesEngineDemo />;
        }}
      </BrowserOnly>
    </Layout>
  );
}
