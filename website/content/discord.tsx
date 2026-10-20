/* oxlint-disable prefer-global-this */
export const frontmatter = { pageType: 'custom' };

import { Layout } from '@site/src/compat';
import { discordLink } from '@site/src/constants';
import { useEffect } from 'react';

export default function DiscordRedirect() {
  useEffect(() => {
    setTimeout(() => window.location.replace(discordLink), 500);
  }, []);

  return (
    <Layout>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: 'var(--site-spacing)',
        }}>
        Redirecting to{'\u00A0'}
        <a href={discordLink}>React Query Builder Discord server</a>...
      </div>
    </Layout>
  );
}
