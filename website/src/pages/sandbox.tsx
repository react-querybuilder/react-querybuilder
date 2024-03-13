import Layout from '@theme/Layout';
import queryString from 'query-string';
import { useEffect, useState } from 'react';

const csbTemplateLink =
  'https://githubbox.com/react-querybuilder/react-querybuilder/tree/main/examples/_template?file=/src/App.tsx';
const sbTemplateLink =
  'https://stackblitz.com/github/react-querybuilder/react-querybuilder/tree/main/examples/_template?file=src/App.tsx';

export default function SandboxRedirect() {
  const [{ platform, finalLink }, setLinkInfo] = useState({ platform: '', finalLink: '' });

  useEffect(() => {
    const query = queryString.parse(window.location.search);
    const qsTemplate = query.template ?? query.t ?? 'basic-ts';
    const template = Array.isArray(qsTemplate) ? qsTemplate[0] : qsTemplate;
    const qsPlatform = query.platform ?? query.p ?? 'csb';
    const platformPrelim = Array.isArray(qsPlatform) ? qsPlatform[0] : qsPlatform;
    const platform = ['sb', 'stackblitz'].includes(platformPrelim.toLocaleLowerCase())
      ? 'StackBlitz'
      : 'CodeSandbox';
    const finalLink = (platform === 'StackBlitz' ? sbTemplateLink : csbTemplateLink)
      .replace(/\b_template\b/, template)
      .replace(/(\/App.tsx\b)/, template === 'basic' ? '/App.js' : '$1');
    setLinkInfo({ platform, finalLink });
    setTimeout(() => window.location.replace(finalLink), 500);
  }, []);

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'var(--ifm-global-spacing)',
        }}>
        Redirecting to{'\u00a0'}
        <a href={finalLink}>{platform}</a>...
      </div>
    </Layout>
  );
}
