import Layout from '@theme/Layout';
import React, { useEffect } from 'react';

export default function DiscordRedirect() {
  useEffect(() => {
    setTimeout(() => window.location.replace('https://discord.gg/MnAQWyUtEg'), 500);
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
        <a href="https://discord.gg/MnAQWyUtEg">React Query Builder Discord server</a>...
      </div>
    </Layout>
  );
}
