import * as React from 'react';
import type { ReactReduxContextValue } from 'react-redux';
import type { RqbState } from './types';

export const QueryBuilderStateContext: React.Context<ReactReduxContextValue<RqbState> | null> =
  /* @__PURE__ */ React.createContext<ReactReduxContextValue<RqbState> | null>(null);
