import type { Slice } from '@reduxjs/toolkit';
import { configureRqbStore } from './configureRqbStore';
import type { RqbStore } from './types';

let _store: RqbStore | null = null;

declare global {
  var __RQB_DEVTOOLS__: boolean | undefined;
}

/**
 * Gets the singleton React Query Builder store instance.
 * DevTools are enabled if either:
 * - process.env.RQB_DEVTOOLS is 'true' (build-time)
 * - window.__RQB_DEVTOOLS__ is truthy (runtime)
 */
export function getRqbStore(devTools?: boolean): RqbStore {
  if (!_store) {
    const devToolsEnabled =
      devTools ||
      process.env.RQB_DEVTOOLS === 'true' ||
      (typeof globalThis !== 'undefined' && globalThis.__RQB_DEVTOOLS__);

    _store = configureRqbStore(devToolsEnabled);
  }
  return _store;
}

/**
 * Injects a slice into the React Query Builder store. Useful for extensions
 * that need to integrate their own state management.
 */
export const injectSlice = (slice: Slice): void => getRqbStore().addSlice(slice);
