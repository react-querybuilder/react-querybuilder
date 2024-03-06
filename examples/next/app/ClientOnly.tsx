// This wrapper helps avoid hydration errors in Next.js, making
// sure all child components are only rendered on the client.
// See https://twitter.com/TkDodo/status/1741068994981826947

import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};
const getClientSnapshot = () => 'client';
const getServerSnapshot = () => 'server';

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const value = useSyncExternalStore(
    emptySubscribe,
    getClientSnapshot,
    getServerSnapshot
  );

  return value === 'client' ? <>{children}</> : null;
};
