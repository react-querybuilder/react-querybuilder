import { useSyncExternalStore } from 'react';

const emptySubscribe = () => () => {};

export const ClientOnly = ({ children }: { children: React.ReactNode }) => {
  const value = useSyncExternalStore(
    emptySubscribe,
    () => 'client',
    () => 'server'
  );

  return value === 'client' ? <>{children}</> : null;
};
