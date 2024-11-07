import * as React from 'react';
import type { ReactReduxContextValue } from 'react-redux';
import type { RqbState } from './types';
import type { UnknownAction } from '@reduxjs/toolkit';

export const QueryBuilderStateContext: React.Context<ReactReduxContextValue<
  RqbState,
  UnknownAction
> | null> = React.createContext<ReactReduxContextValue<RqbState, UnknownAction> | null>(null);
