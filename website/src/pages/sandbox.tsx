import Layout from '@theme/Layout';
import queryString from 'query-string';
import { useState } from 'react';

const ghPathMain = 'react-querybuilder/react-querybuilder/tree/main/examples/_template';
const ghPathChakra2 = 'react-querybuilder/react-querybuilder-chakra2/tree/main/example';

const getFinalLink = (platform: 'StackBlitz' | 'CodeSandbox', template: string) => {
  let ghPath = template === 'chakra2' ? ghPathChakra2 : ghPathMain;
  ghPath = ghPath.replace('_template', template);
  const fileName = template === 'basic' ? 'App.js' : 'App.tsx';
  return platform === 'StackBlitz'
    ? `https://stackblitz.com/github/${ghPath}?file=src/${fileName}`
    : `https://codesandbox.io/s/github/${ghPath}?file=/src/${fileName}`;
};

export default function SandboxRedirect() {
  const query = queryString.parse(window.location.search);
  const qsTemplate = query.template ?? query.t ?? 'basic-ts';
  const template = Array.isArray(qsTemplate) ? qsTemplate[0]! : qsTemplate;
  const qsPlatform = query.platform ?? query.p ?? 'csb';
  const platformPrelim = Array.isArray(qsPlatform) ? qsPlatform[0]! : qsPlatform;
  const platform = ['sb', 'stackblitz'].includes(platformPrelim.toLocaleLowerCase())
    ? 'StackBlitz'
    : 'CodeSandbox';
  const finalLink = getFinalLink(platform, template);

  const [_timerIsSet] = useState(() => {
    setTimeout(() => window.location.replace(finalLink), 500);
    return true;
  });

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'var(--ifm-global-spacing)',
        }}>
        Redirecting to{'\u00A0'}
        <a href={finalLink}>
          {template} example on {platform}
        </a>
        ...
      </div>
    </Layout>
  );
}
