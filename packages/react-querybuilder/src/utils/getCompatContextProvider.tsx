import type { FullField } from '@react-querybuilder/core';
import type { ReactNode } from 'react';
import * as React from 'react';
import { QueryBuilderContext } from '../components';
import { useMergedContext } from '../hooks';
import type {
  QueryBuilderContextProps,
  QueryBuilderContextProvider,
  QueryBuilderContextProviderProps,
} from '../types';

export type GetCompatContextProviderProps = QueryBuilderContextProps;

/**
 * Generates a context provider for a compatibility package.
 */
export const getCompatContextProvider = <F extends FullField, O extends string>(
  gccpProps: QueryBuilderContextProps<F, O>
): QueryBuilderContextProvider => {
  const QBContextWrapper = (props: { children: ReactNode }) => {
    const rqbContext = useMergedContext(gccpProps);
    return (
      <QueryBuilderContext.Provider value={rqbContext}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  };

  const QBContextInner = (props: QueryBuilderContextProviderProps) => {
    const rqbContext = useMergedContext(props);

    return (
      <QueryBuilderContext.Provider value={rqbContext}>
        {props.children}
      </QueryBuilderContext.Provider>
    );
  };

  return props => {
    return (
      <QBContextWrapper>
        <QBContextInner {...props}>{props.children}</QBContextInner>
      </QBContextWrapper>
    );
  };
};
